// app/api/test-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
export async function GET(req: NextRequest) {
  try {
    const db = await Database.getInstance();
    const result = await db.query('SELECT * from users');
    const currentDate = result.recordset[0]?.CurrentDate;
    return NextResponse.json({ success: true, currentDate });
  } catch (error: any) {
    console.error('Error during database connection test:', error.message);
    console.error('Full error stack:', error.stack);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
