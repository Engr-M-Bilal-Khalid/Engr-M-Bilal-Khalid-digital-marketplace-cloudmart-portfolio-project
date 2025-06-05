import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import sql from 'mssql';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

async function getSessionIdFromDbForCustomer(sessionToken: string) {
  try {
    const pool = await Database.getInstance();
    const result = await pool.request()
      .input('session_token', sql.VarChar, sessionToken)
      .query('select s.session_id,s.user_id,c.customer_id from sessions s join customers c on s.user_id = c.user_id where session_token =  @session_token');
      console.log(result.recordset[0])
    return result.recordset.length > 0 ? result.recordset[0] : null;

  } catch (error) {
    console.error("Database error (getSessionFromDb):", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let sessionDataCookie = cookieStore.get('session-token')?.value  || null;

    if(sessionDataCookie){
      const parsedData = JSON.parse(sessionDataCookie);

    const sessionToken = parsedData.sessionToken || null;

    console.log('Extracted Session Token:', sessionToken);

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token missing' }, { status: 400 });
    }

    const sessionData = await getSessionIdFromDbForCustomer(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    return NextResponse.json({ sessionData, status: 200 });
    }
    else{
      console.log(`Session Data Cookie not found!`)
    return NextResponse.json({ error:'sessionDataCookie not found!' },{status: 400});
    }
  } catch (error) {
    console.error('Error in POST /api/sessionId-validation-for-customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
