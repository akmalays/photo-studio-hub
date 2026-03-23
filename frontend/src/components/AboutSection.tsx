import aboutPhoto from "@/assets/about-photo.jpeg";

const stats = [
  {number: "10+", label: "Tahun Pengalaman"},
  {number: "500+", label: "Proyek Selesai"},
  {number: "50+", label: "Penghargaan"},
];

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

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-8 sm:gap-8 sm:pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-primary sm:text-3xl md:text-4xl">{stat.number}</p>
                <p className="mt-1 font-body text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
