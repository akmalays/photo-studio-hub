import { useEffect, useRef } from "react";
import { Navigation } from "lucide-react";

// wArnA Studio coordinates - Jl. Setiawan, Ledoksari, Tumpang, Kab. Malang
const STUDIO_LAT = -7.9923;
const STUDIO_LNG = 112.8076;
const STUDIO_NAME = "wArnA Studio";

const StudioMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${STUDIO_LAT},${STUDIO_LNG}&destination_place_id=wArnA+Studio+Tumpang+Malang`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon
      const DefaultIcon = L.divIcon({
        className: "",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <!-- Pulsing ring -->
            <div style="
              position: absolute;
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(212, 175, 55, 0.2);
              border: 2px solid rgba(212, 175, 55, 0.5);
              animation: pulse-ring 2s ease-out infinite;
            "></div>
            <!-- Outer ring -->
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid rgba(212, 175, 55, 0.6);
            "></div>
            <!-- Center dot -->
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #d4af37;
              border: 2px solid #fff;
              box-shadow: 0 2px 8px rgba(212, 175, 55, 0.8);
              z-index: 1;
              cursor: pointer;
            "></div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -28],
      });

      const map = L.map(mapRef.current, {
        center: [STUDIO_LAT, STUDIO_LNG],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Dark-themed map tiles (CartoDB Dark Matter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Attribution (small)
      L.control.attribution({ position: "bottomright", prefix: "© OpenStreetMap" }).addTo(map);

      // Add marker
      const marker = L.marker([STUDIO_LAT, STUDIO_LNG], { icon: DefaultIcon }).addTo(map);

      // Popup
      marker.bindPopup(`
        <div style="
          font-family: inherit;
          text-align: center;
          padding: 4px 2px;
          min-width: 160px;
        ">
          <p style="font-weight: 700; font-size: 14px; color: #d4af37; margin: 0 0 4px 0;">📍 wArnA Studio</p>
          <p style="font-size: 11px; color: #aaa; margin: 0 0 8px 0; line-height: 1.4;">Jl. Setiawan, Ledoksari, Tumpang,<br/>Kec. Tumpang, Kab. Malang 65156</p>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=${STUDIO_LAT},${STUDIO_LNG}"
            target="_blank"
            rel="noopener"
            style="
              display: inline-block;
              background: #d4af37;
              color: #000;
              font-size: 11px;
              font-weight: 600;
              padding: 6px 12px;
              border-radius: 4px;
              text-decoration: none;
              letter-spacing: 0.05em;
            "
          >🧭 Petunjuk Arah</a>
        </div>
      `, {
        closeButton: false,
        className: "studio-popup",
      });

      // Open popup by default
      marker.openPopup();

      // Click on marker opens directions
      marker.on("click", openGoogleMapsDirections);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden border border-border" style={{ borderRadius: "0" }}>
      {/* Pulsing animation style */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        .studio-popup .leaflet-popup-content-wrapper {
          background: #111;
          border: 1px solid #333;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .studio-popup .leaflet-popup-tip {
          background: #111;
        }
        .leaflet-control-zoom a {
          background: #111 !important;
          color: #d4af37 !important;
          border-color: #333 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #222 !important;
        }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.6) !important;
          color: #555 !important;
          font-size: 9px !important;
        }
      `}</style>

      {/* Map container */}
      <div ref={mapRef} style={{ width: "100%", height: "320px" }} />

      {/* Overlay button */}
      <button
        onClick={openGoogleMapsDirections}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-primary px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-widest text-black shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      >
        <Navigation className="h-3.5 w-3.5" />
        Petunjuk Arah
      </button>
    </div>
  );
};

export default StudioMap;
