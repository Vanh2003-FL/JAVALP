

CREATE TABLE IF NOT EXISTS frw_info (
                                        id SERIAL PRIMARY KEY,
                                        frw_version VARCHAR(30) NOT NULL,
    asset_type VARCHAR(22) NOT NULL,
    sub_asset_type VARCHAR(10) NOT NULL,
    upgrade_date DATE NOT NULL,
    status VARCHAR(5) NOT NULL DEFAULT 'P',
    path_firmware VARCHAR(500) NOT NULL,
    file_name VARCHAR(250) NOT NULL,
    description VARCHAR(500),
    create_date TimeStamp,
    create_by VARCHAR(36),
    update_date TimeStamp,
    update_by VARCHAR(36)
    );

CREATE TABLE IF NOT EXISTS frw_info_asset (
                                              id SERIAL PRIMARY KEY,
                                              frw_info_detail_id BIGINT NOT NULL,
                                              asset_id VARCHAR(22) NOT NULL,               --ID thiết bị
    asset_model VARCHAR(50) NOT NULL,            -- Model sản phẩm
    frw_version_old VARCHAR(10) NOT NULL,
    frw_version_new VARCHAR(10),
    status VARCHAR(5) NOT NULL DEFAULT 'S',
    description VARCHAR(500),
    create_date TimeStamp,
    create_by VARCHAR(36),
    update_date TimeStamp,
    update_by VARCHAR(36)
    );


CREATE TABLE IF NOT EXISTS frw_info_detail (
                                               id SERIAL PRIMARY KEY,
                                               frw_info_id BIGINT NOT NULL,
                                               asset_model VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    create_date TimeStamp,
    create_by VARCHAR(36),
    update_date TimeStamp,
    update_by VARCHAR(36)
    );
