import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import w1 from "@/assets/work-1.jpg";
import w2 from "@/assets/work-2.jpg";
import w3 from "@/assets/work-3.jpg";

export const Route = createFileRoute("/work")({
    head: () => ({
        meta: [
            { title: "Our Work — Ankush Arya Casting" },
            { name: "description", content: "Selected casting credits across films, OTT series, advertising, music videos and brand campaigns." },
            { property: "og:title", content: "Our Work — Ankush Arya Casting" },
            { property: "og:description", content: "Selected casting credits — film, OTT, brand and music." },
            { property: "og:image", content: w1 },
        ],
    }),
    component: Work,
});

const PROJECTS = [
    { img: w1, title: "Untitled Anthology", year: "2024", type: "Streaming Series", client: "A Major OTT Platform", scope: "Lead + 38 supporting roles", featured: true },
    { img: w2, title: "House of Atelier", year: "2024", type: "Brand Campaign", client: "Luxury Fashion House", scope: "12 talents, 4 cities", featured: false },
    { img: w3, title: "Echoes", year: "2024", type: "Music Film", client: "Independent Label", scope: "Lead performer + ensemble", featured: false },
    { img: w1, title: "Quiet City", year: "2024", type: "Feature Film", client: "Production House", scope: "Full ensemble cast", featured: true },
    { img: w2, title: "Pulse Beverage", year: "2023", type: "TVC", client: "FMCG Brand", scope: "8 talents, hero campaign", featured: false },
    { img: w3, title: "Monsoon", year: "2023", type: "Web Series", client: "OTT Original", scope: "24 roles cast", featured: false },
];

const CATEGORIES = ["Film", "OTT Series", "Advertising", "Music Videos", "Brand Campaigns", "Editorial"];

function Work() {
    return (
        <>
            <PageHero
                eyebrow="Selected Work"
                title={<>Stories we helped <span className="italic text-gold">cast.</span></>}
                subtitle="A selection of recent collaborations across film, streaming, advertising and brand. Full reel and case studies available on request."
            />

            <section className="py-12 border-b hairline">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12 flex flex-wrap gap-x-10 gap-y-3 text-xs tracking-[0.24em] uppercase text-muted-foreground">
                    {CATEGORIES.map((c) => (
                        <span key={c}>{c}</span>
                    ))}
                </div>
            </section>

            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12 space-y-6">
                    {PROJECTS.map((p, i) => (
                        <article key={p.title + i} className={`group grid gap-6 md:gap-8 ${p.featured ? "md:grid-cols-1" : "md:grid-cols-[1.5fr_1fr]"}`}>
                            <div className={`relative overflow-hidden bg-muted ${p.featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                                <img src={p.img} alt={p.title} width={1400} height={900} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                                <div className="absolute top-6 left-6 text-[10px] tracking-[0.3em] uppercase text-gold">{String(i + 1).padStart(2, "0")} / {PROJECTS.length.toString().padStart(2, "0")}</div>
                            </div>
                            {!p.featured && (
                                <div className="flex flex-col justify-between py-2">
                                    <div>
                                        <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{p.type} · {p.year}</div>
                                        <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight">{p.title}</h2>
                                    </div>
                                    <div className="mt-8 space-y-2 text-sm">
                                        <div className="grid grid-cols-[100px_1fr] gap-4 border-t hairline pt-3">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Client</span>
                                            <span>{p.client}</span>
                                        </div>
                                        <div className="grid grid-cols-[100px_1fr] gap-4 border-t hairline pt-3">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Scope</span>
                                            <span>{p.scope}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {p.featured && (
                                <div className="grid md:grid-cols-3 gap-6 -mt-2">
                                    <div>
                                        <div className="text-[10px] tracking-[0.3em] uppercase text-gold">{p.type} · {p.year}</div>
                                        <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight">{p.title}</h2>
                                    </div>
                                    <div className="text-sm text-muted-foreground md:col-span-2 md:text-right md:self-end">
                                        {p.client} · {p.scope}
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}