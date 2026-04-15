import {Mail, Send} from "lucide-react";
import {useState} from "react";
import { toast } from "sonner";
import StudioMap from "./StudioMap";
import { supabase } from "@/integrations/supabase/client";

const ContactSection = () => {
  const [formData, setFormData] = useState({name: "", email: "", message: ""});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message,
      }]);
      
      if (error) throw new Error(error.message || "Gagal mengirim pesan. Silakan coba lagi.");

      setSent(true);
      setFormData({name: "", email: "", message: ""});
      setTimeout(() => setSent(false), 4000);
      toast.success("Pesan berhasil dikirim!");
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="kontak" className="px-4 py-16 sm:px-8 md:py-24 md:px-16 lg:px-24">
      <div className="grid gap-10 md:gap-16 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">Kontak</p>
          <h2 className="mb-4 font-display text-3xl font-semibold text-foreground sm:mb-6 sm:text-4xl md:text-5xl">
            Mari <span className="italic text-gradient-gold">Berkolaborasi</span>
          </h2>
          <p className="mb-8 max-w-md font-body text-base text-muted-foreground sm:mb-10 sm:text-lg">
            Tertarik bekerja sama? Kirim pesan melalui form ini atau hubungi langsung via WhatsApp di tombol hijau pojok kanan bawah.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-border">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="font-body text-sm text-foreground sm:text-base">studiofotowarna@gmail.com</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {[
            {id: "name", label: "Nama", type: "text", value: formData.name},
            {id: "email", label: "Email", type: "email", value: formData.email},
          ].map(({id, label, type, value}) => (
            <div key={id}>
              <label htmlFor={id} className="mb-2 block font-body text-xs uppercase tracking-wider text-muted-foreground sm:text-sm">
                {label}
              </label>
              <input
                id={id}
                type={type}
                required
                value={value}
                onChange={(e) => setFormData({...formData, [id]: e.target.value})}
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
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full resize-none border border-border bg-transparent px-4 py-3 font-body text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 border border-primary bg-primary px-8 py-3 font-body text-sm uppercase tracking-widest text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary disabled:opacity-50">
            {sending ? (
              "Mengirim..."
            ) : sent ? (
              "✓ Pesan Terkirim!"
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Pesan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Interactive Map */}
      <div className="mt-16 md:mt-24">
        <div className="mb-6 max-w-xl md:mb-10">
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-primary">Lokasi</p>
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
            Temukan <span className="italic text-gradient-gold">Studio Kami</span>
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
            Kami berlokasi di tempat yang mudah dijangkau. Kunjungi kami langsung atau gunakan peta di bawah untuk menemukan rute terbaik menuju wArnA Studio.
          </p>
        </div>
        <StudioMap />
      </div>
    </section>
  );
};

export default ContactSection;
