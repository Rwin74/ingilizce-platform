-- =====================================================
-- STUDENT PROGRESS & STATS MIGRATION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Student Progress Table
CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Son güncelleyen eğitmen
  level TEXT CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Başlangıç')),
  grammar_score INTEGER DEFAULT 0 CHECK (grammar_score BETWEEN 0 AND 100),
  vocab_score INTEGER DEFAULT 0 CHECK (vocab_score BETWEEN 0 AND 100),
  speaking_score INTEGER DEFAULT 0 CHECK (speaking_score BETWEEN 0 AND 100),
  listening_score INTEGER DEFAULT 0 CHECK (listening_score BETWEEN 0 AND 100),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- RLS Policies
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if exists to avoid errors on rerun
DROP POLICY IF EXISTS "Tutors can manage progress" ON public.student_progress;
DROP POLICY IF EXISTS "Students can view own progress" ON public.student_progress;

-- Eğitmenler tüm ilerlemeleri görebilir ve düzenleyebilir (şimdilik tüm eğitmenlere açık)
CREATE POLICY "Tutors can manage progress"
  ON public.student_progress FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));

-- Öğrenciler sadece kendi ilerlemesini görebilir
CREATE POLICY "Students can view own progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());
