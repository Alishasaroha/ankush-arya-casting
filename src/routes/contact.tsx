import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Mail, Phone, MessageCircle, Instagram, MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/contact")({
    head: () => ({
        meta: [
            { title: "Contact — Ankush Arya Casting" },
            { name: "description", content: "Get in touch with Ankush Arya Casting. Email, phone, WhatsApp and social — we respond within one business day." },
            { property: "og:title", content: "Contact — Ankush Arya Casting" },
            { property: "og:description", content: "Reach the team. We respond within one business day." },
        ],
    }),
    component: Contact,
});

const CHANNELS = [
    { icon: Mail, label: "Email", value: "hello@ankusharyacasting.com", href: "mailto:hello@ankusharyacasting.com" },
    { icon: Phone, label: "Phone", value: "+91 98XXX XXXXX", href: "tel:+9198000000000" },
    { icon: MessageCircle, label: "WhatsApp", value: "Message Us", href: "https://wa.me/919800000000" },
    { icon: Instagram, label: "Instagram", value: "@ankusharyacasting", href: "https://instagram.com" },
];

function Contact() {
    const [sent, setSent] = useState(false);
    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSent(true);
    }

    return (
        <>
            <PageHero
                eyebrow="Get in Touch"
                title={<>Start a <span className="italic text-gold">conversation.</span></>}
                subtitle="For casting briefs, talent inquiries, partnerships or press. We respond to every message within one business day."
            />

            <section className="py-20 md:py-28 border-b hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-px bg-border md:grid-cols-4">
                        {CHANNELS.map((c) => {
                            const Icon = c.icon;
                            return (
                                <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="bg-surface p-10 group hover:bg-background transition-colors">
                                    <Icon className="h-5 w-5 text-gold" />
                                    <div className="mt-8 text-xs tracking-[0.24em] uppercase text-muted-foreground">{c.label}</div>
                                    <div className="mt-2 font-display text-2xl gold-underline">{c.value}</div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-24 md:py-32">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12 grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
                    <div>
                        <div className="eyebrow">Studio</div>
                        <h2 className="mt-6 font-display text-4xl md:text-5xl tracking-tight">
                            Mumbai<br /><span className="italic text-gold">Bombay.</span>
                        </h2>
                        <div className="mt-10 space-y-6 text-sm">
                            <div className="flex items-start gap-4 border-t hairline pt-6">
                                <MapPin className="h-4 w-4 text-gold mt-1 shrink-0" />
                                <div>
                                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Address</div>
                                    <div className="mt-2 leading-relaxed">
                                        Andheri West<br />Mumbai 400053<br />Maharashtra, India
                                    </div>
                                </div>
                            </div>
                            <div className="border-t hairline pt-6">
                                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Hours</div>
                                <div className="mt-2 text-sm leading-relaxed">Mon–Sat · 10:00 – 19:00 IST</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="eyebrow">Send a Message</div>
                        {sent ? (
                            <div className="mt-12 py-16 text-center border hairline animate-reveal">
                                <Check className="h-10 w-10 text-gold mx-auto" />
                                <h3 className="mt-6 font-display text-4xl">Message sent.</h3>
                                <p className="mt-3 text-muted-foreground">We'll be in touch within one business day.</p>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="mt-12 space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <F label="Name" name="name" required />
                                    <F label="Email" name="email" type="email" required />
                                </div>
                                <F label="Subject" name="subject" required />
                                <label className="block">
                                    <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">Message *</span>
                                    <textarea name="message" required rows={7} className="mt-3 w-full bg-transparent border-b hairline py-3 focus:outline-none focus:border-gold transition-colors resize-none" />
                                </label>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-gold text-primary-foreground px-8 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground transition-colors">
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function F({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}{required && " *"}</span>
            <input name={name} type={type} required={required} className="mt-3 w-full bg-transparent border-b hairline py-3 focus:outline-none focus:border-gold transition-colors" />
        </label>
    );
}