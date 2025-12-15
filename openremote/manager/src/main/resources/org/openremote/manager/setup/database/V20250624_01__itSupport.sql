CREATE TABLE IF NOT EXISTS it_support (
                                          id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) NOT NULL,
    assigned_user   VARCHAR(36),
    status          VARCHAR(36),
    entity_type     VARCHAR(500),
    note            TEXT,
    description     TEXT,
    realm_id        VARCHAR(36),
    created_by      VARCHAR(36),
    updated_by      VARCHAR(36),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS attachments (
                                           id           VARCHAR(36) PRIMARY KEY,
    entity_id    VARCHAR(36) NOT NULL,
    entity_name  VARCHAR(100) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_path    VARCHAR(512) NOT NULL,
    file_size    BIGINT,
    mime_type    VARCHAR(100),
    created_by   VARCHAR(36),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS it_support_log (
                                              id              VARCHAR(36) PRIMARY KEY,
    id_support_id   VARCHAR(36) NOT NULL,
    assigned_user   VARCHAR(36) NOT NULL,
    status          VARCHAR(10),
    entity_type     VARCHAR(50),
    created_by      VARCHAR(36),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

