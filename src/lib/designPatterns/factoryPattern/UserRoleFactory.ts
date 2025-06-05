// lib/UserRoleFactory.ts

import sql from 'mssql';

export interface IUserRole {
    insertRoleSpecificData(pool: sql.ConnectionPool, user_id: number): Promise<void>;
}

export class Customer implements IUserRole {
    async insertRoleSpecificData(pool: sql.ConnectionPool, user_id: number): Promise<void> {
        console.log('Customer: Inserting into customers table');
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO customers (user_id) VALUES (@user_id)');
    }
}

export class Seller implements IUserRole {
    async insertRoleSpecificData(pool: sql.ConnectionPool, user_id: number): Promise<void> {
        console.log('Seller: Inserting into sellers table');
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO sellers (user_id) VALUES (@user_id)');
    }
}

export class Admin implements IUserRole {
    async insertRoleSpecificData(pool: sql.ConnectionPool, user_id: number): Promise<void> {
        console.log('Customer: Inserting into admin table');
        await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('INSERT INTO admins (user_id) VALUES (@user_id)');
    }
}
