-- Xoá các constraint cũ nếu có
ALTER TABLE public.user_entity
DROP CONSTRAINT IF EXISTS uk_dykn684sl8up1crfei6eckhd7;

ALTER TABLE public.user_entity
DROP CONSTRAINT IF EXISTS uk_ru8tt6t700s9v50bu18ws5ha6;

-- Thêm constraint UNIQUE mới chỉ khi bảng tồn tại và constraint chưa tồn tại
DO $$
BEGIN
   IF EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema='public' AND table_name='user_entity'
   ) THEN
       IF NOT EXISTS (
           SELECT 1
           FROM pg_constraint
           WHERE conname='uk_user_username'
       ) THEN
ALTER TABLE public.user_entity
    ADD CONSTRAINT uk_user_username UNIQUE (username);
END IF;
END IF;
END $$;
