
-- Add unique constraint on user_id for upsert support
ALTER TABLE public.vip_subscriptions ADD CONSTRAINT vip_subscriptions_user_id_unique UNIQUE (user_id);
