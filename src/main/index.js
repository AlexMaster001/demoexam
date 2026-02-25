// main/index.js
import { app, BrowserWindow, ipcMain } from 'electron';
import connectDB from './db.js';

let globalDbClient;

// Функция создания окна
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

  // Удалить или закомментировать перед сдачей
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  try {
    globalDbClient = await connectDB();
    console.log('✅ База данных подключена');
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
    app.quit();
    return;
  }

  createWindow();

  // --- IPC Обработчики ---

  // Авторизация пользователя
  ipcMain.handle('authorizeUser', async (event, userData) => {
    try {
      const result = await globalDbClient.query(
        'SELECT role, fullname FROM users WHERE login = $1 AND password = $2',
        [userData.login, userData.password]
      );

      if (result.rows.length > 0) {
        console.log('✅ Авторизация успешна:', result.rows[0]);
        return result.rows[0];
      } else {
        throw new Error('Неверный логин или пароль');
      }
    } catch (err) {
      console.error('❌ Ошибка авторизации:', err.message);
      throw err;
    }
  });

  // Получить все торты (для каталога)
  ipcMain.handle('getGoods', async () => {
    try {
      const result = await globalDbClient.query('SELECT * FROM cakes');
      return result.rows;
    } catch (err) {
      console.error('❌ Ошибка загрузки тортов:', err.message);
      throw err;
    }
  });

  // Добавить торт
  ipcMain.handle('addGood', async (event, good) => {
    try {
      await globalDbClient.query(`
        INSERT INTO cakes (article, name, type, category, description, price, supplier, manufacturer, image_path, discount, quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        good.article, good.name, good.type, good.category, good.description,
        good.price, good.supplier, good.manufacturer, good.image_path,
        good.discount, good.quantity
      ]);
      console.log('✅ Торт добавлен:', good.name);
    } catch (err) {
      console.error('❌ Ошибка при добавлении торта:', err.message);
      throw err;
    }
  });

  // Обновить торт
  ipcMain.handle('updateGood', async (event, good) => {
    try {
      await globalDbClient.query(`
        UPDATE cakes SET name=$1, type=$2, category=$3, description=$4, price=$5,
                          supplier=$6, manufacturer=$7, image_path=$8, discount=$9, quantity=$10
        WHERE id=$11
      `, [
        good.name, good.type, good.category, good.description, good.price,
        good.supplier, good.manufacturer, good.image_path, good.discount, good.quantity, good.id
      ]);
      console.log('✅ Торт обновлён:', good.name);
    } catch (err) {
      console.error('❌ Ошибка при обновлении торта:', err.message);
      throw err;
    }
  });

  // Удалить торт (с проверкой по заказам)
  ipcMain.handle('deleteGood', async (event, id) => {
    try {
      const orderCheck = await globalDbClient.query('SELECT * FROM orders WHERE cake_id = $1', [id]);
      if (orderCheck.rows.length > 0) {
        return { success: false, message: 'Торт нельзя удалить — он есть в заказе' };
      }

      await globalDbClient.query('DELETE FROM cakes WHERE id = $1', [id]);
      return { success: true };
    } catch (err) {
      console.error('❌ Ошибка при удалении торта:', err.message);
      return { success: false, message: 'Ошибка базы данных' };
    }
  });

  // Получить заказы (с джойнами)
  ipcMain.handle('getOrders', async () => {
    try {
      const result = await globalDbClient.query(`
        SELECT o.*, u.fullname as client_name, c.name as cake_name, pp.address as pickup_address, s.name as status
        FROM orders o
        JOIN users u ON o.client_id = u.id
        LEFT JOIN cakes c ON o.cake_id = c.id
        LEFT JOIN pickup_points pp ON o.pickup_point_id = pp.id
        JOIN statuses s ON o.status_id = s.id
        ORDER BY o.created_at DESC
      `);
      return result.rows;
    } catch (err) {
      console.error('❌ Ошибка загрузки заказов:', err.message);
      throw err;
    }
  });

  // Получить клиентов (для формы заказа)
  ipcMain.handle('getUsers', async () => {
    const res = await globalDbClient.query('SELECT id, fullname FROM users WHERE role = $1', ['Авторизованный клиент']);
    return res.rows;
  });

  // Получить только названия тортов (для выпадающего списка)
  ipcMain.handle('getCakesForSelect', async () => {
    const res = await globalDbClient.query('SELECT id, name FROM cakes');
    return res.rows;
  });

  // Получить пункты выдачи
  ipcMain.handle('getPickupPoints', async () => {
    const res = await globalDbClient.query('SELECT id, address FROM pickup_points');
    return res.rows;
  });

  // Получить статусы
  ipcMain.handle('getStatuses', async () => {
    const res = await globalDbClient.query('SELECT id, name FROM statuses');
    return res.rows;
  });

  // Добавить заказ
  ipcMain.handle('addOrder', async (event, data) => {
  // Генерируем номер заказа: например, "ORD-2025-XXXX"
  const result = await globalDbClient.query('SELECT MAX(id) FROM orders');
  const nextId = (result.rows[0].max || 0) + 1;
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

  await globalDbClient.query(`
    INSERT INTO orders (
      order_number, client_id, cake_id, quantity, status_id, delivery_date, pickup_point_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  `, [
    orderNumber,
    data.client_id,
    data.cake_id,
    data.quantity,
    data.status_id,
    data.delivery_date,
    data.pickup_point_id
  ]);
});

  // Обновить заказ
  ipcMain.handle('updateOrder', async (event, data) => {
    await globalDbClient.query(`
      UPDATE orders SET client_id=$1, cake_id=$2, quantity=$3, status_id=$4, delivery_date=$5, pickup_point_id=$6
      WHERE id=$7
    `, [
      data.client_id,
      data.cake_id,
      data.quantity,
      data.status_id,
      data.delivery_date,
      data.pickup_point_id,
      data.id
    ]);
  });

  // Удалить заказ
  ipcMain.handle('deleteOrder', async (event, id) => {
    await globalDbClient.query('DELETE FROM orders WHERE id = $1', [id]);
  });
});

// Активация приложения (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Закрытие всех окон → выход из приложения
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
