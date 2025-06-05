import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
    let query, request, pool, result;
    try {
        pool = await Database.getInstance();
        query = 'select * from product_categories';
        request = pool.request();
        result = await request.query(query);
        console.log('Update Result:', result);
        return NextResponse.json({ message: 'Product categories fetched successfully', data: result.recordset }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error: (error instanceof Error ? error.message : 'An unexpected error occurred') },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { categoryName, categoryDescription, limit } = body;
    let query, pool, result;
    try {
        pool = await Database.getInstance();
        if (limit) {
            query = `SELECT TOP ${limit} * FROM product_categories`;
            result = await pool.request().query(query);
            return NextResponse.json({ message: 'Product categories fetched successfully according to limit!', data: result.recordset, status: 200 });
        }
        query = `INSERT INTO product_categories (category_name, description,created_at) VALUES (@categoryName, @categoryDescription,@createdAt)`;
        result = await pool.request().input('categoryName', categoryName).input('categoryDescription', categoryDescription).input('createdAt', new Date()).query(query);
        console.log(result);
        return NextResponse.json({ message: 'Product category created successfully', status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error: (error instanceof Error ? error.message : 'An unexpected error occurred') },
            { status: 500 }
        );

    }
}
