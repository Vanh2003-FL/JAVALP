INSERT INTO openremote.sys_config_parms (sys_param_code, data_type, parm_value, description, active, create_date, create_by)
VALUES ('firmware_path', 'TEXT', '/firmware/', '', true, now(), 'admin')
    ON CONFLICT (sys_param_code) DO NOTHING;
