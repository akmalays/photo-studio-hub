-- Create announcements table for running text ticker
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements
CREATE POLICY "Public can read announcements" ON public.announcements
  FOR SELECT USING (is_active = true);

-- Only service role can modify
CREATE POLICY "Service role can manage announcements" ON public.announcements
  USING (auth.role() = 'service_role');

-- Insert default announcement
INSERT INTO public.announcements (text, is_active, display_order)
VALUES 
  ('Selamat datang di wArna Studio! Kami siap melayani kebutuhan foto studio, cetak ID card, dan dokumentasi event Anda.', true, 0),
  ('Hubungi kami sekarang untuk konsultasi gratis dan penawaran terbaik!', true, 1);
