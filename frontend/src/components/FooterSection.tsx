import logo from "@/assets/logo-warna.png";

const FooterSection = () => {
  return (
    <footer className="border-t border-border px-8 py-12 md:px-16 lg:px-24">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <a href="/" className="flex items-center gap-2">
          <img src={logo} alt="wArnA Studio" className="h-10 w-10 object-contain" />
          <span className="font-display text-lg font-semibold text-foreground">
            wArnA<span className="text-primary italic"> Studio</span>
          </span>
        </a>
        <p className="font-body text-sm text-muted-foreground">© 2026 wArnA Studio Photography. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterSection;
