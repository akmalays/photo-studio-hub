import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  text: string;
  is_active: boolean;
  display_order: number;
}

const SEPARATOR = "✦";

const TickerBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
        
        if (error) throw error;
        setAnnouncements(data || []);
      } catch {
        // Silently fail – ticker is non-critical
      }
    };
    load();
  }, []);

  if (announcements.length === 0) return null;

  // Build one long string with separators for the seamless loop
  const tickerText = announcements
    .map((a) => a.text)
    .join(`  ${SEPARATOR}  `);

  return (
    <>
      {/* Spacer to prevent content from hiding under the fixed ticker */}
      <div className="h-9" />
      {/* Fixed ticker bar below the navbar */}
      <div className="fixed top-[64px] left-0 right-0 z-40 w-full border-b border-white/10 bg-background/70 backdrop-blur-sm py-2 select-none">
        {/* Clip at same x bounds as the Navbar content — use margin (not padding) so overflow-hidden clips precisely */}
        <div className="mx-8 md:mx-16 lg:mx-24 overflow-hidden">
          <div className="animate-ticker inline-flex whitespace-nowrap will-change-transform">
            <span className="font-body text-[11px] sm:text-sm tracking-wide text-muted-foreground pr-16">
              {tickerText}&nbsp;&nbsp;<span className="text-primary/60">{SEPARATOR}</span>&nbsp;&nbsp;
            </span>
            <span aria-hidden className="font-body text-[11px] sm:text-sm tracking-wide text-muted-foreground pr-16">
              {tickerText}&nbsp;&nbsp;<span className="text-primary/60">{SEPARATOR}</span>&nbsp;&nbsp;
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TickerBanner;
