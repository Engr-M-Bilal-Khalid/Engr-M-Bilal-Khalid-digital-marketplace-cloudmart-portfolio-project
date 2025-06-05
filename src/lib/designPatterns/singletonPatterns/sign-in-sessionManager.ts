import sql from 'mssql';
import crypto from 'crypto';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection'; 


const formatter = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

class SessionManager {
  private static instance: SessionManager;

  private constructor() { }

  // Singleton pattern to ensure only one instance of the SessionManager is created
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
      console.log("✅ SessionManager instance created using Singleton pattern.");
    }
    return SessionManager.instance;
  }

  // Method to create a session for a user
  public async createSession(userId: number): Promise<string> {
    const pkOffsetMs = 5 * 60 * 60 * 1000;
    const nowUTC = new Date();
    const pool = await Database.getInstance();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const createdAt = new Date(nowUTC.getTime() + pkOffsetMs);
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hour expiration
    const createdAtFormatted = formatter.format(createdAt);
    const expiresAtFormatted = formatter.format(expiresAt);

    // Check if a session already exists for this user and delete old session if found
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM sessions WHERE user_id = @user_id');

    // Insert new session for the user
    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('session_token', sql.VarChar, sessionToken)
      .input('created_at', sql.DateTime, createdAt)
      .input('expires_at', sql.DateTime, expiresAt)
      .query(`
        INSERT INTO sessions (user_id, session_token,created_at, expires_at)
        VALUES (@user_id, @session_token,@created_at, @expires_at)
      `);

    console.log("✅ Session token stored in database successfully.");
    console.log('Created At (PKT):', createdAtFormatted); // Display for user
    console.log('Expires At (PKT +1hr):', expiresAtFormatted); // Display for user
    return sessionToken;
  }

  // Method to get the session of a user
  public async getSession(userId: number): Promise<any> {
    const pool = await Database.getInstance();
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query('SELECT * FROM sessions WHERE user_id = @user_id');

    return result.recordset.length > 0 ? result.recordset[0] : null;
  }


  public async extendSession(userId: number): Promise<void> {
    const pool = await Database.getInstance();
    const newExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); 

    await pool.request()
      .input('user_id', sql.Int, userId)
      .input('expires_at', sql.DateTime, newExpiry)
      .query('UPDATE sessions SET expires_at = @expires_at WHERE user_id = @user_id');
  }


  public async clearSession(userId: number): Promise<void> {
    const pool = await Database.getInstance();
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM sessions WHERE user_id = @user_id');
  }
}

export default SessionManager;
