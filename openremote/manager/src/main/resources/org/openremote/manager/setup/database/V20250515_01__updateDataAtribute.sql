delete from sys_attributes;

-- Reset sequence
ALTER SEQUENCE sys_attributes_id_seq RESTART WITH 1;

INSERT INTO sys_attributes (attr_code,attr_code_name,attr_data_type,active,create_date,create_by,update_date,update_by) VALUES
                                                                                                                            ('B','brightness','positiveInteger',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('A','amperage','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('WA','wattageActual','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('V','voltage','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('W','wattage','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('A1','amperagePhase1','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('WA1','wattageActualPhase1','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('W1','wattagePhase1','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('V1','voltagePhase1','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('A2','amperagePhase2','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL);
INSERT INTO sys_attributes (attr_code,attr_code_name,attr_data_type,active,create_date,create_by,update_date,update_by) VALUES
                                                                                                                            ('WA2','wattageActualPhase2','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('W2','wattagePhase2','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('V2','voltagePhase2','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('A3','amperagePhase3','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('WA3','wattageActualPhase3','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('W3','wattagePhase3','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('V3','voltagePhase3','positiveNumber',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('L','location','GEO_JSONPoint',true,'2025-04-11 11:45:08.109896',NULL,NULL,NULL),
                                                                                                                            ('P1','power_sts_1','positiveInteger',true,'2025-04-23 16:52:13.890678','','2025-04-23 16:52:13.890678',''),
                                                                                                                            ('P2','power_sts_2','positiveInteger',true,'2025-04-23 16:52:13.890678','','2025-04-23 16:52:13.890678','');
INSERT INTO sys_attributes (attr_code,attr_code_name,attr_data_type,active,create_date,create_by,update_date,update_by) VALUES
                                                                                                                            ('P3','power_sts_3','positiveInteger',true,'2025-04-23 16:52:13.890678','','2025-04-23 16:52:13.890678',''),
                                                                                                                            ('P4','power_sts_4','positiveInteger',true,'2025-04-23 16:52:13.890678','','2025-04-23 16:52:13.890678',''),
                                                                                                                            ('S','status','text',true,'2025-05-13 17:09:06.465004','','2025-05-13 17:09:06.465004','');

-- Xóa toàn bộ dữ liệu
DELETE FROM sys_warning_rule;

-- Reset sequence
ALTER SEQUENCE sys_warning_rule_id_seq RESTART WITH 1;

INSERT INTO sys_warning_rule (
    attr_id,
    upper_bound_value,
    lower_bound_value,
    warning_value,
    active,
    create_date,
    create_by,
    update_date,
    update_by,
    value_type
)
SELECT
    id,
    CASE attr_code_name
        WHEN 'amperage' THEN 2.00
        WHEN 'wattageActual' THEN 3000.00
        WHEN 'voltage' THEN 250.00
        WHEN 'wattage' THEN 3000.00
        END,
    CASE attr_code_name
        WHEN 'amperage' THEN 0.30
        WHEN 'wattageActual' THEN 100.00
        WHEN 'voltage' THEN 200.00
        WHEN 'wattage' THEN 100.00
        END,
    CASE attr_code_name
        WHEN 'amperage' THEN '0.80'
        WHEN 'wattageActual' THEN '2000.00'
        WHEN 'voltage' THEN '240.00'
        WHEN 'wattage' THEN '2000.00'
        WHEN 'status' THEN 'D'
        END,
    true,
    now(),
    'admin',
    now(),
    'admin',
    CASE attr_code_name
        WHEN 'amperage' THEN 'RV'
        WHEN 'wattageActual' THEN 'RV'
        WHEN 'voltage' THEN 'RV'
        WHEN 'wattage' THEN 'RV'
        WHEN 'status' THEN 'FV'
        END
FROM sys_attributes
WHERE attr_code_name IN ('amperage', 'wattageActual', 'voltage', 'wattage', 'status');

