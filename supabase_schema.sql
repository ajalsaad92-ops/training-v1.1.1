-- SQL Script to create the evaluations table in Supabase
-- Please run this script in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id text NOT NULL,
  evaluator_name text NOT NULL,
  evaluator_role text NOT NULL,
  scores jsonb NOT NULL,
  notes text,
  is_external boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (since the external survey is public)
CREATE POLICY "Allow anonymous inserts to evaluations"
ON public.evaluations
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow reading all evaluations (if needed for the dashboard later)
CREATE POLICY "Allow reading evaluations"
ON public.evaluations
FOR SELECT
TO anon
USING (true);
