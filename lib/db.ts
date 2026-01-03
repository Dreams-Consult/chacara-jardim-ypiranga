import mysql from 'mysql2/promise';

export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function createConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows as T;
  } finally {
    await connection.end();
  }
}
