import { useState } from "react";

const WhatsAppButton = () => {
  const phoneNumber = "6281234567890";
  const message = encodeURIComponent("Halo, saya tertarik dengan jasa fotografi Anda!");
  const waLink = `https://wa.me/${phoneNumber}?text=${message}`;
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      <span
        className={`whitespace-nowrap rounded-lg bg-card px-3 py-2 font-body text-xs text-foreground shadow-lg transition-all duration-300 ${
          hovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 pointer-events-none"
        }`}
      >
        💬 Chat langsung via WhatsApp
      </span>

      {/* Button */}
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg transition-transform duration-300 hover:scale-110">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
        >
          <path
            d="M16.004 2.667A13.27 13.27 0 002.67 15.937a13.18 13.18 0 001.8 6.637L2.667 29.333l6.96-1.78a13.3 13.3 0 006.37 1.623h.007A13.27 13.27 0 0016.004 2.667zm0 24.266a11 11 0 01-5.61-1.533l-.4-.24-4.16 1.093 1.11-4.067-.263-.42a10.97 10.97 0 01-1.681-5.83 11.007 11.007 0 0111-10.936 11.007 11.007 0 0111 10.94 11.013 11.013 0 01-10.996 10.993zm6.033-8.223c-.33-.167-1.957-.967-2.26-1.077-.303-.11-.523-.167-.743.167s-.853 1.077-1.047 1.297-.387.25-.717.083c-.33-.167-1.393-.513-2.653-1.637-.98-.873-1.643-1.953-1.837-2.283-.193-.33-.02-.51.147-.673.15-.15.33-.39.497-.587.167-.193.223-.33.333-.55.11-.22.057-.413-.027-.58-.083-.167-.743-1.793-1.02-2.453-.267-.643-.54-.557-.743-.567-.193-.01-.413-.013-.633-.013s-.58.083-.883.413c-.303.33-1.157 1.13-1.157 2.757s1.183 3.197 1.35 3.417c.167.22 2.33 3.557 5.643 4.99.79.34 1.403.543 1.883.697.793.25 1.513.213 2.083.13.637-.093 1.957-.8 2.233-1.573.277-.773.277-1.437.193-1.573-.083-.137-.303-.22-.633-.387z"
            fill="hsl(0, 0%, 100%)"
          />
        </svg>
      </span>
    </a>
  );
};

export default WhatsAppButton;
