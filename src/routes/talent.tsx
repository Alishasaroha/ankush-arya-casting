
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ArrowRight, ShieldCheck, UserPlus, BriefcaseBusiness } from "lucide-react";

export const Route = createFileRoute("/talent")({
    head: () => ({
        meta: [
            { title: "Talent Network — Ankush Arya Casting" },
            {
                name: "description",
                content:
                    "Join Ankush Arya Casting and register your talent profile for film, advertisement and web series opportunities.",
            },
        ],
    }),
    component: Talent,
});

const CATEGORIES = [
    "Actors",
    "Models",
    "Child Artists",
    "Content Creators",
    "Influencers",
    "Other Performers",
];

function Talent() {
    return (
        <>
            <PageHero
                eyebrow="For Talent"
                title={<>Your talent.<br /><span className="italic text-gold">Your next opportunity.</span></>}
                subtitle="Join Ankush Arya Casting and introduce your talent to our casting team. We connect performers with opportunities across films, advertisements and web series."
            />

            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-[1200px] px-6 md:px-12">

                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <div className="eyebrow">Who can join</div>
                            <h2 className="mt-5 font-display text-4xl md:text-5xl">
                                Every talent has a story.
                            </h2>
                            <p className="mt-6 text-muted-foreground leading-relaxed">
                                We welcome performers and creators interested
                                in exploring opportunities in the entertainment
                                and advertising industry.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map((category) => (
                                <div
                                    key={category}
                                    className="border hairline p-5 md:p-7 flex items-center"
                                >
                                    <span className="text-sm tracking-wide">
                                        {category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 mt-24">
                        <div className="border-t hairline pt-7">
                            <UserPlus className="text-gold h-6 w-6" />
                            <h3 className="mt-5 font-display text-2xl">
                                Create your profile
                            </h3>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Register with your email and provide your
                                basic details.
                            </p>
                        </div>

                        <div className="border-t hairline pt-7">
                            <ShieldCheck className="text-gold h-6 w-6" />
                            <h3 className="mt-5 font-display text-2xl">
                                Private by default
                            </h3>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Your profile is not displayed in a public
                                talent directory.
                            </p>
                        </div>

                        <div className="border-t hairline pt-7">
                            <BriefcaseBusiness className="text-gold h-6 w-6" />
                            <h3 className="mt-5 font-display text-2xl">
                                Explore opportunities
                            </h3>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Our team can consider your profile for
                                relevant casting requirements.
                            </p>
                        </div>
                    </div>

                    <div className="mt-24 border-t hairline pt-16 text-center">
                        <div className="eyebrow">Start your journey</div>
                        <h2 className="mt-6 font-display text-4xl md:text-6xl">
                            Ready to introduce your
                            <span className="italic text-gold"> talent?</span>
                        </h2>

                        <Link
                            to="/join"
                            className="mt-10 inline-flex items-center gap-3 bg-gold text-primary-foreground px-8 py-4 text-xs tracking-[0.24em] uppercase hover:bg-foreground transition-colors"
                        >
                            Join as Talent
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
