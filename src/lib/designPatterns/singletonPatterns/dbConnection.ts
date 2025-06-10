import sql from 'mssql';

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
      encrypt: true,
      trustServerCertificate: true,
      connectTimeout: 30000,
    },
  };

class Database {
  private static instance: sql.ConnectionPool;

  private constructor() {}

  public static async getInstance(): Promise<sql.ConnectionPool> {
    if (!Database.instance) {
      try {
        Database.instance = await new sql.ConnectionPool(config).connect();
        console.log('✅ Connected to SQL Server');
      } catch (error: any) {
        console.error('❌ Failed to connect to SQL Server:', error.message);
        console.error('Full error stack:', error.stack);
        throw error; 
      }
    }
    return Database.instance;
  }
}

export default Database;
