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
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled
                    ? "bg-background/80 backdrop-blur-xl border-b hairline"
                    : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
                <Link to="/" className="flex items-center gap-3 group">
                    <span className="font-display text-xl tracking-tight leading-none">
                        Ankush Arya
                    </span>
                    <span className="hidden sm:inline text-[10px] tracking-[0.32em] uppercase text-muted-foreground border-l hairline pl-3">
                        Casting
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-9">
                    {NAV.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors gold-underline"
                            activeProps={{ className: "text-foreground" }}
                            activeOptions={{ exact: item.to === "/" }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        to="/join"
                        className="hidden md:inline-flex items-center gap-2 border hairline px-5 py-2.5 text-[11px] tracking-[0.24em] uppercase hover:bg-foreground hover:text-background transition-colors duration-500"
                    >
                        Join as Talent
                    </Link>
                    <button
                        onClick={() => setOpen(true)}
                        className="lg:hidden p-2 -mr-2"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 bg-background z-[60] flex flex-col animate-fade-slow">
                    <div className="flex justify-between items-center px-6 py-5 border-b hairline">
                        <span className="font-display text-xl">Ankush Arya</span>
                        <button onClick={() => setOpen(false)} aria-label="Close menu">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <nav className="flex flex-col px-6 py-12 gap-1">
                        {NAV.map((item, i) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setOpen(false)}
                                className="font-display text-4xl py-3 border-b hairline"
                                style={{ animation: `reveal-up 0.6s ${i * 0.05}s cubic-bezier(0.16,1,0.3,1) both` }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            to="/join"
                            onClick={() => setOpen(false)}
                            className="mt-8 inline-flex justify-center items-center border hairline px-6 py-4 text-xs tracking-[0.3em] uppercase"
                        >
                            Join as Talent
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}