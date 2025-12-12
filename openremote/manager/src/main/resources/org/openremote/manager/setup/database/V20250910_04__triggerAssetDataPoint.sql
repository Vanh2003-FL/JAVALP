CREATE TABLE openremote.asset_datapoint_extend (
                                                   id SERIAL PRIMARY KEY,
                                                   "timestamp" timestamp NOT NULL,
                                                   entity_id varchar(22) NOT NULL,
                                                   attribute_name varchar(255) NOT NULL,
                                                   value jsonb NOT NULL,
                                                   created_at timestamp DEFAULT now()
);

CREATE OR REPLACE FUNCTION insert_asset_datapoint_extend()
RETURNS TRIGGER AS $$
BEGIN
INSERT INTO openremote.asset_datapoint_extend("timestamp", entity_id, attribute_name, value)
VALUES (NEW."timestamp", NEW.entity_id, NEW.attribute_name, NEW.value);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_asset_datapoint
    AFTER INSERT ON openremote.asset_datapoint
    FOR EACH ROW
    EXECUTE FUNCTION insert_asset_datapoint_extend();

CREATE INDEX idx_datapoint_ext_entity_attr_ts
    ON openremote.asset_datapoint_extend (entity_id, attribute_name, "timestamp" DESC);

CREATE INDEX idx_datapoint_ext_attr_ts
    ON openremote.asset_datapoint_extend (attribute_name, "timestamp");

CREATE INDEX idx_datapoint_ext_entity_ts_active_attrs
    ON openremote.asset_datapoint_extend (entity_id, "timestamp" DESC)
    WHERE attribute_name IN ('brightness','voltage','amperage','wattage');

DROP INDEX IF EXISTS asset_datapoint_timestamp_idx;

CREATE INDEX asset_datapoint_timestamp_idx ON openremote.asset_datapoint_extend USING btree ("timestamp" DESC);


