CREATE
OR REPLACE FUNCTION get_asset_path(p_asset_id varchar(22)) RETURNS ltree AS $$
DECLARE
parent_path ltree;  -- Lưu path của parent
    parent_id
varchar(22);       -- Lưu parent_id của asset hiện tại
BEGIN
    -- Lấy thông tin path và parent_id của asset hiện tại
SELECT A.path, A.parent_id
INTO parent_path, parent_id
FROM ASSET A
WHERE id = p_asset_id;


-- Nếu asset không có parent, path của nó là chính nó
IF
parent_id IS NULL THEN
            RETURN p_asset_id::ltree;
ELSE
            -- Nếu có parent, gọi đệ quy để lấy path của parent rồi nối với id hiện tại
            RETURN get_asset_path(parent_id) || p_asset_id::text;
END IF;
END;
$$
LANGUAGE plpgsql;


CREATE
OR REPLACE FUNCTION update_asset_parent_info() RETURNS TRIGGER AS $$
DECLARE
ppath ltree;
BEGIN
    IF
NEW.parent_id IS NULL THEN
        NEW.path = NEW.id::ltree;
ELSE
            ppath = get_asset_path(NEW.parent_id) || NEW.id::text;
        IF
ppath IS NULL THEN
            RAISE EXCEPTION 'Invalid parent_id %', NEW.parent_id;
END IF;
--         -- Kiểm tra vòng lặp
--         IF ppath @> NEW.id::ltree THEN
--             RAISE EXCEPTION 'Cycle detected: % -> %', ppath, NEW.id;
--         END IF;
        NEW.path
= ppath;
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER asset_parent_info_tgr
    BEFORE INSERT OR
UPDATE ON ASSET
    FOR EACH ROW EXECUTE PROCEDURE update_asset_parent_info();
