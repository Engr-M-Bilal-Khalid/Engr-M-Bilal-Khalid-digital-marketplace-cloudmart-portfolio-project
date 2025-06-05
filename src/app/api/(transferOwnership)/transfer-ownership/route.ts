import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import Database from "@/lib/designPatterns/singletonPatterns/dbConnection";

export async function POST(req: NextRequest) {
    const { newOwnerName, newOwnerEmail, newOwnerPassword, ownerEmail } = await req.json();
    if (!newOwnerEmail || !newOwnerName || !newOwnerPassword) {
        return NextResponse.json({
            message: 'All fields are required',
            status: 400
        })
    }
    const hashedPassword = await bcrypt.hash(newOwnerPassword, 10);
    const pool = await Database.getInstance();
    const transferRequest = pool.request();
    transferRequest.input('currentOwnerEmail', ownerEmail);
    transferRequest.input('newEmail', newOwnerEmail);
    transferRequest.input('newHashedPassword', hashedPassword);
    transferRequest.input('newUsername', newOwnerName);
    const transferResult = await transferRequest.execute('TransferOwnership');
    const result = transferResult.recordset[0];
    console.log(result);
    return NextResponse.json({
        message: result.Message,
        status: 200
    })
}