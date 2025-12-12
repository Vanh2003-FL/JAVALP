CREATE table IF NOT EXISTS sys_cabinet_group (
                                                 cabinet_grp_id     BIGSERIAL PRIMARY KEY,
                                                 cabinet_grp_code   VARCHAR(30) NOT NULL UNIQUE,
    cabinet_grp_name   VARCHAR(250) NOT NULL,
    active             BOOLEAN DEFAULT true,
    create_date        timestamp,
    create_by          VARCHAR(36) NOT NULL,
    update_date        timestamp,
    update_by          VARCHAR(36)
    );


CREATE table IF NOT EXISTS asset_cabinet_group (
                                                   id              BIGSERIAL PRIMARY KEY,
                                                   asset_id        VARCHAR(22) NOT NULL,
    cabinet_grp_id  INT NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    active          BOOLEAN DEFAULT TRUE,
    create_date     timestamp,
    create_by       VARCHAR(36),
    update_date     timestamp

    );

ALTER TABLE asset_cabinet
    ADD COLUMN cabinet_grp_id BIGSERIAL;


SELECT setval('sys_attributes_id_seq', (SELECT MAX(id) FROM sys_attributes), true);


INSERT INTO sys_attributes (
    attr_code, attr_code_name, attr_data_type, active, create_date, create_by, update_date, update_by
) VALUES
      ('P1', 'power_sts_1', 'positiveInteger', true, now(), '', now(), ''),
      ('P2', 'power_sts_2', 'positiveInteger', true, now(), '', now(), ''),
      ('P3', 'power_sts_3', 'positiveInteger', true, now(), '', now(), ''),
      ('P4', 'power_sts_4', 'positiveInteger', true, now(), '', now(), '');

SELECT setval('sys_asset_type_attr_id_seq', (SELECT MAX(id) FROM sys_asset_type_attr), true);


INSERT INTO sys_asset_type_attr (
    asset_type_id, attr_id, attr_data_type, attr_format, is_report, is_set_rule, create_date, create_by
)
SELECT
    2,
    sa.id,
    sa.attr_data_type,
    NULL,
    FALSE,
    FALSE,
    now(),
    ''
FROM sys_attributes sa
WHERE sa.attr_code IN ('P1', 'P2', 'P3', 'P4');
