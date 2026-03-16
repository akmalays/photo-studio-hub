import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

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

  const goTo = useCallback((direction: "prev" | "next") => {
    if (selectedIndex === null) return;
    setSlideDirection(direction === "next" ? "left" : "right");
    setTimeout(() => {
      setSelectedIndex((prev) => {
        if (prev === null) return null;
        return direction === "next"
          ? (prev + 1) % photos.length
          : (prev - 1 + photos.length) % photos.length;
      });
      setSlideDirection(null);
    }, 200);
  }, [selectedIndex, photos.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo("next");
      else if (e.key === "ArrowLeft") goTo("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goTo]);

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
            onClick={() => setSelectedIndex(i)}
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

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none overflow-hidden [&>button]:hidden">
          {selectedIndex !== null && (
            <div className="relative flex items-center justify-center w-[95vw] h-[90vh]">
              {/* Close button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-3 right-3 z-20 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev button */}
              <button
                onClick={() => goTo("prev")}
                className="absolute left-3 z-20 rounded-full bg-background/80 p-3 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Image */}
              <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                <img
                  src={photos[selectedIndex].src}
                  alt={photos[selectedIndex].title}
                  className={`max-h-[85vh] max-w-full object-contain transition-all duration-200 ease-out ${
                    slideDirection === "left"
                      ? "-translate-x-8 opacity-0"
                      : slideDirection === "right"
                      ? "translate-x-8 opacity-0"
                      : "translate-x-0 opacity-100"
                  }`}
                />
                {/* Caption */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-background/80 px-5 py-2.5 text-center backdrop-blur-sm">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary">
                    {photos[selectedIndex].category}
                  </p>
                  <p className="mt-0.5 font-display text-base text-foreground">
                    {photos[selectedIndex].title}
                  </p>
                  <p className="mt-1 font-body text-[10px] text-muted-foreground">
                    {selectedIndex + 1} / {photos.length}
                  </p>
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={() => goTo("next")}
                className="absolute right-3 z-20 rounded-full bg-background/80 p-3 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
