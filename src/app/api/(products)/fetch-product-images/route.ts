import { NextRequest, NextResponse } from 'next/server';
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {productId} = body;
        const pool = await Database.getInstance();
        console.log('Connected to SQL Server for image upload.');

        const result = await pool.request()
            .input('productId', productId)
            .query('SELECT image_url FROM product_images WHERE product_id = @productId');

        return NextResponse.json({ success: true, images: result.recordset });
    } catch (error: any) {
        console.error('❌ DB Fetch Error:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
