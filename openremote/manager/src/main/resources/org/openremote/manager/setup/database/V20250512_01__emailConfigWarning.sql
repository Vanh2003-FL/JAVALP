CREATE TABLE IF NOT EXISTS sys_warning_rule (
                                                id bigserial not null,
                                                attr_id BIGINT,
                                                upper_bound_value NUMERIC(10,2) DEFAULT 0,
    lower_bound_value NUMERIC(10,2) DEFAULT 0,
    warning_value VARCHAR(30),
    active BOOLEAN DEFAULT TRUE,
    create_date DATE,
    create_by VARCHAR(36),
    update_date DATE,
    update_by VARCHAR(36)
    );


CREATE TABLE IF NOT EXISTS warning_email_config (
                                                    id bigserial not null,
                                                    realm VARCHAR(255),
    email VARCHAR(50),
    fullname VARCHAR(50),
    upper_bound_value NUMERIC(10,2) DEFAULT 0,
    lower_bound_value NUMERIC(10,2) DEFAULT 0,
    warning_value VARCHAR(30),
    sys_warning_id BIGINT,
    start_date DATE,
    active BOOLEAN DEFAULT TRUE,
    create_date DATE,
    create_by VARCHAR(36),
    update_date DATE,
    update_by VARCHAR(36)
    );


CREATE TABLE IF NOT EXISTS warning_email_route (
                                                   id bigserial not null,
                                                   warning_email_id BIGINT,
                                                   route_id VARCHAR(22),
    start_date DATE,
    active BOOLEAN,
    create_date DATE,
    create_by VARCHAR(36),
    update_date DATE,
    update_by VARCHAR(36)
    );



