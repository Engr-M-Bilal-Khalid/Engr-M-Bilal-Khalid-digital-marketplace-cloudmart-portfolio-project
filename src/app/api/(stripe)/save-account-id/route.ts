import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import sql from 'mssql';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';

const saveUserAccountIdSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
});

export async function POST(req: NextRequest) {
  let query, body, pool, result;
  try {
    body = await req.json();
    const { userId, accountId} = saveUserAccountIdSchema.parse(body);
    pool = await Database.getInstance();

    query = 'UPDATE sellers SET stripe_account_id = @accountId  WHERE user_id = @userId';
    result = await pool.request().input('accountId', sql.VarChar, accountId).input('userId', sql.VarChar, userId).query(query);
   
    console.log('Update Result:', result);

    // Check the number of rows affected instead of accessing recordset
    if (result?.rowsAffected[0] > 0) {
      return NextResponse.json({ message: 'Stripe account ID updated successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No user found with the provided ID to update' }, { status: 404 });
    }
  } catch (error) {
    console.error('Fetch Products Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Internal server error', error: (error instanceof Error ? error.message : 'An unexpected error occurred') },
      { status: 500 }
    );
  }
}