
CREATE TABLE IF NOT EXISTS md_lamp_type (
                              id serial4 PRIMARY KEY,
                              lamp_type_code VARCHAR(30),
                              lamp_type_name VARCHAR(250),
                              power_consumption INT,
                              luminous_flux INT,
                              life_hours INT DEFAULT 0,
                              active INT DEFAULT 1,
                              deleted INT DEFAULT 0,
                              create_date TIMESTAMP,
                              create_by VARCHAR(36),
                              update_date TIMESTAMP,
                              update_by VARCHAR(36)
);

CREATE TABLE IF NOT EXISTS route_lamppost_detail (
                                       id BIGINT PRIMARY KEY,
                                       lamppost_id BIGINT NOT NULL,
                                       asset_id VARCHAR(22) NOT NULL,
                                       lamp_type_id INT NOT NULL DEFAULT 0,
                                       start_date DATE NOT NULL DEFAULT DATE '1970-01-01', -- hoặc '1970-01-01' nếu '0000-01-01' không hợp lệ
                                       end_date DATE NOT NULL DEFAULT DATE '2199-01-01',
                                       description VARCHAR(250),
                                       create_date TIMESTAMP NOT NULL,
                                       create_by VARCHAR(36) NOT NULL
);

CREATE TABLE IF NOT EXISTS route_lamppost (
                                lamppost_id BIGINT PRIMARY KEY,
                                route_id VARCHAR(22) NOT NULL,
                                energy_actual_D NUMERIC(10,2) NOT NULL DEFAULT 0,
                                energy_actual_M NUMERIC(10,2) NOT NULL DEFAULT 0,
                                active BOOLEAN NOT NULL DEFAULT FALSE,
                                description VARCHAR(250),
                                create_date TIMESTAMP NOT NULL,
                                create_by VARCHAR(36) NOT NULL,
                                update_date TIMESTAMP NOT NULL
);






