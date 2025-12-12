CREATE TABLE route_info
(
    id          VARCHAR(22) PRIMARY KEY,
    route_code  VARCHAR(30),
    route_name  VARCHAR(250),
    realm       VARCHAR(255),
    province_id INT,
    district_id INT,
    ward_id     SMALLINT,
    street_name VARCHAR(50),
    address     VARCHAR(500),
    status      VARCHAR(5),
    active_date timestamp,
    deleted     BOOLEAN DEFAULT FALSE,
    description VARCHAR(250),
    create_date timestamp,
    create_by   VARCHAR(36),
    update_date timestamp,
    update_by   VARCHAR(36)
);


CREATE TABLE route_assets
(
    id                BIGSERIAL PRIMARY KEY,
    route_id          VARCHAR(22),
    asset_id          VARCHAR(22),
    sys_asset_type_id INT8,
    active_date       TIMESTAMPTZ,
    deactive_date     TIMESTAMPTZ,
    deleted           BOOLEAN DEFAULT FALSE,
    description       VARCHAR(250),
    create_date       timestamp,
    create_by         VARCHAR(36),
    update_date       timestamp,
    update_by         VARCHAR(36),
    CONSTRAINT unique_route_asset UNIQUE (route_id, asset_id)
);

ALTER TABLE asset_info
-- Thêm các cột mới
    ADD COLUMN province_id INT,
ADD COLUMN district_id INT,
ADD COLUMN ward_id SMALLINT,
ADD COLUMN street_name VARCHAR(50),
ADD COLUMN address VARCHAR(500),
ADD COLUMN status VARCHAR(5),
ADD COLUMN supplier_id INT,
ADD COLUMN firmware_version varchar(10),
ADD COLUMN asset_model varchar(50),
ADD COLUMN serial_number varchar(100),
ADD COLUMN last_maince_date timestamp,
ADD COLUMN next_maince_date timestamp,
ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN description varchar(250);

ALTER TABLE asset_info
DROP
COLUMN cabinet_asset_code;

ALTER TABLE asset_info
DROP
COLUMN is_control_by_cabinet;

ALTER TABLE asset_info
DROP
COLUMN cabinet_id;

ALTER TABLE asset_info
DROP
COLUMN active;


CREATE TABLE asset_cabinet
(
    id                 BIGSERIAL PRIMARY KEY,
    cabinet_id         VARCHAR(22),
    asset_id           VARCHAR(22),
    cabinet_asset_code VARCHAR(5),
    active_date        TIMESTAMPTZ,
    deactive_date      TIMESTAMPTZ DEFAULT '2199-01-01 00:00:00',
    deleted            BOOLEAN     DEFAULT FALSE,
    description        VARCHAR(250),
    create_date        TIMESTAMP,
    create_by          VARCHAR(36),
    update_date        TIMESTAMP,
    update_by          VARCHAR(36),
    CONSTRAINT unique_cabinet_asset UNIQUE (asset_id)
);

