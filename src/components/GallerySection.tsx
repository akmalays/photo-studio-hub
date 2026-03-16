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

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  photos: { id: string; image_url: string }[];
}

const defaultPhotos: PhotoItem[] = [
  { src: gallery1, title: "Wedding", category: "Pernikahan", span: "row-span-2" },
  { src: gallery2, title: "Landscape", category: "Lanskap", span: "" },
  { src: gallery3, title: "Street", category: "Jalanan", span: "row-span-2" },
  { src: gallery4, title: "Fashion", category: "Fashion", span: "" },
  { src: gallery5, title: "Culinary", category: "Kuliner", span: "row-span-2" },
  { src: gallery6, title: "Architecture", category: "Arsitektur", span: "" },
];

const ServiceCarousel = ({ category }: { category: ServiceCategory }) => {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);

  const photos = category.photos;
  if (photos.length === 0) return null;

  const slide = (dir: "prev" | "next") => {
    setSliding(dir === "next" ? "left" : "right");
    setTimeout(() => {
      setCurrent((prev) =>
        dir === "next" ? (prev + 1) % photos.length : (prev - 1 + photos.length) % photos.length
      );
      setSliding(null);
    }, 200);
  };

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-card">
      <img
        src={photos[current].image_url}
        alt={category.name}
        className={`h-full w-full object-cover transition-all duration-200 ease-out ${
          sliding === "left"
            ? "-translate-x-4 opacity-0"
            : sliding === "right"
            ? "translate-x-4 opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={() => slide("prev")}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => slide("next")}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/70 p-1.5 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-4 bg-primary" : "w-1.5 bg-foreground/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const GallerySection = () => {
  const [dbPhotos, setDbPhotos] = useState<PhotoItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);

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

    const fetchServices = async () => {
      const { data: categories } = await supabase
        .from("service_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (categories && categories.length > 0) {
        const { data: photos } = await supabase
          .from("service_photos")
          .select("*")
          .order("display_order", { ascending: true });

        const mapped: ServiceCategory[] = categories.map((cat) => ({
          ...cat,
          photos: (photos || []).filter((p) => p.category_id === cat.id),
        }));
        setServiceCategories(mapped);
      }
    };

    fetchPortfolio();
    fetchServices();
  }, []);

  const photos = dbPhotos.length > 0 ? dbPhotos : defaultPhotos;

  const goTo = useCallback(
    (direction: "prev" | "next") => {
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
    },
    [selectedIndex, photos.length]
  );

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
      {/* Jasa Fotografi */}
      <div className="mb-10 max-w-xl md:mb-16">
        <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
          Portfolio
        </p>
        <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
          Jasa <span className="italic text-gradient-gold">Fotografi</span>
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

      {/* Jasa Lainnya */}
      {serviceCategories.length > 0 && (
        <div className="mt-20 md:mt-28">
          <div className="mb-10 max-w-xl md:mb-16">
            <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
              Layanan
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
              Jasa <span className="italic text-gradient-gold">Lainnya</span>
            </h2>
            <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
              Selain jasa fotografi profesional, kami juga melayani kebutuhan foto studio untuk
              sekolah beserta cetak kartu pelajar dan dokumen lainnya.
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            {serviceCategories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`flex flex-col gap-6 md:gap-10 ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } items-center`}
              >
                {/* Photo carousel */}
                <div className="w-full md:w-1/2">
                  {cat.photos.length > 0 ? (
                    <ServiceCarousel category={cat} />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-sm border border-dashed border-border bg-card">
                      <p className="font-body text-sm text-muted-foreground">
                        Belum ada foto
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="w-full md:w-1/2">
                  <h3 className="mb-3 font-display text-xl font-semibold text-foreground sm:text-2xl">
                    {cat.name}
                  </h3>
                  <div className="mb-4 h-[2px] w-12 bg-primary" />
                  <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none overflow-hidden [&>button]:hidden">
          {selectedIndex !== null && (
            <div className="relative flex items-center justify-center w-[95vw] h-[90vh]">
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-3 right-3 z-20 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo("prev")}
                className="absolute left-3 z-20 rounded-full bg-background/80 p-3 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
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
