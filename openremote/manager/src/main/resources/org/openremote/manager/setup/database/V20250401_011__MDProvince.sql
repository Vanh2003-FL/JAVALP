create table md_province (
                             province_id SERIAL PRIMARY KEY,
                             province_name VARCHAR(255) NOT NULL,
                             active INT DEFAULT 1,
                             deleted INT DEFAULT 0,
                             create_date TIMESTAMPTZ,
                             create_by VARCHAR(255),
                             update_date TIMESTAMP,
                             update_by VARCHAR(255)
);

CREATE TABLE md_district (
                             district_id SERIAL PRIMARY KEY,
                             district_name VARCHAR(255) NOT NULL,
                             province_id INT NOT NULL,
                             active INT DEFAULT 1,
                             deleted INT DEFAULT 0,
                             create_date TIMESTAMP,
                             create_by VARCHAR(255),
                             update_date TIMESTAMP,
                             update_by VARCHAR(255)
);

CREATE TABLE md_ward (
                         ward_id SERIAL PRIMARY KEY,
                         ward_name VARCHAR(255) NOT NULL,
                         district_id INT NOT NULL,
                         active INT DEFAULT 1,
                         deleted INT DEFAULT 0,
                         create_date TIMESTAMP,
                         create_by VARCHAR(255),
                         update_date TIMESTAMP,
                         update_by VARCHAR(255)
);
