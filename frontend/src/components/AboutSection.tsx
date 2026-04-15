import aboutPhoto from "@/assets/about-photo.jpeg";

const AboutSection = () => {
  return (
    <section id="tentang" className="px-4 py-16 sm:px-8 md:py-24 md:px-16 lg:px-24">
      <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
        <div className="relative mx-auto max-w-md lg:mx-0 lg:max-w-none">
          <div className="aspect-[3/4] overflow-hidden">
            <img src={aboutPhoto} alt="Fotografer profesional" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-4 -right-4 h-full w-full border border-primary/30 -z-10 sm:-bottom-6 sm:-right-6" />
        </div>

        <div>
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">Tentang Kami</p>
          <h2 className="mb-4 font-display text-3xl font-semibold text-foreground sm:mb-6 sm:text-4xl md:text-5xl">
            Tentang <span className="italic text-gradient-gold">wArnA Studio</span>
          </h2>
          <p className="mb-4 font-body text-base leading-relaxed text-muted-foreground sm:mb-6 sm:text-lg">
            wArnA Studio adalah pusat layanan visual dan dokumentasi profesional yang berdedikasi untuk menangkap setiap momen berharga dan memenuhi kebutuhan administratif Anda. Dengan pengalaman bertahun-tahun, kami telah menjadi mitra terpercaya untuk berbagai kebutuhan — mulai dari sesi foto studio yang intim hingga dokumentasi event besar.
          </p>
          <p className="mb-8 font-body text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-lg">
            Kami tidak hanya menawarkan jasa fotografi, tetapi juga solusi cetak dokumen penting seperti kartu pelajar (ID card) dan pas foto dengan standar kualitas tinggi. Kepercayaan Anda adalah prioritas kami dalam setiap karya yang kami hasilkan.
          </p>

          <div className="border-t border-border pt-8 sm:pt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8">
              <div className="flex-shrink-0">
                <p className="font-display text-4xl sm:text-5xl font-bold text-primary">10+</p>
                <p className="font-body text-xs sm:text-sm uppercase tracking-widest text-muted-foreground mt-1">Tahun Pengalaman</p>
              </div>
              
              <div className="hidden sm:block w-px h-16 bg-border"></div>
              
              <p className="font-body text-sm sm:text-base text-muted-foreground italic border-l-2 sm:border-none border-primary/50 pl-4 sm:pl-0">
                "Lebih dari satu dekade mendedikasikan diri untuk merekam tawa, haru, dan momen penting Anda dengan kualitas visual terbaik."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
