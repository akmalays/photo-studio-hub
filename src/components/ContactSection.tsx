import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Terima kasih! Pesan Anda telah terkirim.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="kontak" className="px-4 py-16 sm:px-8 md:py-24 md:px-16 lg:px-24">
      <div className="grid gap-10 md:gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">
            Kontak
          </p>
          <h2 className="mb-4 font-display text-3xl font-semibold text-foreground sm:mb-6 sm:text-4xl md:text-5xl">
            Mari <span className="italic text-gradient-gold">Berkolaborasi</span>
          </h2>
          <p className="mb-8 max-w-md font-body text-base text-muted-foreground sm:mb-10 sm:text-lg">
            Tertarik bekerja sama? Hubungi saya untuk mendiskusikan proyek Anda.
          </p>

          <div className="space-y-6">
            {[
              { icon: Mail, text: "hello@fotografer.com" },
              { icon: Phone, text: "+62 812 3456 7890" },
              { icon: MapPin, text: "Jakarta, Indonesia" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center border border-border">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-body text-sm text-foreground sm:text-base">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {[
            { id: "name", label: "Nama", type: "text", value: formData.name },
            { id: "email", label: "Email", type: "email", value: formData.email },
          ].map(({ id, label, type, value }) => (
            <div key={id}>
              <label htmlFor={id} className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
                {label}
              </label>
              <input
                id={id}
                type={type}
                required
                value={value}
                onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          ))}
          <div>
            <label htmlFor="message" className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
              Pesan
            </label>
            <textarea
              id="message"
              rows={5}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full resize-none border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-primary bg-primary px-8 py-3 font-body text-sm uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary"
          >
            Kirim Pesan
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
