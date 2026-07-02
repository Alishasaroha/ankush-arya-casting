import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import t1 from "@/assets/talent-1.jpg";
import t2 from "@/assets/talent-2.jpg";
import t3 from "@/assets/talent-3.jpg";
import t4 from "@/assets/talent-4.jpg";

export const Route = createFileRoute("/talent")({
    head: () => ({
        meta: [
            { title: "Talent — Ankush Arya Casting" },
            { name: "description", content: "Browse a curated selection of actors, models, performers and creators from a network of over 10,000 artists." },
            { property: "og:title", content: "Talent — Ankush Arya Casting" },
            { property: "og:description", content: "10,000+ artists. Filter by craft, find your cast." },
        ],
    }),
    component: Talent,
});

const FILTERS = ["All", "Actors", "Models", "Child Artists", "Dancers", "Influencers", "Performers"];

const TALENTS = [
    { img: t1, name: "Riya Malhotra", role: "Actor · Model", city: "Mumbai", cat: "Actors" },
    { img: t2, name: "Arjun Khanna", role: "Lead Actor", city: "Delhi", cat: "Actors" },
    { img: t3, name: "Saanvi Rao", role: "Performer · Dance", city: "Bangalore", cat: "Dancers" },
    { img: t4, name: "Vihaan", role: "Child Artist", city: "Mumbai", cat: "Child Artists" },
    { img: t1, name: "Aanya Sharma", role: "Model · Editorial", city: "Mumbai", cat: "Models" },
    { img: t2, name: "Karan Mehta", role: "Actor · Theatre", city: "Pune", cat: "Actors" },
    { img: t3, name: "Meera Iyer", role: "Performer", city: "Chennai", cat: "Performers" },
    { img: t4, name: "Aarav Singh", role: "Child Artist", city: "Delhi", cat: "Child Artists" },
];

function Talent() {
    const [active, setActive] = useState("All");
    const list = active === "All" ? TALENTS : TALENTS.filter((t) => t.cat === active);

    return (
        <>
            <PageHero
                eyebrow="The Roster"
                title={<>10,000+ artists.<br /><span className="italic text-gold">One network.</span></>}
                subtitle="A glimpse of the network. The full roster is available to registered producers and casting partners on a project-by-project basis."
            />

            <section className="sticky top-[72px] z-40 bg-background/90 backdrop-blur-xl border-b hairline">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12 py-5">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setActive(f)}
                                className={`shrink-0 px-5 py-2 text-[11px] tracking-[0.24em] uppercase border hairline transition-colors ${active === f ? "bg-foreground text-background border-foreground" : "hover:border-gold hover:text-gold"
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {list.map((p, i) => (
                            <div key={p.name + i} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                                    <img src={p.img} alt={p.name} width={800} height={1120} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105 grayscale group-hover:grayscale-0" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                                    <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] tracking-[0.28em] uppercase">
                                        <span className="text-gold">{String(i + 1).padStart(2, "0")}</span>
                                        <span className="text-foreground/70">{p.city}</span>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <div className="font-display text-xl md:text-2xl">{p.name}</div>
                                    <div className="mt-1 text-xs tracking-[0.2em] uppercase text-muted-foreground">{p.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-24 border-t hairline pt-16 text-center">
                        <div className="eyebrow">Looking for someone specific?</div>
                        <h3 className="mt-6 font-display text-4xl md:text-6xl">
                            Submit a brief, get a <span className="italic text-gold">shortlist.</span>
                        </h3>
                        <Link to="/producers" className="mt-10 inline-flex items-center gap-2 bg-gold text-primary-foreground px-7 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground transition-colors">
                            Submit a Casting Brief
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}