import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GallerySection from "@/components/GallerySection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import WhatsAppButton from "@/components/WhatsAppButton";

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
      {/* Aperture icon */}
      <div className="relative mb-8">
        <svg
          viewBox="0 0 100 100"
          className="h-20 w-20 animate-[spin_3s_linear_infinite] text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="50" cy="50" r="40" strokeOpacity="0.2" />
          <circle cx="50" cy="50" r="28" strokeOpacity="0.15" />
          {/* Aperture blades */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <line
              key={angle}
              x1="50"
              y1="10"
              x2="50"
              y2="35"
              transform={`rotate(${angle} 50 50)`}
              strokeOpacity="0.6"
              strokeWidth="1"
            />
          ))}
          <circle cx="50" cy="50" r="8" strokeOpacity="0.8" />
        </svg>
      </div>

      {/* Brand */}
      <h1 className="font-display text-3xl font-semibold tracking-wider text-foreground">
        wArna<span className="text-primary"> Studio</span>
      </h1>
      <p className="mt-2 font-body text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Photography Studio
      </p>

      {/* Progress bar */}
      <div className="mt-8 h-[1px] w-48 bg-border">
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
