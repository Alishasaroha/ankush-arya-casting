import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Film, Camera, Sparkles, Users } from "lucide-react";
import hero from "@/assets/hero-1.jpg";
import t1 from "@/assets/talent-1.jpg";
import t2 from "@/assets/talent-2.jpg";
import t3 from "@/assets/talent-3.jpg";
import t4 from "@/assets/talent-4.jpg";
import w1 from "@/assets/work-1.jpg";
import w2 from "@/assets/work-2.jpg";
import w3 from "@/assets/work-3.jpg";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Ankush Arya Casting — India's Talent Network" },
            { name: "description", content: "India's talent network. Casting actors, models, performers and creators for leading films, brands and OTT productions." },
            { property: "og:title", content: "Ankush Arya Casting" },
            { property: "og:description", content: "India's talent network. Cast your next story." },
        ],
    }),
    component: Home,
});

const CATEGORIES = [
    { label: "Actors" },
    { label: "Child Artists" },
    { label: "Content Creators" },
];

const SERVICES = [
  {
    icon: Film,
    title: "Film Casting",
    body: "Casting actors and performers for feature films, short films and OTT productions."
  },
  {
    icon: Camera,
    title: "Advertisement Casting",
    body: "Finding the perfect faces for TV commercials, digital campaigns and brand promotions."
  },
  {
    icon: Sparkles,
    title: "Music Video Casting",
    body: "Casting performers, dancers and creators for music videos and entertainment projects."
  },
  {
    icon: Users,
    title: "Artist Management",
    body: "Supporting artists with opportunities, representation and career growth."
  },
];

