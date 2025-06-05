import { NextRequest, NextResponse } from "next/server";
import Database from '@/lib/designPatterns/singletonPatterns/dbConnection';
import { stripe, CreateStripeProduct } from "@/lib/stripe/stripe";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { ConnectionPool } from "mssql";
import path from 'path';
import fs from 'fs';


async function createStripeProduct({ productName, productDescription, productPrice, stripeAccount, imageUrl }: CreateStripeProduct) {
    const stripeProduct = await stripe.products.create(
        {
            name: productName,
            description: productDescription,
            images: imageUrl
        },
        {
            stripeAccount,
        }
    );
    const stripePrice = await stripe.prices.create(
        {
            unit_amount: productPrice * 100,
            currency: "usd",
            product: stripeProduct.id,
        },
        {
            stripeAccount,

        }
    );
    return { stripeProduct, stripePrice };
};



export async function POST(req: NextRequest) {
    let query, request, pool: ConnectionPool, result, sellerId, stripeAccount: string, stripeProductId, stripePriceId, query1;

    const uploadFolder = path.join(process.cwd(), 'public', 'uploads');
    fs.mkdirSync(uploadFolder, { recursive: true });
    try {
        const formData = await req.formData(); // Read the entire body as FormData

        // Extract text fields from FormData
        const productName = formData.get('productName') as string;
        const productCategory = parseInt(formData.get('productCategory') as string);
        const productDescription = formData.get('productDescription') as string | undefined;
        const productPrice = parseInt(formData.get('productPrice') as string);
        const userId = parseInt(formData.get('userId') as string);
        const digitalAssetFolder = formData.get('asset_folder') as File;
        const files = formData.getAll('images') as File[];

        if (!digitalAssetFolder || !digitalAssetFolder.name.endsWith('.zip')) {
            return NextResponse.json({ error: 'Only .zip digitalAssetFolders are allowed' }, { status: 400 });
        }

        const arrayBuffer = await digitalAssetFolder.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const digitalAssetFoldername = `${Date.now()}-${digitalAssetFolder.name}`;
        const digitalAssetFolderPath = path.join(uploadFolder, digitalAssetFoldername);
        fs.writeFileSync(digitalAssetFolderPath, buffer);

        const digitalAssetUrl = `/uploads/${digitalAssetFoldername}`;
        console.log(digitalAssetUrl);

        pool = await Database.getInstance();

        query = 'select seller_id,stripe_account_id from sellers where user_id = @userId';
        request = pool.request();
        result = await request.input('userId', userId).query(query);
        sellerId = result.recordset[0].seller_id;
        stripeAccount = result.recordset[0].stripe_account_id;
        console.log('Seller ID:', sellerId);
        console.log('Stripe Account ID:', stripeAccount);

        query = `INSERT INTO products (product_name, category_id, description, price, seller_id)
        VALUES (@productName, @productCategory, @productDescription, @productPrice, @sellerId);
        SELECT SCOPE_IDENTITY() AS product_id`;
        request = pool.request();
        result = await request.input('productName', productName).input('productCategory', productCategory).input('productDescription', productDescription || '').input('productPrice', productPrice).input('sellerId', sellerId).query(query);

        const newProductId = result.recordset[0].product_id;
        console.log('Newly created Product ID:', newProductId);

        const uploads = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'products' },
                        async (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                const url = result?.secure_url || '';
                                const public_id = result?.public_id || '';

                                console.log('Uploaded Image:');
                                console.log('➡️ URL:', url);
                                console.log('🆔 Public ID:', public_id);

                                const now: Date = new Date();

                                query1 = 'Insert into product_images (product_id,image_url,uploaded_at,public_id) values(@newProductId,@url,@now,@public_id)';

                                await pool.request().input('newProductId', newProductId).input('url', url).input('now', now).input('public_id', public_id).query(query1);


                                console.log('Image URL and public ID saved to database.');
                                resolve({ url, public_id });
                            }
                        }
                    );

                    const { Readable } = require('stream');
                    const readable = new Readable();
                    readable.push(buffer);
                    readable.push(null);
                    readable.pipe(stream);
                });
            })
        );

        const imageUrl: string[] = uploads.map(upload => upload.url);



        const stripeResult = await createStripeProduct({ productName, productDescription, productPrice, stripeAccount, imageUrl });

        stripeProductId = stripeResult.stripeProduct.id;
        stripePriceId = stripeResult.stripePrice.id;

        query = 'UPDATE products SET stripe_product_id = @stripeProductId, stripe_price_id = @stripePriceId , digital_asset_url = @digitalAssetUrl  WHERE product_id = @newProductId';
        request = pool.request();
        result = await request.input('stripeProductId', stripeProductId).input('stripePriceId', stripePriceId).input('newProductId', newProductId).input('digitalAssetUrl',digitalAssetUrl).query(query);

        console.log(`AssetUrl : ${result}`);

        return NextResponse.json({ message: 'Product created successfully Save in db and Stripedashboard', data: result.recordset, uploads }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}