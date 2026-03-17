import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import logo from "@/assets/logo-warna.jpg";

const StudioLoader = ({ onFinish }: { onFinish: () => void }) => {
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
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="relative mb-6">
        <img
          src={logo}
          alt="wArna Studio"
          className="h-28 w-auto animate-pulse"
        />
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-[1px] w-48 bg-border">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-3 font-body text-[10px] uppercase tracking-widest text-muted-foreground">
        {progress < 100 ? "Loading" : "Ready"}
      </p>
    </div>
  );
};

const Index = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <StudioLoader onFinish={() => setLoading(false)} />}
      <div className="min-h-screen bg-background">
        <Navbar />
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
