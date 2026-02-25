// main/index.js
import { app, BrowserWindow, ipcMain } from 'electron';
import connectDB from './db.js';

let globalDbClient;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: `${__dirname}/../preload/index.js`,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(`${__dirname}/../renderer/index.html`);
  }

  mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  try {
    globalDbClient = await connectDB();
    console.log('✅ База данных подключена');
  } catch (err) {
    console.error('❌ Ошибка подключения:', err.message);
    app.quit();
    return;
  }

  createWindow();

  // Авторизация
  ipcMain.handle('authorizeUser', async (event, userData) => {
    try {
      const res = await globalDbClient.query(
        'SELECT роль_сотрудника as role, фио as fullname FROM "Пользователи" WHERE логин = $1 AND пароль = $2',
        [userData.login, userData.password]
      );
      return res.rows[0];
    } catch (err) {
      throw new Error('Неверный логин или пароль');
    }
  });

  // Получить товары
ipcMain.handle('getGoods', async () => {
  const result = await globalDbClient.query(`
    SELECT 
      t.id,
      t.артикул AS article,
      t.наименование_товара AS name,
      t.единица_измерения AS unit,
      t.цена AS price,
      pr.наименование_производителя AS manufacturer,
      ps.наименование_поставщика AS supplier,
      ct.наименование_категории AS category,
      t.действующая_скидка AS discount,
      t.кол_во_на_складе AS quantity,
      t.описание_товара AS description,
      t.путь_к_фото AS image_path
    FROM "Товары" t
    JOIN "Категории товаров" ct ON t.категория_товара_id = ct.id
    JOIN "Производители" pr ON t.производитель_id = pr.id
    JOIN "Поставщики" ps ON t.поставщик_id = ps.id
  `);
  return result.rows;
});

  // CRUD товары
  ipcMain.handle('addGood', async (event, good) => {
    await globalDbClient.query(`
      INSERT INTO "Товары" (
        артикул, наименование_товара, единица_измерения, цена,
        производитель_id, поставщик_id, категория_товара_id,
        действующая_скидка, кол_во_на_складе, описание_товара, путь_к_фото
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      good.article, good.name, good.unit, good.price,
      good.manufacturerId, good.supplierId, good.categoryId,
      good.discount, good.quantity, good.description, good.image_path
    ]);
  });

  ipcMain.handle('updateGood', async (event, good) => {
    await globalDbClient.query(`
      UPDATE "Товары" SET
        наименование_товара=$1, единица_измерения=$2, цена=$3,
        производитель_id=$4, поставщик_id=$5, категория_товара_id=$6,
        действующая_скидка=$7, кол_во_на_складе=$8, описание_товара=$9, путь_к_фото=$10
      WHERE id=$11
    `, [
      good.name, good.unit, good.price,
      good.manufacturerId, good.supplierId, good.categoryId,
      good.discount, good.quantity, good.description, good.image_path, good.id
    ]);
  });

  ipcMain.handle('deleteGood', async (event, id) => {
    try {
      const check = await globalDbClient.query('SELECT * FROM "Заказы" WHERE артикул_заказа LIKE $1', [`%${id}%`]);
      if (check.rows.length > 0) {
        return { success: false, message: 'Товар есть в заказах' };
      }
      await globalDbClient.query('DELETE FROM "Товары" WHERE id = $1', [id]);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Ошибка БД' };
    }
  });

  // Заказы
  ipcMain.handle('getOrders', async () => {
    const res = await globalDbClient.query(`
      SELECT o.*, u.фио as client_name, pp.адрес_пункта_выдачи as pickup_address
      FROM "Заказы" o
      JOIN "Пользователи" u ON o.клиент_id = u.id
      JOIN "Пункты выдачи" pp ON o.пункт_выдачи_id = pp.id
      ORDER BY o.дата_заказа DESC
    `);
    return res.rows;
  });

  ipcMain.handle('addOrder', async (event, data) => {
    const result = await globalDbClient.query('SELECT MAX(id) FROM "Заказы"');
    const nextId = (result.rows[0].max || 0) + 1;
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

    await globalDbClient.query(`
      INSERT INTO "Заказы" (
        номер_заказа, артикул_заказа, дата_заказа, дата_доставки,
        пункт_выдачи_id, клиент_id, код_для_получения, статус_заказа
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      orderNumber, data.items, data.dateCreated, data.deliveryDate,
      data.pickupPointId, data.clientId, data.code, data.status
    ]);
  });

  ipcMain.handle('updateOrder', async (event, data) => {
    await globalDbClient.query(`
      UPDATE "Заказы" SET
        артикул_заказа=$1, дата_заказа=$2, дата_доставки=$3,
        пункт_выдачи_id=$4, клиент_id=$5, код_для_получения=$6, статус_заказа=$7
      WHERE id=$8
    `, [
      data.items, data.dateCreated, data.deliveryDate,
      data.pickupPointId, data.clientId, data.code, data.status, data.id
    ]);
  });

  ipcMain.handle('deleteOrder', async (event, id) => {
    await globalDbClient.query('DELETE FROM "Заказы" WHERE id = $1', [id]);
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
