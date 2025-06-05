use digitalmarketplace

CREATE TABLE product_categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL
);


CREATE INDEX IX_ProductCategories_CategoryName ON product_categories (category_name); -- For faster lookups by category name

CREATE TABLE products (
    product_id INT PRIMARY KEY IDENTITY(1,1),
    seller_id INT NOT NULL, 
    category_id INT NOT NULL, 
    product_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    digital_asset_url VARCHAR(255) NOT NULL, 
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id),
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
);

ALTER TABLE products
ADD status VARCHAR(20) NOT NULL CONSTRAINT DF_products_status DEFAULT 'pending';

ALTER TABLE products
ADD CONSTRAINT CHK_products_status
CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE products
ADD activation_status VARCHAR(20) NOT NULL 
    CONSTRAINT DF_products_activation_status DEFAULT 'active',
    CONSTRAINT CHK_products_activation_status CHECK (activation_status IN ('active', 'inactive'));



ALTER TABLE products
ADD sellCount INT NOT NULL DEFAULT 0;

ALTER TABLE products
add seller_price AS CAST(price * 0.9 AS DECIMAL(10,2));

ALTER TABLE products
ADD platform_price AS CAST(price * 0.1 AS DECIMAL(10,2));


CREATE INDEX IX_Products_SellerId ON products (seller_id); -- For faster filtering by seller
CREATE INDEX IX_Products_CategoryId ON products (category_id); -- For faster filtering by category
CREATE INDEX IX_Products_ProductName ON products (product_name);  -- For faster lookups by product name

CREATE TABLE product_images (
    image_id INT PRIMARY KEY IDENTITY(1,1),
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Indexes for 'product_images' table
CREATE INDEX IX_ProductImages_ProductId ON product_images (product_id); -- For faster retrieval of images for a product
