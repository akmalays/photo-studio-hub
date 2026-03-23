-- Create visitor_stats table for traffic tracking
CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    page_path TEXT NOT NULL,
    user_agent TEXT,
    ip_hash TEXT -- To optionally track unique daily visitors
);

-- Enable RLS
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- Allow public service-role or anon if needed? 
-- Since we are logging via a backend proxy, we'll use the service role from the backend.
CREATE POLICY "Enable insert for authenticated users only" ON public.visitor_stats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only" ON public.visitor_stats
    FOR SELECT USING (auth.role() = 'authenticated');
