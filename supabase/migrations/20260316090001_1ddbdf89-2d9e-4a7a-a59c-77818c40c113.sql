
-- Service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service photos table
CREATE TABLE public.service_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view service categories" ON public.service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can view service photos" ON public.service_photos FOR SELECT TO public USING (true);

-- Admin write for categories
CREATE POLICY "Admins can insert service categories" ON public.service_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update service categories" ON public.service_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service categories" ON public.service_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin write for photos
CREATE POLICY "Admins can insert service photos" ON public.service_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update service photos" ON public.service_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete service photos" ON public.service_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.service_categories (name, description, display_order) VALUES
('Foto Studio Sekolah', 'Layanan foto studio profesional untuk siswa, guru, dan staf sekolah. Tersedia paket individu maupun kelompok dengan backdrop dan pencahayaan studio berkualitas.', 1),
('Cetak Kartu Pelajar & ID Card', 'Cetak kartu pelajar, kartu anggota, dan ID card dengan desain custom. Hasil cetak tajam, tahan lama, dan siap pakai dengan finishing laminasi.', 2),
('Cetak Foto & Dokumen', 'Layanan cetak foto berbagai ukuran dengan kualitas tinggi. Tersedia juga cetak pas foto untuk keperluan dokumen, ijazah, dan administrasi sekolah.', 3),
('Dokumentasi Acara Sekolah', 'Dokumentasi lengkap kegiatan sekolah seperti wisuda, class meeting, dan acara tahunan. Hasil foto siap cetak dan tersedia dalam format digital.', 4);
