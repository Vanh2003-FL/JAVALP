ALTER TABLE sys_attributes
    ADD COLUMN attr_name VARCHAR(250);


UPDATE sys_attributes SET attr_name = CASE attr_code_name
                                          WHEN 'brightness' THEN 'Độ sáng'
                                          WHEN 'amperage' THEN 'Dòng điện'
                                          WHEN 'wattageActual' THEN 'Năng lượng thực tế'
                                          WHEN 'voltage' THEN 'Điện áp'
                                          WHEN 'wattage' THEN 'Công suất'
                                          WHEN 'amperagePhase1' THEN 'Dòng điện pha 1'
                                          WHEN 'wattageActualPhase1' THEN 'Năng lượng thực tế pha 1'
                                          WHEN 'wattagePhase1' THEN 'Công suất pha 1'
                                          WHEN 'voltagePhase1' THEN 'Điện áp pha 1'
                                          WHEN 'amperagePhase2' THEN 'Dòng điện pha 2'
                                          WHEN 'wattageActualPhase2' THEN 'Năng lượng thực tế pha 2'
                                          WHEN 'wattagePhase2' THEN 'Công suất pha 2'
                                          WHEN 'voltagePhase2' THEN 'Điện áp pha 2'
                                          WHEN 'amperagePhase3' THEN 'Dòng điện pha 3'
                                          WHEN 'wattageActualPhase3' THEN 'Năng lượng thực tế pha 3'
                                          WHEN 'wattagePhase3' THEN 'Công suất danh định pha 3'
                                          WHEN 'voltagePhase3' THEN 'Điện áp pha 3'
                                          WHEN 'location' THEN 'Vị trí'
                                          WHEN 'power_sts_1' THEN 'Trạng thái nguồn 1'
                                          WHEN 'power_sts_2' THEN 'Trạng thái nguồn 2'
                                          WHEN 'power_sts_3' THEN 'Trạng thái nguồn 3'
                                          WHEN 'power_sts_4' THEN 'Trạng thái nguồn 4'
                                          WHEN 'status' THEN 'Trạng thái'
    END;

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
        WHEN 'voltage' THEN 250.00
        END,
    CASE attr_code_name
        WHEN 'voltage' THEN 200.00
        END,
    CASE attr_code_name
        WHEN 'voltage' THEN '240.00'
        WHEN 'status' THEN 'D'
        END,
    true,
    now(),
    'admin',
    now(),
    'admin',
    CASE attr_code_name
        WHEN 'voltage' THEN 'RV'
        WHEN 'status' THEN 'FV'
        END
FROM sys_attributes
WHERE attr_code_name IN ('voltage', 'status');


