-- =====================================================
-- ADMIN PANEL & LESSON NOTES MIGRATION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE UPDATES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update existing users to 'approved' so they don't get locked out
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- Make specific email admin (optional, can be done manually in dashboard)
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your_email@example.com';

-- 2. LESSON NOTES TABLE
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note_content TEXT,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- Note Policies
CREATE POLICY "Users can view notes for their lessons"
  ON public.lesson_notes FOR SELECT
  USING (auth.uid() = tutor_id OR auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Tutors can create notes for their lessons"
  ON public.lesson_notes FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own notes"
  ON public.lesson_notes FOR UPDATE
  USING (auth.uid() = tutor_id);

-- 3. STORAGE BUCKETS (Create these in Supabase Dashboard first if SQL doesn't work, but policies here)

-- CVs Bucket Policies (Private, Admin only)
-- Note: You need to create 'cvs' bucket in Storage first!
CREATE POLICY "Tutors can upload their own CV"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all CVs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Users can view their own CV"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lesson Materials Bucket Policies (Public read for students provided they have the link, or restricted)
-- Note: You need to create 'lesson_materials' bucket in Storage first!
CREATE POLICY "Tutors can upload lesson materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson_materials' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone with link can view lesson materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'lesson_materials');

-- 4. PROFILE STATUS POLICIES (Optional, if we want to restrict fetching profiles)
-- Ideally, we filter in the application layer, but RLS is safer.
-- For now, we keep profiles public but filter sensitive data in app.
