import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/producers")({
    head: () => ({
        meta: [
            { title: "For Producers & Brands — Ankush Arya Casting" },
            { name: "description", content: "Submit a casting brief. Get a curated shortlist within 48 hours. Trusted by leading films, OTT platforms and brands." },
            { property: "og:title", content: "For Producers & Brands — Ankush Arya Casting" },
            { property: "og:description", content: "Submit a brief. Get a shortlist in 48 hours." },
        ],
    }),
    component: Producers,
});

const PROCESS = [
    { n: "01", title: "Brief", body: "Share your project, character notes, dates and budget range. Anything you have." },
    { n: "02", title: "Curate", body: "Our team builds a shortlist matched to your brief — usually within 48 hours." },
    { n: "03", title: "Self-Tape", body: "Audition reels, look tests and self-tapes delivered directly to your inbox." },
    { n: "04", title: "Onboard", body: "Once you've picked, we handle scheduling, contracts and on-set coordination." },
];

const WHY = [
    { stat: "10,000+", label: "Active Artists" },
    { stat: "48hrs", label: "Avg. Shortlist Time" },
    { stat: "200+", label: "Productions Cast" },
    { stat: "12", label: "Cities Covered" },
];

function Producers() {
    const [submitted, setSubmitted] = useState(false);
    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => document.getElementById("brief-form")?.scrollIntoView({ behavior: "smooth" }), 50);
    }

    return (
        <>
            <PageHero
                eyebrow="For Producers & Brands"
                title={<>Cast smarter. <span className="italic text-gold">Cast faster.</span></>}
                subtitle="From breakout actors to seasoned performers — a curated network built to move at the speed of production. Submit a brief, get a shortlist in 48 hours."
            />

            <section className="py-20 md:py-32 border-b hairline">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                        {WHY.map((w) => (
                            <div key={w.label} className="bg-background p-8 md:p-12 text-center">
                                <div className="font-display text-5xl md:text-6xl text-gold">{w.stat}</div>
                                <div className="mt-4 text-xs tracking-[0.24em] uppercase text-muted-foreground">{w.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 md:py-32">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">
                        <div className="lg:sticky lg:top-32 h-fit">
                            <div className="eyebrow">The Process</div>
                            <h2 className="mt-6 font-display text-5xl md:text-6xl leading-[0.95] tracking-tight">
                                From brief to <span className="italic text-gold">callback.</span>
                            </h2>
                            <p className="mt-6 text-muted-foreground leading-relaxed">
                                A casting workflow built for the realities of modern production — fast turnarounds, distributed teams, multi-format delivery.
                            </p>
                        </div>
                        <div className="space-y-px bg-border">
                            {PROCESS.map((s) => (
                                <div key={s.n} className="bg-background py-10 grid grid-cols-[60px_1fr] md:grid-cols-[100px_200px_1fr] gap-6">
                                    <div className="text-gold text-xs tracking-[0.3em]">{s.n}</div>
                                    <h3 className="font-display text-2xl md:text-3xl">{s.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed col-span-2 md:col-span-1">{s.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TALENT CATEGORIES */}
            <section className="py-24 md:py-32 border-t hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="eyebrow">Talent Categories</div>
                    <h2 className="mt-6 font-display text-5xl md:text-7xl tracking-tight max-w-3xl">
                        Cast every role on <span className="italic text-gold">your call sheet.</span>
                    </h2>
                    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { title: "Lead Actors", body: "Established and emerging performers ready to anchor a film or series." },
                            { title: "Supporting & Ensemble", body: "Deep bench across age, region and craft — for dense ensemble casts." },
                            { title: "Models & Faces", body: "Editorial, commercial and brand-specific faces across all formats." },
                            { title: "Child Artists", body: "Trained, chaperoned and compliance-ready talent ages 4–14." },
                            { title: "Dancers & Performers", body: "Trained dancers, stunt performers and movement specialists." },
                            { title: "Influencers & Creators", body: "Digital-native talent for branded content and co-creation." },
                        ].map((c) => (
                            <div key={c.title} className="border hairline p-8 md:p-10 hover:border-gold transition-colors group">
                                <h3 className="font-display text-2xl">{c.title}</h3>
                                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                                <ArrowRight className="mt-6 h-4 w-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BRIEF FORM */}
            <section id="brief-form" className="py-24 md:py-32 border-t hairline">
                <div className="mx-auto max-w-3xl px-6 md:px-12">
                    <div className="eyebrow text-center">Submit a Brief</div>
                    <h2 className="mt-6 font-display text-5xl md:text-7xl text-center tracking-tight">
                        Let's <span className="italic text-gold">cast it.</span>
                    </h2>

                    {submitted ? (
                        <div className="text-center py-24 animate-reveal">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-primary-foreground">
                                <Check className="h-7 w-7" />
                            </div>
                            <h3 className="mt-8 font-display text-4xl">Brief received.</h3>
                            <p className="mt-4 text-muted-foreground">
                                Expect a curated shortlist in your inbox within 48 hours.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="mt-16 space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input label="Your Name" name="name" required />
                                <Input label="Company / Production House" name="company" required />
                                <Input label="Work Email" name="email" type="email" required />
                                <Input label="Phone" name="phone" type="tel" />
                            </div>
                            <Input label="Project Title" name="project" required />
                            <div className="grid gap-6 md:grid-cols-2">
                                <Select label="Project Type" name="type" options={["Film", "OTT Series", "TVC", "Brand Campaign", "Music Video", "Editorial", "Other"]} required />
                                <Input label="Shoot Window" name="window" placeholder="e.g. March 2025" required />
                            </div>
                            <Textarea label="Character / Role Brief" name="brief" rows={6} placeholder="Describe the role(s) — age, look, language, references, anything else relevant…" required />
                            <div className="grid gap-6 md:grid-cols-2">
                                <Input label="Budget Range" name="budget" placeholder="Optional" />
                                <Input label="Location" name="location" placeholder="Mumbai, Goa, etc." />
                            </div>
                            <div className="pt-6 border-t hairline flex justify-end">
                                <button type="submit" className="bg-gold text-primary-foreground px-10 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground transition-colors">
                                    Send Brief
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}

function Input({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}{required && " *"}</span>
            <input name={name} type={type} required={required} placeholder={placeholder} className="mt-3 w-full bg-transparent border-b hairline py-3 focus:outline-none focus:border-gold transition-colors" />
        </label>
    );
}
function Textarea({ label, name, rows = 4, required, placeholder }: { label: string; name: string; rows?: number; required?: boolean; placeholder?: string }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}{required && " *"}</span>
            <textarea name={name} rows={rows} required={required} placeholder={placeholder} className="mt-3 w-full bg-transparent border-b hairline py-3 focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-muted-foreground/40" />
        </label>
    );
}
function Select({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}{required && " *"}</span>
            <select name={name} required={required} className="mt-3 w-full bg-transparent border-b hairline py-3 focus:outline-none focus:border-gold transition-colors">
                <option value="" className="bg-background">Select…</option>
                {options.map((o) => <option key={o} className="bg-background">{o}</option>)}
            </select>
        </label>
    );
}