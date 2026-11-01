import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/about")({
    head: () => ({
        meta: [
            { title: "About — Ankush Arya Casting" },
            { name: "description", content: "The story, vision and mission behind Ankush Arya Casting — India's emerging talent discovery platform." },
            { property: "og:title", content: "About — Ankush Arya Casting" },
            { property: "og:description", content: "A casting agency built for the next decade of Indian storytelling." },
        ],
    }),
    component: About,
});

const MILESTONES = [
    { year: "2019", title: "Beginnings", body: "Founded in Mumbai with a roster of 200 actors and a single conviction — that India's next wave of storytelling deserves a casting partner built for it." },
    { year: "2021", title: "Going National", body: "Expanded the network across Delhi, Bangalore, Chennai and Kolkata. First original series casting credit." },
    { year: "2023", title: "Brand & OTT", body: "Crossed 5,000 artists. Signed long-form retainers with two major OTT platforms and a roster of D2C brands." },
    { year: "2025", title: "The Platform", body: "10,000+ artists. A network reimagined as a platform — talent discovery, casting workflow, and representation in one." },
];

const VALUES = [
    { n: "01", title: "Curation Over Volume", body: "Every artist on the roster is reviewed, briefed and represented — never an open directory." },
    { n: "02", title: "Speed With Taste", body: "Curated shortlists in 48 hours. Producers get options that already feel right." },
    { n: "03", title: "Long-Term Careers", body: "We back our talent beyond a single project — managing visibility, training and trajectory." },
];

function About() {
    return (
        <>
            <div>
                <h1>TEST HERO</h1>
            </div>

            <section className="py-24 md:py-32">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">
                        <div className="eyebrow lg:sticky lg:top-32 h-fit">Vision & Mission</div>
                        <div className="space-y-10 max-w-3xl">
                            <p className="font-display text-3xl md:text-5xl leading-[1.1] tracking-tight text-balance">
                                To become the <span className="italic text-gold">single source of truth</span> for talent in Indian entertainment — a network so deep and so well-managed that it reshapes how stories get cast.
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                We believe casting is the first creative decision of any production — and the most consequential. Get it right and the rest of the work flows. We're here to make that decision faster, sharper, and more imaginative than it has ever been.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 md:py-32 border-t hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="eyebrow mb-16">The Journey</div>
                    <div className="grid gap-px bg-border">
                        {MILESTONES.map((m) => (
                            <div key={m.year} className="bg-surface grid md:grid-cols-[200px_1fr_2fr] gap-8 p-10 md:p-16 items-start">
                                <div className="font-display text-5xl text-gold">{m.year}</div>
                                <h3 className="font-display text-2xl md:text-3xl">{m.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{m.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 md:py-32 border-t hairline">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="eyebrow mb-16">How We Work</div>
                    <div className="grid gap-12 md:grid-cols-3">
                        {VALUES.map((v) => (
                            <div key={v.n} className="border-t hairline pt-8">
                                <div className="text-gold text-xs tracking-[0.3em]">{v.n}</div>
                                <h3 className="mt-6 font-display text-3xl">{v.title}</h3>
                                <p className="mt-5 text-muted-foreground leading-relaxed">{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}