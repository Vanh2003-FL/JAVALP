CREATE TABLE route_asset_group (
                                   id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                                   asset_id VARCHAR(22) NOT NULL,
                                   route_grp_id INT NOT NULL,
                                   is_default BOOLEAN NOT NULL DEFAULT true,
                                   active BOOLEAN NOT NULL DEFAULT true,
                                   create_date DATE NOT NULL,
                                   create_by VARCHAR(36) NOT NULL,
                                   update_date DATE NOT NULL,
                                   update_by VARCHAR(36) NOT NULL
);

CREATE TABLE md_route_group (
                                id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                                route_grp_code VARCHAR(30) NOT NULL,
                                route_grp_name VARCHAR(250) NOT NULL,
                                active BOOLEAN NOT NULL DEFAULT true,
                                create_date DATE NOT NULL,
                                create_by VARCHAR(36) NOT NULL,
                                update_date DATE NOT NULL,
                                update_by VARCHAR(36) NOT NULL
);

