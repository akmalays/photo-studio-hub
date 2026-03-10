import aboutPhoto from "@/assets/about-photo.jpg";

const stats = [
  { number: "10+", label: "Tahun Pengalaman" },
  { number: "500+", label: "Proyek Selesai" },
  { number: "50+", label: "Penghargaan" },
];

const AboutSection = () => {
  return (
    <section id="tentang" className="px-8 py-24 md:px-16 lg:px-24">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={aboutPhoto}
              alt="Fotografer profesional"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 h-full w-full border border-primary/30 -z-10" />
        </div>

        <div>
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
            Tentang Saya
          </p>
          <h2 className="mb-6 font-display text-4xl font-semibold text-foreground md:text-5xl">
            Di Balik <span className="italic text-gradient-gold">Lensa</span>
          </h2>
          <p className="mb-6 font-body text-lg leading-relaxed text-muted-foreground">
            Saya adalah fotografer profesional dengan passion mendalam dalam menangkap momen-momen yang bermakna. Dengan lebih dari satu dekade pengalaman, saya telah bekerja dengan berbagai klien — dari pernikahan intimate hingga brand internasional.
          </p>
          <p className="mb-10 font-body text-lg leading-relaxed text-muted-foreground">
            Filosofi saya sederhana: setiap foto harus menceritakan sebuah kisah. Saya percaya bahwa cahaya, komposisi, dan emosi adalah tiga pilar fotografi yang hebat.
          </p>

          <div className="grid grid-cols-3 gap-8 border-t border-border pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold text-primary md:text-4xl">
                  {stat.number}
                </p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
