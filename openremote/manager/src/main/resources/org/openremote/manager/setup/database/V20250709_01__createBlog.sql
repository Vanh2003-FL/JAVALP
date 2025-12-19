CREATE TABLE IF NOT EXISTS blog_categories (
                                               id BIGSERIAL PRIMARY KEY,
                                               name VARCHAR(255),
    description TEXT,
    createdBy varchar(36) not null,
    updatedBy varchar(36),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS blogs (
                                     id BIGSERIAL PRIMARY KEY,
                                     title VARCHAR(255),
    content TEXT,
    slug VARCHAR(255),
    summary TEXT,
    thumbnail_url VARCHAR(255),
    category_id INTEGER not null,
    priority_level SMALLINT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status BOOLEAN,
    view_count INTEGER DEFAULT 0,
    createdBy varchar(36) not null,
    updatedBy varchar(36),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
    );
