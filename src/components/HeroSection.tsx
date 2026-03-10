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
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-end pb-24 px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl animate-fade-up">
          <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-primary">
            Fotografer Profesional
          </p>
          <h1 className="mb-6 font-display text-5xl font-semibold leading-tight text-foreground md:text-7xl lg:text-8xl">
            Mengabadikan
            <br />
            <span className="text-gradient-gold italic">Momen Berharga</span>
          </h1>
          <p className="mb-8 max-w-md font-body text-lg text-muted-foreground">
            Setiap foto menceritakan kisah. Saya menangkap emosi, cahaya, dan keindahan dalam setiap frame.
          </p>
          <a
            href="#portfolio"
            className="inline-block border border-primary bg-transparent px-8 py-3 font-body text-sm uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          >
            Lihat Portfolio
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
