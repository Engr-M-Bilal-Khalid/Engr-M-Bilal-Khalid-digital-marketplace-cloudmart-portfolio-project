import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

async function createNewCartWithSessionId(): Promise<{ sessionId: string, cartId: number }> {
    const sessionId = uuidv4();
    console.log(sessionId);
    try {
        const pool = await Database.getInstance();
        const query = 'INSERT INTO carts (session_id) OUTPUT INSERTED.session_id, INSERTED.cart_id VALUES (@sessionId)'
        const result = await pool.request().input('sessionId', sessionId).query(query);
        if (result.recordset.length > 0) {
            return {
                sessionId: result.recordset[0].session_id,
                cartId: result.recordset[0].cart_id
            };
        } else {
            throw new Error("Failed to insert new cart record.");
        }
    } catch (error) {
        console.error("Error creating cart with session ID (MSSQL):", error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const newCart = await createNewCartWithSessionId();
        console.log(newCart.cartId, newCart.sessionId);
        return NextResponse.json(
            { cartId: newCart?.cartId ,sessionId:newCart?.sessionId,status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create session and cart" }, { status: 500 });
    }
}