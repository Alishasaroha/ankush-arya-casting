import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone, MessageCircle } from "lucide-react";

export function SiteFooter() {
    return (
        <footer className="border-t hairline mt-32">
            <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-20">
                <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div>
                        <div className="font-display text-4xl leading-[1] tracking-tight">
                            Ankush Arya
                            <br />
                            <span className="text-muted-foreground italic">Casting</span>
                        </div>
                        <p className="mt-6 text-sm text-muted-foreground max-w-sm leading-relaxed">
                            India's emerging talent network. Connecting 10,000+ artists with
                            the producers, brands and storytellers shaping tomorrow's screen.
                        </p>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Explore</div>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-gold transition">About</Link></li>
                            <li><Link to="/talent" className="hover:text-gold transition">Talent</Link></li>
                            <li><Link to="/work" className="hover:text-gold transition">Our Work</Link></li>
                            <li><Link to="/producers" className="hover:text-gold transition">For Producers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Work With Us</div>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/join" className="hover:text-gold transition">Join as Talent</Link></li>
                            <li><Link to="/producers" className="hover:text-gold transition">Submit a Brief</Link></li>
                            <li><Link to="/contact" className="hover:text-gold transition">General Inquiry</Link></li>
                        </ul>
                    </div>

                    <div>
                        <div className="eyebrow mb-5">Reach Us</div>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> hello@ankusharyacasting.com</li>
                            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> +91 98XXX XXXXX</li>
                            <li className="flex items-center gap-3"><MessageCircle className="h-4 w-4 text-gold" /> WhatsApp Inquiry</li>
                            <li className="flex items-center gap-3"><Instagram className="h-4 w-4 text-gold" /> @ankusharyacasting</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t hairline flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-muted-foreground tracking-wider">
                    <div>© {new Date().getFullYear()} Ankush Arya Casting. All rights reserved.</div>
                    <div className="uppercase tracking-[0.28em]">Mumbai · India</div>
                </div>
            </div>
        </footer>
    );
}
