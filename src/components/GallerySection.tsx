import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

interface PhotoItem {
  src: string;
  title: string;
  category: string;
  span: string;
}

const defaultPhotos: PhotoItem[] = [
  { src: gallery1, title: "Wedding", category: "Pernikahan", span: "row-span-2" },
  { src: gallery2, title: "Landscape", category: "Lanskap", span: "" },
  { src: gallery3, title: "Street", category: "Jalanan", span: "row-span-2" },
  { src: gallery4, title: "Fashion", category: "Fashion", span: "" },
  { src: gallery5, title: "Culinary", category: "Kuliner", span: "row-span-2" },
  { src: gallery6, title: "Architecture", category: "Arsitektur", span: "" },
];

const GallerySection = () => {
  const [dbPhotos, setDbPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        const spanPatterns = ["row-span-2", "", "row-span-2", "", "row-span-2", ""];
        setDbPhotos(
          data.map((item, i) => ({
            src: item.image_url,
            title: item.title,
            category: item.category,
            span: spanPatterns[i % spanPatterns.length],
          }))
        );
      }
    };
    fetchPortfolio();
  }, []);

  const photos = dbPhotos.length > 0 ? dbPhotos : defaultPhotos;

  return (
    <section id="portfolio" className="px-4 py-16 sm:px-8 md:py-24 md:px-16 lg:px-24">
      <div className="mb-10 max-w-xl md:mb-16">
        <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
          Portfolio
        </p>
        <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
          Karya <span className="italic text-gradient-gold">Terpilih</span>
        </h2>
      </div>

      <div className="grid auto-rows-[200px] grid-cols-1 gap-3 sm:auto-rows-[250px] sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`gallery-image group relative cursor-pointer ${photo.span}`}
          >
            <img
              src={photo.src}
              alt={photo.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-background/0 transition-all duration-500 group-hover:bg-background/60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <p className="font-body text-xs uppercase tracking-[0.3em] text-primary">
                {photo.category}
              </p>
              <p className="mt-2 font-display text-xl text-foreground sm:text-2xl">
                {photo.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GallerySection;
