import {useEffect, useState} from "react";
import { Helmet } from "react-helmet-async";

import logo from "@/assets/logo-warna.png";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import GallerySection from "@/components/GallerySection";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import TickerBanner from "@/components/TickerBanner";
import WhatsAppButton from "@/components/WhatsAppButton";

const StudioLoader = ({onFinish}: {onFinish: () => void}) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onFinish, 600);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      {/* Logo */}
      <div className="relative mb-6">
        <img src={logo} alt="wArnA Studio" className="h-32 w-32 object-contain animate-pulse" />
      </div>

      {/* Brand */}
      <h1 className="font-display text-3xl font-semibold tracking-wider text-foreground">
        wArnA<span className="text-primary"> Studio</span>
      </h1>
      <p className="mt-2 font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">Photography Studio</p>

      {/* Progress bar */}
      <div className="mt-6 h-[1px] w-48 bg-border">
        <div className="h-full bg-primary transition-all duration-150 ease-out" style={{width: `${Math.min(progress, 100)}%`}} />
      </div>
      <p className="mt-3 font-body text-[10px] uppercase tracking-widest text-muted-foreground">{progress < 100 ? "Loading" : "Ready"}</p>
    </div>
  );
};

const Index = () => {
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  useEffect(() => {
    // Track visit on mount
    fetch(`${apiUrl}/api/stats/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_path: "/", user_agent: navigator.userAgent })
    }).catch(err => console.error("Stats tracking failed:", err));
  }, [apiUrl]);

  const SITE_URL = "https://warnastudio.web.id";
  const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

  return (
    <>
      <Helmet>
        {/* === Primary SEO === */}
        <html lang="id" />
        <title>wArnA Studio — Jasa Foto Studio &amp; Cetak di Malang</title>
        <meta name="description" content="wArnA Studio: jasa foto studio, foto ID card, cetak foto, foto event sekolah, dan cetak dokumen di Kabupaten Malang. Kualitas terbaik, harga terjangkau!" />
        <meta name="keywords" content="studio foto malang, foto id card malang, cetak foto malang, foto event sekolah malang, cetak dokumen malang, foto keluarga malang, warna studio tumpang" />
        <link rel="canonical" href={SITE_URL} />
        <meta name="robots" content="index, follow" />
        <meta name="google-site-verification" content="gq9ioB-O2X2slcKRarHdWFFz5X5zVe1BPo3EOlGBFhI" />

        {/* === Open Graph (Facebook, WhatsApp) === */}
        <meta property="og:type" content="business.business" />
        <meta property="og:site_name" content="wArnA Studio" />
        <meta property="og:title" content="wArnA Studio — Jasa Foto Studio &amp; Cetak di Malang" />
        <meta property="og:description" content="Foto studio, ID card, cetak foto, event sekolah & cetak dokumen profesional di Kab. Malang." />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="id_ID" />

        {/* === Twitter Card === */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="wArnA Studio — Foto Studio &amp; Cetak Malang" />
        <meta name="twitter:description" content="Jasa foto studio, ID card, cetak foto & event sekolah di Kab. Malang, Jawa Timur." />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* === Local Business Schema (JSON-LD) === */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "wArnA Studio",
          "description": "Studio foto profesional di Kabupaten Malang. Melayani jasa foto pernikahan, event, ID card, cetak foto, dan videografi.",
          "url": SITE_URL,
          "telephone": "+62",
          "email": "studiofotowarna@gmail.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jl. Setiawan, Ledoksari, Tumpang",
            "addressLocality": "Kec. Tumpang",
            "postalCode": "65156",
            "addressRegion": "Jawa Timur",
            "addressCountry": "ID"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-7.9923",
            "longitude": "112.8076"
          },
          "openingHours": "Mo-Sa 08:00-17:00",
          "image": OG_IMAGE,
          "sameAs": []
        })}</script>
      </Helmet>

      {loading && <StudioLoader onFinish={() => setLoading(false)} />}
      <div className="min-h-screen bg-background">
        <Navbar />
        <TickerBanner />
        <HeroSection />
        <GallerySection />
        <AboutSection />
        <ContactSection />
        <FooterSection />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default Index;
