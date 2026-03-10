import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

const photos = [
  { src: gallery1, title: "Wedding", category: "Pernikahan", span: "row-span-2" },
  { src: gallery2, title: "Landscape", category: "Lanskap", span: "" },
  { src: gallery3, title: "Street", category: "Jalanan", span: "row-span-2" },
  { src: gallery4, title: "Fashion", category: "Fashion", span: "" },
  { src: gallery5, title: "Culinary", category: "Kuliner", span: "row-span-2" },
  { src: gallery6, title: "Architecture", category: "Arsitektur", span: "" },
];

const GallerySection = () => {
  return (
    <section id="portfolio" className="px-8 py-24 md:px-16 lg:px-24">
      <div className="mb-16 max-w-xl">
        <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
          Portfolio
        </p>
        <h2 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
          Karya <span className="italic text-gradient-gold">Terpilih</span>
        </h2>
      </div>

      <div className="grid auto-rows-[250px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`gallery-image group relative cursor-pointer ${photo.span}`}
            style={{ animationDelay: `${i * 100}ms` }}
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
              <p className="mt-2 font-display text-2xl text-foreground">
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
