-- Create portfolio items table
CREATE TABLE public.portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public can view portfolio
CREATE POLICY "Anyone can view portfolio" ON public.portfolio_items
  FOR SELECT USING (true);

-- Only authenticated users (admin) can manage portfolio
CREATE POLICY "Authenticated users can insert portfolio" ON public.portfolio_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update portfolio" ON public.portfolio_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete portfolio" ON public.portfolio_items
  FOR DELETE TO authenticated USING (true);

-- Storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

CREATE POLICY "Anyone can view portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can update portfolio images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'portfolio');

CREATE POLICY "Authenticated users can delete portfolio images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio');
