USE digitalmarketplace;

CREATE TABLE carts (
    cart_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT NULL,      -- Nullable for guests
    session_id VARCHAR(255) NULL, -- Nullable for logged-in users
	payment_status VARCHAR(10) NOT NULL DEFAULT 'unpaid',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT CHK_CustomerOrSession CHECK (
        (customer_id IS NOT NULL) OR (session_id IS NOT NULL)
    ),
	CONSTRAINT CHK_PaymentStatus CHECK (
        payment_status IN ('paid', 'unpaid')
    )
);

CREATE INDEX IX_Carts_CustomerId ON carts(customer_id);
CREATE INDEX IX_Carts_SessionId ON carts(session_id);

CREATE TABLE cart_items (
    item_id INT PRIMARY KEY IDENTITY(1,1),
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE INDEX IX_CartItems_CartId ON cart_items(cart_id);
CREATE INDEX IX_CartItems_ProductId ON cart_items(product_id);


CREATE TABLE orders (
    order_id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT NULL,
	cart_id Int null,
    order_date DATETIME  NULL DEFAULT GETDATE(),
    order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10, 2)  NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Stripe',  -- Set default to Stripe
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
	FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    CONSTRAINT CHK_OrderStatus CHECK (order_status IN ('Delivered','Pending')),
)

ALTER TABLE orders
ADD seller_amount AS (total_amount * 0.90) PERSISTED,
    platform_fee AS (total_amount * 0.10) PERSISTED;

-- Index on customer_id to speed up customer order lookups
CREATE NONCLUSTERED INDEX IDX_Orders_CustomerId ON orders(customer_id);

-- Optional: Index on order_status if you frequently filter by status
CREATE NONCLUSTERED INDEX IDX_Orders_Status ON orders(order_status);


CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity = 1),
    price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Index on order_id to quickly fetch items for a specific order
CREATE NONCLUSTERED INDEX IDX_OrderItems_OrderId ON order_items(order_id);

-- Index on product_id if you often search or aggregate data by product
CREATE NONCLUSTERED INDEX IDX_OrderItems_ProductId ON order_items(product_id);

