ALTER TABLE sys_warning_rule
    ADD CONSTRAINT pk_sys_warning_rule_id PRIMARY KEY (id);

ALTER TABLE warning_email_config
    ADD CONSTRAINT pk_warning_email_config PRIMARY KEY (id);

ALTER TABLE warning_email_route
    ADD CONSTRAINT pk_warning_email_route PRIMARY KEY (id);



INSERT INTO sys_warning_rule (
    attr_id, warning_value, create_date, create_by, update_date, update_by
)
SELECT
    id,
    '',                   -- warning_value
    now(),
    'admin',
    now(),
    'admin'
FROM sys_attributes
WHERE attr_code_name IN ('amperage', 'wattageActual', 'voltage', 'wattage');
