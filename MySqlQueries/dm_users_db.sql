use digitalmarketplace

CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    userName VARCHAR(255) unique not null,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login_at DATETIME NULL,
    login_attempts INT NOT NULL DEFAULT 0,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    login_count INT NOT NULL DEFAULT 0,
	verification_code VARCHAR(255) NULL, 
    code_timestamp DATETIME NULL,       
    code_expiration DATETIME NULL,
    reset_password_token varchar(255) NULL,
    reset_password_token_timestamp DATETIME NULL,
    reset_password_token_expiration DATETIME NULL,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);

CREATE INDEX IX_Users_UserName ON users (userName); 
CREATE INDEX IX_Users_Email ON users (email);      
CREATE INDEX IX_Users_RoleId ON users (role_id);   

CREATE TABLE user_roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(255),
    CONSTRAINT CHK_RoleName CHECK (role_name IN ('owner', 'admin', 'seller', 'customer'))
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for 'customers' table
CREATE INDEX IX_Customers_UserId ON customers (user_id); -- Foreign key, for joins



CREATE TABLE sellers (
    seller_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    stripe_account_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

select * from sellers
select * from admins
select * from users

UPDATE sellers SET status = 'verified' WHERE user_id = 74

select status from sellers where user_id = 74

ALTER TABLE sellers
drop column status VARCHAR(20) NOT NULL DEFAULT 'not_verified'
CHECK (status IN ('verified', 'not_verified'));

-- Indexes for 'sellers' table
CREATE INDEX IX_Sellers_UserId ON sellers (user_id); -- Foreign key, for joins


CREATE TABLE admins (
    admin_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for 'admins' table
CREATE INDEX IX_Admins_UserId ON admins (user_id); -- Foreign key, for joins


CREATE TABLE owners (
    owner_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for 'owners' table
CREATE INDEX IX_Owners_UserId ON owners (user_id); -- Foreign key, for joins



CREATE TABLE sessions (
    session_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for 'sessions' table
CREATE INDEX IX_Sessions_UserId ON sessions (user_id); -- Foreign key, for joins
CREATE INDEX IX_Sessions_ExpiresAt ON sessions(expires_at); --For deleting/ Expiring sessions.


--//Procedures

CREATE PROCEDURE DeleteCust (@userId INT)
AS
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = @userId)
    BEGIN
        SELECT 'Error' AS Status, 'User not found.' AS Message;
        RETURN;
    END
    BEGIN TRANSACTION;

    BEGIN TRY
        DELETE FROM sessions
        WHERE user_id = @userId;

        DELETE FROM customers
        WHERE user_id = @userId;

        DELETE FROM users
        WHERE user_id = @userId;

        COMMIT TRANSACTION;

        SELECT 'Success' AS Status;
    END TRY
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT 'Error' AS Status, ERROR_MESSAGE() AS Message, ERROR_NUMBER() AS ErrorNumber;
        RETURN;
    END CATCH
END;


EXECUTE  DeleteCust @userId = 75;

select * from users


update sellers set status = 'verified' output inserted.status where user_id = 89




