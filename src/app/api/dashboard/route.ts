import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { cookies } from 'next/headers';

// Utility function to validate session token from the database
async function getSessionFromDb(sessionToken: string) {
  try {
    const pool = await Database.getInstance();
    const result = await pool.request()
      .input('session_token', sql.VarChar, sessionToken)
      .query('SELECT * FROM sessions WHERE session_token = @session_token');

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error("Database error (getSessionFromDb):", error);
    return null;
  }
}

// Utility function to invalidate previous sessions for a user
async function invalidatePreviousSession(userId: number) {
  try {
    const pool = await Database.getInstance();
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query('DELETE FROM sessions WHERE user_id = @user_id');
  } catch (error) {
    console.error("Database error (invalidatePreviousSession):", error);
  }
}

// GET: Validate session and return user info
export async function GET(req: NextRequest) {
  try {
    const sessionDataCookie = req.cookies.get('session-token')?.value;
    
      const parsedData = JSON.parse(sessionDataCookie as string);

       const sessionToken = parsedData.sessionToken || null;

      console.log('Extracted Session Token: from dashboard route GET', sessionToken);

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token missing' }, { status: 401 });
    }

    const sessionData = await getSessionFromDb(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const pool = await Database.getInstance();
    const userResult = await pool.request()
      .input('user_id', sql.Int, sessionData.user_id)
      .query('SELECT userName FROM users WHERE user_id = @user_id');

    const user = userResult.recordset[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roleResult = await pool.request()
      .input('role_id', sql.Int, user.role_id)
      .query('SELECT role_name FROM user_roles WHERE role_id = @role_id');

    const role = roleResult.recordset[0]?.role_name || 'Unknown';


    const userForResponse = {
      user_id: user.user_id,
      email: user.email,
      userName: user.userName,
      role,
    };

    return NextResponse.json(userForResponse, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Sign out user and invalidate session
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionDataCookie = cookieStore.get('session-token')?.value;
    
      const parsedData = JSON.parse(sessionDataCookie as string);

      const sessionToken = parsedData.sessionToken || null;

      console.log('Extracted Session Token:', sessionToken);

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token missing' }, { status: 400 });
    }

    const sessionData = await getSessionFromDb(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    await invalidatePreviousSession(sessionData.user_id);

    const pool = await Database.getInstance();
    await pool.request()
      .input('session_token', sql.VarChar, sessionToken)
      .query('DELETE FROM sessions WHERE session_token = @session_token');

    const response = NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
    response.cookies.set('session-token', '', { path: '/', maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Error in POST /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