function Home() {
    return (
        <>
            {/* HERO */}
            <section className="relative min-h-[100svh] flex items-end overflow-hidden film-grain vignette">
                <div className="absolute inset-0">
                    <img
                        src={hero}
                        alt="Cinematic portrait under a single spotlight"
                        className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
                        width={1920}
                        height={1280}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />
                </div>

                <div className="relative w-full mx-auto max-w-[1600px] px-6 md:px-12 pb-16 md:pb-24">
                    <div className="eyebrow animate-fade-slow">CASTING FOR FILMS · ADS · WEB SERIES</div>
                    <h1 className="mt-6 font-display text-[clamp(3rem,11vw,12rem)] leading-[0.86] tracking-[-0.04em] text-balance animate-reveal" style={{ animationDelay: "0.2s" }}>
                        Finding the right face
                        <br />
                        <span className="italic font-light text-gold">for every story.</span>
                    </h1>
                    <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end animate-reveal" style={{ animationDelay: "0.5s" }}>
                        <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
                            Connecting filmmakers, production houses and brands with the right talent for films, advertisements, web series and digital projects.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/producers" className="inline-flex items-center gap-2 bg-gold text-primary-foreground px-7 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground transition-colors">
                                Cast With Us <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link to="/join" className="inline-flex items-center gap-2 border hairline px-7 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors">
                                Join as Talent
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* MARQUEE */}
            <section className="border-y hairline overflow-hidden py-8 bg-surface">
                <div className="flex animate-marquee gap-16 whitespace-nowrap">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-16 items-center">
                            <span className="font-display text-3xl md:text-5xl italic text-muted-foreground">
                                FILM · ADVERTISEMENTS · WEB SERIES · DIGITAL PROJECTS <span className="text-gold mx-8">✦</span>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* THE NETWORK */}
            <section className="py-24 md:py-40">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-32 items-start">
                        <div className="lg:sticky lg:top-32">
                            <div className="eyebrow">01 — The Network</div>
                            <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em]">
                                A talent network
                                <br />
                                <span className="italic text-gold">built across </span> India.
                            </h2>
                            <p className="mt-8 text-muted-foreground leading-relaxed max-w-md">
                                From fresh faces to experienced performers,
                                our network helps producers discover the right talent
                                quickly and efficiently.
                            </p>
                            <Link to="/talent" className="mt-10 inline-flex items-center gap-2 text-gold text-[11px] tracking-[0.28em] uppercase gold-underline">
                                Browse Talent <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-px bg-border">
                            {CATEGORIES.map((c) => (
                                <div key={c.label} className="bg-background p-8 md:p-12 group hover:bg-surface transition-colors">
                                    <div className="font-display text-3xl md:text-5xl text-gold">{c.label}</div>
                                    <div className="mt-4 text-xs tracking-[0.24em] uppercase text-muted-foreground">Talent Network</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED TALENT */}
            <section className="py-24 md:py-40 border-t hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
                        <div>
                            <div className="eyebrow">02 — Featured Talent</div>
                            <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em]">
                                Faces of <span className="italic text-gold">the moment.</span>
                            </h2>
                        </div>
                        <Link to="/talent" className="text-[11px] tracking-[0.28em] uppercase gold-underline self-start">
                            View All Talent →
                        </Link>
                    </div>

                    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                        {[
                            { img: t1, name: "Riya Malhotra", role: "Actor · Model" },
                            { img: t2, name: "Arjun Khanna", role: "Lead Actor" },
                            { img: t3, name: "Saanvi Rao", role: "Performer · Dance" },
                            { img: t4, name: "Vihaan", role: "Child Artist" },
                        ].map((p, i) => (
                            <div key={p.name} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                                    <img
                                        src={p.img}
                                        alt={p.name}
                                        width={800}
                                        height={1120}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                                    <div className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-gold">0{i + 1}</div>
                                </div>
                                <div className="mt-5">
                                    <div className="font-display text-2xl">{p.name}</div>
                                    <div className="mt-1 text-xs tracking-[0.2em] uppercase text-muted-foreground">{p.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 md:py-40">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="max-w-2xl mb-20">
                        <div className="eyebrow">03 — What We Do</div>
                        <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em]">
                            From brief to <span className="italic text-gold">call sheet.</span>
                        </h2>
                    </div>

                    <div className="grid gap-px bg-border md:grid-cols-2">
                        {SERVICES.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.title} className="bg-background p-10 md:p-16">
                                    <div className="flex items-start gap-6">
                                        <div className="text-gold text-xs tracking-[0.28em]">0{i + 1}</div>
                                        <Icon className="h-6 w-6 text-gold shrink-0" />
                                    </div>
                                    <h3 className="mt-8 font-display text-3xl md:text-4xl tracking-tight">{s.title}</h3>
                                    <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">{s.body}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* WORK */}
            <section className="py-24 md:py-40 border-t hairline">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
                        <div>
                            <div className="eyebrow">04 — Selected Work</div>
                            <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em]">
                                Recent <span className="italic text-gold">credits.</span>
                            </h2>
                        </div>
                        <Link to="/work" className="text-[11px] tracking-[0.28em] uppercase gold-underline self-start">
                            Full Portfolio →
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { img: w1, title: "Untitled Anthology", type: "Streaming Series · 2024" },
                            { img: w2, title: "House of Atelier", type: "Brand Campaign · 2024" },
                            { img: w3, title: "Echoes", type: "Music Film · 2024" },
                        ].map((p) => (
                            <div key={p.title} className="group">
                                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                                    <img src={p.img} alt={p.title} width={1400} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                                    <div className="absolute bottom-0 inset-x-0 p-8">
                                        <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{p.type}</div>
                                        <h3 className="mt-3 font-display text-3xl">{p.title}</h3>
                                        <div className="mt-2 text-xs text-muted-foreground">Casting & Talent Direction</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SPLIT */}
            <section className="grid md:grid-cols-2 border-t hairline">
                <Link to="/join" className="group relative p-12 md:p-20 lg:p-28 border-r hairline hover:bg-surface transition-colors">
                    <div className="eyebrow">For Talent</div>
                    <h3 className="mt-6 font-display text-4xl md:text-6xl leading-[0.95] tracking-tight">
                       Showcase your<br /><span className="italic text-gold">talent.</span>
                    </h3>
                    <p className="mt-6 text-muted-foreground max-w-sm">
                        Create your talent profile and share your details directly with Ankush Arya Casting.
                    </p>
                    <div className="mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase">
                        Join the Network <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </Link>
                <Link to="/producers" className="group relative p-12 md:p-20 lg:p-28 bg-gold text-primary-foreground hover:bg-foreground hover:text-background transition-colors">
                    <div className="text-[11px] tracking-[0.28em] uppercase opacity-80">For Producers & Brands</div>
                    <h3 className="mt-6 font-display text-4xl md:text-6xl leading-[0.95] tracking-tight">
                        Cast your<br /><span className="italic">next story.</span>
                    </h3>
                    <p className="mt-6 max-w-sm opacity-80">
                        Submit a brief. Get a curated shortlist of pre-vetted talent within 48 hours.
                    </p>
                    <div className="mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase">
                        Submit a Brief <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                </Link>
            </section>
        </>
    );
}
