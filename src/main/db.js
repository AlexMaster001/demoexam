// main/db.js
import { Pool } from 'pg';

export default async () => {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'velodrive', // ← Убедись, что имя БД правильное
    password: '1234',  // ← Пароль от PostgreSQL
    port: 5432,
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL подключена');
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  }

  return pool;
};
