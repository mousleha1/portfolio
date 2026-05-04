import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth" });
}

function NavAnchor({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [location, setLocation] = useLocation();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const url = new URL(href, window.location.origin);
      const hash = url.hash.slice(1);
      const isRootPath =
        url.pathname === "/" ||
        url.pathname === import.meta.env.BASE_URL?.replace(/\/$/, "") ||
        url.pathname === (import.meta.env.BASE_URL || "/");

      if (hash && isRootPath) {
        e.preventDefault();
        if (location === "/" || location === "") {
          scrollToSection(hash);
        } else {
          setLocation("/");
          setTimeout(() => scrollToSection(hash), 300);
        }
      }
      onClick?.();
    },
    [href, location, setLocation, onClick]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      data-testid={`nav-link-${href.replace(/[^a-z0-9]/gi, "-")}`}
    >
      {children}
    </a>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      const sections = ["about", "services", "testimonials", "faq", "contact"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) scrollToSection(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية", id: "" },
    { href: "/#about", label: "من نحن", id: "about" },
    { href: "/#services", label: "الخدمات", id: "services" },
    { href: "/#testimonials", label: "آراء العملاء", id: "testimonials" },
    { href: "/#faq", label: "الأسئلة الشائعة", id: "faq" },
    { href: "/#contact", label: "تواصل معنا", id: "contact" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/30 py-3 shadow-[0_4px_30px_hsl(240_27%_4%_/_0.4)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 group"
              data-testid="logo-link"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg shadow-[0_0_15px_hsl(45_68%_47%_/_0.4)] transition-shadow group-hover:shadow-[0_0_25px_hsl(45_68%_47%_/_0.6)]"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(45 90% 65%))" }}
              >
                ح
              </span>
              <span className="text-xl font-black text-white group-hover:text-primary transition-colors duration-300">
                حلها بسيط
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" data-testid="nav-desktop">
              {navLinks.map((link) => {
                const isActive = link.id ? activeSection === link.id : activeSection === "";
                return (
                  <NavAnchor
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </NavAnchor>
                );
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 shadow-[0_0_15px_hsl(45_68%_47%_/_0.25)] hover:shadow-[0_0_25px_hsl(45_68%_47%_/_0.4)] transition-all"
              >
                <NavAnchor href="/#contact" data-testid="button-start-now">ابدأ الآن</NavAnchor>
              </Button>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden text-foreground p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-2xl py-4 px-4 flex flex-col gap-1 animate-in slide-in-from-top-2"
            data-testid="nav-mobile"
          >
            {navLinks.map((link) => (
              <NavAnchor
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="text-base font-medium text-foreground py-3 px-3 rounded-lg hover:bg-white/5 hover:text-primary transition-all"
              >
                {link.label}
              </NavAnchor>
            ))}
            <div className="pt-3 mt-2 border-t border-border/30">
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12"
              >
                <NavAnchor href="/#contact" onClick={closeMobileMenu}>
                  ابدأ مشروعك الآن
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </NavAnchor>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative border-t border-border/30 bg-card/30 backdrop-blur-sm pt-16 pb-8 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 50% 80% at 80% 50%, hsl(45 68% 47% / 0.04) 0%, transparent 70%)`,
          }}
        />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 w-fit group">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(45 90% 65%))" }}
                >
                  ح
                </span>
                <span className="text-xl font-black text-white group-hover:text-primary transition-colors">
                  حلها بسيط
                </span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-sm text-sm mb-5">
                منصة متخصصة في تقديم خدمات رقمية تساعد الأفراد وأصحاب المشاريع على تطوير أعمالهم وتحسين ظهورهم الرقمي.
              </p>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                متاح لاستقبال مشاريع جديدة
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">روابط سريعة</h3>
              <ul className="flex flex-col gap-2.5">
                {navLinks.slice(0, 5).map((link) => (
                  <li key={link.href}>
                    <NavAnchor
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                      {link.label}
                    </NavAnchor>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">تواصل معنا</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  {
                    href: "mailto:project1manegment@gmail.com",
                    icon: (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    ),
                    label: "project1manegment@gmail.com",
                    ltr: true,
                  },
                  {
                    href: "https://wa.me/966552312196",
                    icon: (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    ),
                    label: "+966 55 231 2196",
                    ltr: true,
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 group rounded-lg px-3 py-2.5 hover:bg-primary/8 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary/25 transition-colors">
                        {item.icon}
                      </span>
                      <span
                        className="text-muted-foreground group-hover:text-primary transition-colors text-xs font-medium whitespace-nowrap"
                        dir={item.ltr ? "ltr" : "rtl"}
                      >
                        {item.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} حلها بسيط للخدمات الإلكترونية — جميع الحقوق محفوظة</p>
            <p>صُمّم باحترافية لتحقيق نتائج حقيقية</p>
          </div>
        </div>
      </footer>

      {/* ── Floating WhatsApp ─────────────────────────────────────────── */}
      <a
        href="https://wa.me/966552312196"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 group"
        aria-label="تواصل عبر واتساب"
        data-testid="whatsapp-floating"
      >
        <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300">
          <Phone size={22} className="text-white fill-white" />
        </div>
        <span className="absolute right-full ml-0 mr-3 top-1/2 -translate-y-1/2 bg-card border border-border/50 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg pointer-events-none">
          تواصل عبر واتساب
        </span>
      </a>
    </div>
  );
}
