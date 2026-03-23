import { useState, useEffect } from "react";
import heroPhoto from "@/assets/hero-photo.jpg";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [collagePhotos, setCollagePhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data: portPhotos } = await supabase.from("portfolio_photos").select("image_url").limit(5);
        const { data: servPhotos } = await supabase.from("service_photos").select("image_url").limit(5);
        
        const allPhotos: string[] = [];
        if (portPhotos) allPhotos.push(...portPhotos.map(p => p.image_url));
        if (servPhotos) allPhotos.push(...servPhotos.map(p => p.image_url));
        
        if (allPhotos.length > 0) {
          // Shuffle the photos to make the collage dynamic
          const shuffled = allPhotos.sort(() => 0.5 - Math.random());
          // Take up to 6 photos for a 3x2 or 2x3 grid
          setCollagePhotos(shuffled.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to load hero collage photos:", error);
      }
    };
    fetchPhotos();
  }, []);

  const getGridStyles = (index: number) => {
    switch (index) {
      case 0:
        return "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2"; // Large feature image
      case 1:
        return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 2:
        return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 3:
        return "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1"; // Wide on mobile, standard on desktop
      case 4:
        return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 5:
        return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <section className="relative h-[70vh] sm:h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        {collagePhotos.length > 0 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-5 sm:grid-cols-3 sm:grid-rows-3 gap-2 sm:gap-3 p-2 sm:p-3 opacity-70">
            {collagePhotos.map((url, i) => (
              <div key={i} className={`h-full w-full overflow-hidden rounded-lg sm:rounded-2xl ${getGridStyles(i)}`}>
                <img
                  src={url}
                  className="h-full w-full object-cover object-[50%_25%] transition-transform duration-1000 hover:scale-110"
                  alt={`Karya wArnA Studio ${i + 1}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <img
            src={heroPhoto}
            alt="Layanan Fotografi dan Dokumen"
            className="h-full w-full object-cover object-[50%_25%]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-background via-background/95 to-background/50 sm:via-background/80 sm:to-background/20" />
      </div>

      <div className="relative z-10 flex h-full items-center px-4 pb-0 sm:items-end sm:px-8 sm:pb-24 md:items-center md:pb-0 md:px-16 lg:px-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.3em] text-primary sm:mb-4 sm:text-sm">
            Layanan Visual & Cetak
          </p>
          <h1 className="mb-4 font-display text-4xl font-semibold leading-tight text-foreground sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
            Solusi Kreatif
            <br />
            <span className="text-gradient-gold italic">Untuk Kebutuhan Anda</span>
          </h1>
          <p className="mb-6 max-w-md font-body text-base text-muted-foreground sm:mb-8 sm:text-lg">
            Lebih dari sekadar fotografi. Kami melayani foto studio, dokumentasi event sekolah, hingga cetak ID card dan dokumen penting dengan kualitas terbaik.
          </p>
          <a
            href="#portfolio"
            className="inline-block border border-primary bg-transparent px-6 py-3 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:px-8 sm:text-sm"
          >
            Lihat Layanan
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
