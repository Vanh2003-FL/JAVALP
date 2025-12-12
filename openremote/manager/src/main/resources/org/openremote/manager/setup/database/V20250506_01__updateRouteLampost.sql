DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'route_lamppost'
          AND column_name = 'lamppost_code'
    ) THEN
ALTER TABLE route_lamppost ADD COLUMN lamppost_code varchar(30);
END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'route_lamppost'
          AND column_name = 'lamppost_name'
    ) THEN
ALTER TABLE route_lamppost ADD COLUMN lamppost_name varchar(100);
END IF;
END;
$$;
