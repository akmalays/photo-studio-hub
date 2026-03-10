import heroPhoto from "@/assets/hero-photo.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroPhoto}
          alt="Portrait photography in golden hour"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30 sm:via-background/70 sm:to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-end px-4 pb-16 sm:px-8 sm:pb-24 md:px-16 lg:px-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.3em] text-primary sm:mb-4 sm:text-sm">
            Fotografer Profesional
          </p>
          <h1 className="mb-4 font-display text-4xl font-semibold leading-tight text-foreground sm:mb-6 sm:text-5xl md:text-7xl lg:text-8xl">
            Mengabadikan
            <br />
            <span className="text-gradient-gold italic">Momen Berharga</span>
          </h1>
          <p className="mb-6 max-w-md font-body text-base text-muted-foreground sm:mb-8 sm:text-lg">
            Setiap foto menceritakan kisah. Saya menangkap emosi, cahaya, dan keindahan dalam setiap frame.
          </p>
          <a
            href="#portfolio"
            className="inline-block border border-primary bg-transparent px-6 py-3 font-body text-xs uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:px-8 sm:text-sm"
          >
            Lihat Portfolio
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
