-- =====================================================
-- ADMIN UPDATE & DELETE POLICIES
-- Run this in your Supabase SQL Editor to fix admin permissions
-- =====================================================

-- Allow Admins to update any profile (Approve, Reject, Suspend)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow Admins to delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
