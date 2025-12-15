CREATE TABLE IF NOT EXISTS md_supplier(
                             supplier_id SERIAL PRIMARY KEY,
                             supplier_code VARCHAR(50) NOT NULL,
                             supplier_name VARCHAR(250) NOT NULL,
                             active INTEGER NOT NULL DEFAULT 1,
                             deleted INTEGER NOT NULL DEFAULT 0,
                             create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             create_by VARCHAR(36) NOT NULL,
                             update_date TIMESTAMP,
                             update_by VARCHAR(36)
);

