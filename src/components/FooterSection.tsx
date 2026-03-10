const FooterSection = () => {
  return (
    <footer className="border-t border-border px-8 py-12 md:px-16 lg:px-24">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-display text-lg font-semibold text-foreground">
          LENS<span className="text-primary">.</span>
        </p>
        <p className="font-body text-sm text-muted-foreground">
          © 2026 Lens Photography. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
