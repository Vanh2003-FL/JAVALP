CREATE TABLE IF NOT EXISTS schedule_info (
                               id SERIAL PRIMARY KEY,
                               schedule_code VARCHAR(30) NOT NULL,
                               schedule_name VARCHAR(250) NOT NULL,
                               realm VARCHAR(255) NOT NULL,
                               active INTEGER NOT NULL DEFAULT 1,
                               sch_type VARCHAR(10) NOT NULL,
                               sch_from_date TIMESTAMP NOT NULL,
                               sch_to_date TIMESTAMP NOT NULL,
                               sch_repeat_occu VARCHAR(250),
                               is_sch_repeat_end BOOLEAN NOT NULL DEFAULT true,
                               sch_time_period JSONB NOT NULL,
                               customize_lamp_type JSONB,
                               deleted INTEGER NOT NULL DEFAULT 0,
                               description VARCHAR(250),
                               create_date TIMESTAMP NOT NULL,
                               create_by VARCHAR(36) NOT NULL,
                               update_date TIMESTAMP NOT NULL,
                               update_by VARCHAR(36) NOT NULL
);
CREATE TABLE IF NOT EXISTS schedule_asset (
                                id BIGSERIAL PRIMARY KEY,
                                schedule_id INTEGER NOT NULL,
                                sys_asset_type_id INTEGER NOT NULL,
                                asset_id VARCHAR(22) NOT NULL,
                                deleted INTEGER NOT NULL DEFAULT 0,
                                create_date TIMESTAMP NOT NULL,
                                create_by VARCHAR(36) NOT NULL,
                                update_date TIMESTAMP NOT NULL,
                                update_by VARCHAR(36) NOT NULL
);




