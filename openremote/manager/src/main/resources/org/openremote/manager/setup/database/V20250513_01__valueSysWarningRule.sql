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
    update_by
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
    'admin'
FROM sys_attributes
WHERE attr_code_name IN ('amperage', 'wattageActual', 'voltage', 'wattage', 'status');
