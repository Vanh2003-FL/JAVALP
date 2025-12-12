ALTER TABLE public.user_entity ADD COLUMN IF NOT EXISTS is_face_id int DEFAULT 0;
ALTER TABLE public.user_entity ADD COLUMN IF NOT EXISTS is_finger_id int DEFAULT 0;
