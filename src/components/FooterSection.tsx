import logo from "@/assets/logo-warna.jpg";

const FooterSection = () => {
  return (
    <footer className="border-t border-border px-8 py-12 md:px-16 lg:px-24">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="wArna Studio" className="h-10 w-auto" />
        </a>
        <p className="font-body text-sm text-muted-foreground">
          © 2026 wArna Studio Photography. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
