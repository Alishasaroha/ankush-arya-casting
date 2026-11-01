import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/talent", label: "Talent" },
    { to: "/work", label: "Our Work" },
    { to: "/producers", label: "For Producers" },
    { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-background/90 backdrop-blur-xl border-b hairline shadow-2xl shadow-black/40"
                    : "bg-background/60 backdrop-blur-md border-b hairline"
            }`}
        >
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12">
                {/* Brand Logo - Minimal luxury serif */}
                <Link to="/" className="flex flex-col group select-none">
                    <span className="font-display text-base md:text-lg tracking-[0.22em] uppercase text-foreground font-light leading-none transition-colors group-hover:text-gold">
                        Ankush Arya
                    </span>
                    <span className="text-[9px] tracking-[0.38em] uppercase text-muted-foreground font-sans leading-none mt-1.5">
                        Casting
                    </span>
                </Link>

                {/* Center Navigation */}
                <nav className="hidden lg:flex items-center gap-10">
                    {NAV.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors gold-underline font-medium"
                            activeProps={{ className: "text-foreground font-semibold" }}
                            activeOptions={{ exact: item.to === "/" }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Action Button */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/join"
                        className="hidden md:inline-flex items-center border border-gold/40 hover:border-gold hover:bg-gold/10 px-5 py-2.5 text-[10px] tracking-[0.26em] uppercase text-foreground transition-all duration-300 font-medium"
                    >
                        Join as Talent
                    </Link>
                    <button
                        onClick={() => setOpen(true)}
                        className="lg:hidden p-2 -mr-2 text-foreground hover:text-gold transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {open && (
                <div className="fixed inset-0 bg-background z-[60] flex flex-col animate-fade-slow">
                    <div className="flex justify-between items-center px-6 py-5 border-b hairline">
                        <div className="flex flex-col">
                            <span className="font-display text-lg tracking-[0.22em] uppercase">Ankush Arya</span>
                            <span className="text-[9px] tracking-[0.38em] uppercase text-muted-foreground mt-1">Casting</span>
                        </div>
                        <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <nav className="flex flex-col px-6 py-10 gap-1 overflow-y-auto">
                        {NAV.map((item, i) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className="font-display text-3xl py-3.5 border-b hairline hover:text-gold transition-colors"
                                style={{ animation: `reveal-up 0.5s ${i * 0.04}s cubic-bezier(0.16,1,0.3,1) both` }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            to="/join"
                            onClick={() => setOpen(false)}
                            className="mt-8 inline-flex justify-center items-center border border-gold/60 bg-gold/10 px-6 py-4 text-xs tracking-[0.28em] uppercase text-gold font-medium"
                        >
                            Join as Talent
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
