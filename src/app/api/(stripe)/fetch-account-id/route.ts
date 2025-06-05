import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';


export async function POST(req: NextRequest) {
    const requestBody = await req.json();
    const { userId, role } = requestBody;
    try {
        let query, request, result, pool;
        pool = await Database.getInstance();
        query = 'SELECT userName FROM users WHERE user_id = @user_id'
        const userName = await pool.request().input('user_id', userId).query(query);
        if (role === 'seller') {
            query = 'Select stripe_account_id from sellers where user_id = @userId';
            request = pool.request();
            const stripeAccountId = await request.input('userId', userId).query(query);
            return NextResponse.json({ message: 'Stripe Id can be null or value', stripeAccountId: stripeAccountId.recordset[0].stripe_account_id, userName: userName.recordset[0].userName });
        }else{
            return NextResponse.json({ message: 'Stripe Id can be null or value', userName: userName.recordset[0].userName });
        }
        
    } catch (err) {
        return NextResponse.json({ error: 'Error occur' }, { status: 500 });
    }
}
