import { useState, useEffect } from "react";

const SERVICES = [
  "Foto Studio",
  "Foto ID Card & KTP",
  "Cetak Foto",
  "Foto Event Sekolah",
  "Cetak Dokumen",
  "Foto Keluarga",
];

const useTypingEffect = (words: string[], typingSpeed = 80, deletingSpeed = 50, pauseMs = 1800) => {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === current) {
      // Pause at full word then start deleting
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayed === "") {
      // Move to next word
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeout = setTimeout(() => {
        setDisplayed(isDeleting ? current.slice(0, displayed.length - 1) : current.slice(0, displayed.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
};

const HeroSection = ({ collagePhotos }: { collagePhotos: string[] }) => {
  const typedService = useTypingEffect(SERVICES);

  const getGridStyles = (index: number) => {
    switch (index) {
      case 0: return "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2";
      case 1: return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 2: return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 3: return "col-span-2 row-span-1 sm:col-span-1 sm:row-span-1";
      case 4: return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      case 5: return "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1";
      default: return "col-span-1 row-span-1";
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
          <div className="h-full w-full bg-gradient-to-br from-zinc-950 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-background via-background/95 to-background/50 sm:via-background/80 sm:to-background/20" />
      </div>

      <div className="relative z-10 flex h-full items-center px-4 pb-0 sm:items-end sm:px-8 sm:pb-24 md:items-center md:pb-0 md:px-16 lg:px-24">
        <div className="max-w-2xl animate-fade-up">
          {/* Typing animation label */}
          <p className="mb-3 font-body text-xs uppercase tracking-[0.3em] text-primary sm:mb-4 sm:text-sm h-5 flex items-center gap-1">
            <span>{typedService}</span>
            <span className="inline-block w-0.5 h-3.5 bg-primary animate-pulse" />
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
