-- Add country and city to visitor_stats
ALTER TABLE public.visitor_stats 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;
