-- Allow guest subscriptions by making user_id nullable and adding guest_email
ALTER TABLE public.subscriptions 
ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_email column for guest subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS guest_email text,
ADD COLUMN IF NOT EXISTS guest_name text;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Create new policies that allow guest subscriptions
CREATE POLICY "Anyone can create subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (
  -- Either authenticated user creating for themselves
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Or guest with email (no user_id required)
  (user_id IS NULL AND guest_email IS NOT NULL)
);

CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_admin_access(auth.uid())
);

CREATE POLICY "Users can update own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR has_admin_access(auth.uid())
);