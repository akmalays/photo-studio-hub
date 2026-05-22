import { useEffect, useState, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PortfolioCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  photos: { id: string; image_url: string; title: string }[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  photos: { id: string; image_url: string }[];
}

const ServiceImageCard = ({
  cat,
  idx,
  intervalMs,
}: {
  cat: ServiceCategory;
  idx: number;
  intervalMs: number;
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const photos = cat.photos;

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [photos.length, intervalMs]);

  return (
    <div className="group relative overflow-hidden rounded-sm min-h-[340px] sm:min-h-[400px] flex flex-col justify-end">
      {/* Dark base */}
      <div className="absolute inset-0 bg-zinc-900" />

      {/* Crossfade photo stack */}
      {photos.length > 0 ? (
        photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.image_url}
            alt={cat.name}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ease-in-out ${
              i === activeIdx ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-card border border-dashed border-border" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Gold accent top-left line */}
      <div className="absolute top-0 left-0 h-[3px] w-12 bg-primary transition-all duration-500 group-hover:w-24" />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        <p className="mb-1 font-body text-[10px] uppercase tracking-[0.3em] text-primary/80">
          Layanan {String(idx + 1).padStart(2, "0")}
        </p>
        <h3 className="mb-3 font-display text-2xl font-semibold text-white sm:text-3xl">
          {cat.name}
        </h3>
        <div className="mb-4 h-[1px] w-10 bg-primary/60" />
        <p className="mb-6 font-body text-sm leading-relaxed text-white/70 max-w-sm">
          {cat.description}
        </p>
        <a
          href="#kontak"
          className="inline-flex items-center gap-2 border border-primary/70 px-5 py-2.5 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary"
        >
          Tanya Sekarang
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>

      {/* Dot indicators — only shown when multiple photos */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 right-5 z-10 flex gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIdx ? "w-5 bg-primary" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GallerySection = ({
  portfolioCategories,
  serviceCategories,
}: {
  portfolioCategories: PortfolioCategory[];
  serviceCategories: ServiceCategory[];
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollPortfolio = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.6;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  const goTo = useCallback(
    (direction: "prev" | "next") => {
      if (selectedCatIdx === null) return;
      const currentCat = portfolioCategories[selectedCatIdx];
      if (!currentCat || currentCat.photos.length <= 1) return;

      setSlideDirection(direction === "next" ? "left" : "right");
      setTimeout(() => {
        setSelectedPhotoIdx((prev) => 
          direction === "next"
            ? (prev + 1) % currentCat.photos.length
            : (prev - 1 + currentCat.photos.length) % currentCat.photos.length
        );
        setSlideDirection(null);
      }, 200);
    },
    [selectedCatIdx, portfolioCategories]
  );

  useEffect(() => {
    if (selectedCatIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo("next");
      else if (e.key === "ArrowLeft") goTo("prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedCatIdx, goTo]);

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

      <div className="relative group/slider">
        {/* Scroll Buttons for Desktop */}
        <button 
          onClick={() => scrollPortfolio("left")}
          className="absolute -left-4 sm:-left-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover/slider:opacity-100 shadow-xl border border-white/10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={() => scrollPortfolio("right")}
          className="absolute -right-4 sm:-right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 group-hover/slider:opacity-100 shadow-xl border border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Scroll Container */}
        <div ref={scrollContainerRef} className="flex w-full gap-4 sm:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {portfolioCategories.length > 0 ? (
            portfolioCategories.map((cat, i) => {
              if (cat.photos.length === 0) return null;
              const coverPhoto = cat.photos[0];

              return (
                <div
                  key={cat.id}
                  className="shrink-0 snap-center relative cursor-pointer overflow-hidden rounded-xl bg-muted/10 h-[400px] sm:h-[500px]"
                  onClick={() => {
                    setSelectedCatIdx(i);
                    setSelectedPhotoIdx(0);
                  }}
                >
                  <div className="relative group flex h-full items-center justify-center">
                    <img
                      src={coverPhoto.image_url}
                      alt={cat.name}
                      className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute rounded-xl bg-background/80 px-6 py-3 text-center backdrop-blur-sm shadow-xl transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                      <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary">
                        {cat.description || cat.name}
                      </p>
                      <p className="mt-0.5 font-display text-xl text-foreground capitalize">
                        {cat.name}
                      </p>
                      <p className="mt-1 font-body text-[10px] text-muted-foreground">
                        {cat.photos.length} Foto
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-40 w-full items-center justify-center text-muted-foreground">
              Belum ada foto portfolio.
            </div>
          )}
        </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {serviceCategories.map((cat, idx) => (
              <ServiceImageCard key={cat.id} cat={cat} idx={idx} intervalMs={5000 + idx * 2000} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={selectedCatIdx !== null} onOpenChange={(open) => !open && setSelectedCatIdx(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none overflow-hidden [&>button]:hidden">
          {selectedCatIdx !== null && portfolioCategories[selectedCatIdx] && (
            <div className="relative flex items-center justify-center w-[95vw] h-[90vh]">
              <button
                onClick={() => setSelectedCatIdx(null)}
                className="absolute top-3 right-3 z-20 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
              
              {portfolioCategories[selectedCatIdx].photos.length > 1 && (
                <>
                  <button
                    onClick={() => goTo("prev")}
                    className="absolute left-3 z-20 rounded-full bg-background/80 p-3 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => goTo("next")}
                    className="absolute right-3 z-20 rounded-full bg-background/80 p-3 text-foreground backdrop-blur-sm transition-opacity hover:bg-background"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                <img
                  src={portfolioCategories[selectedCatIdx].photos[selectedPhotoIdx].image_url}
                  alt={portfolioCategories[selectedCatIdx].photos[selectedPhotoIdx].title}
                  className={`max-h-[85vh] max-w-full rounded-lg object-contain transition-all duration-200 ease-out ${
                    slideDirection === "left"
                      ? "-translate-x-8 opacity-0"
                      : slideDirection === "right"
                      ? "translate-x-8 opacity-0"
                      : "translate-x-0 opacity-100"
                  }`}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-background/80 px-5 py-2.5 text-center backdrop-blur-sm">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary">
                    {portfolioCategories[selectedCatIdx].description || portfolioCategories[selectedCatIdx].name}
                  </p>
                  <p className="mt-0.5 font-display text-base text-foreground">
                    {portfolioCategories[selectedCatIdx].photos[selectedPhotoIdx].title || portfolioCategories[selectedCatIdx].name}
                  </p>
                  <p className="mt-1 font-body text-[10px] text-muted-foreground">
                    {selectedPhotoIdx + 1} / {portfolioCategories[selectedCatIdx].photos.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
