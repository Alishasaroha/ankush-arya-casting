import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Check } from "lucide-react";

export const Route = createFileRoute("/join")({
    head: () => ({
        meta: [
            { title: "Join as Talent — Ankush Arya Casting" },
            { name: "description", content: "Register with Ankush Arya Casting. Submit your portfolio, experience and contact details to be considered for upcoming castings." },
            { property: "og:title", content: "Join as Talent — Ankush Arya Casting" },
            { property: "og:description", content: "Register your profile. Get cast." },
        ],
    }),
    component: Join,
});

const CATEGORIES = ["Actor", "Model", "Child Artist", "Influencer", "Dancer", "Performer", "Content Creator", "Other"];

const STEPS = [
    { n: "01", title: "Submit", body: "Share your basics, portfolio and a short reel. Takes about 8 minutes." },
    { n: "02", title: "Review", body: "Our team reviews every submission within 5–7 business days." },
    { n: "03", title: "Onboard", body: "Approved profiles join the active roster — visible to producers immediately." },
];

function Join() {
    const [submitted, setSubmitted] = useState(false);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }

    return (
        <>
            <PageHero
                eyebrow="Join the Network"
                title={<>Your face. Your story. <span className="italic text-gold">Our roster.</span></>}
                subtitle="Submit your profile to be considered for casting across films, OTT series, advertising and brand campaigns. Every submission is personally reviewed."
            />

            <section className="py-20 md:py-28 border-b hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-px bg-border md:grid-cols-3">
                        {STEPS.map((s) => (
                            <div key={s.n} className="bg-surface p-10 md:p-14">
                                <div className="text-gold text-xs tracking-[0.3em]">{s.n}</div>
                                <h3 className="mt-6 font-display text-3xl">{s.title}</h3>
                                <p className="mt-4 text-muted-foreground leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 md:py-32">
                <div className="mx-auto max-w-3xl px-6 md:px-12">
                    {submitted ? (
                        <div className="text-center py-24 animate-reveal">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-primary-foreground">
                                <Check className="h-7 w-7" />
                            </div>
                            <div className="eyebrow mt-8">Submission Received</div>
                            <h2 className="mt-6 font-display text-5xl md:text-6xl">
                                Thank you. We'll be<br /><span className="italic text-gold">in touch.</span>
                            </h2>
                            <p className="mt-6 text-muted-foreground max-w-md mx-auto">
                                Our team reviews every submission within 5–7 business days. If your profile is a fit, you'll hear from us at the email you provided.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-12">
                            <FormSection n="01" title="The Basics">
                                <FormRow>
                                    <Field label="Full Name" name="name" required />
                                    <Field label="Stage Name (optional)" name="stageName" />
                                </FormRow>
                                <FormRow>
                                    <Field label="Email" name="email" type="email" required />
                                    <Field label="Phone / WhatsApp" name="phone" type="tel" required />
                                </FormRow>
                                <FormRow>
                                    <Field label="City" name="city" required />
                                    <Field label="Age" name="age" type="number" required />
                                </FormRow>
                            </FormSection>

                            <FormSection n="02" title="Your Craft">
                                <div>
                                    <label className="text-xs tracking-[0.24em] uppercase text-muted-foreground">Primary Category *</label>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {CATEGORIES.map((c) => (
                                            <label key={c} className="cursor-pointer">
                                                <input type="radio" name="category" value={c} required className="peer sr-only" />
                                                <span className="block border hairline px-4 py-2 text-xs tracking-[0.2em] uppercase hover:border-gold peer-checked:bg-gold peer-checked:text-primary-foreground peer-checked:border-gold transition-colors">
                                                    {c}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <TextArea label="Experience & Notable Work" name="experience" placeholder="Briefly tell us about your background, training and any prior projects…" rows={5} />
                                <Field label="Skills (acting style, languages, special skills)" name="skills" />
                            </FormSection>

                            <FormSection n="03" title="Portfolio & Links">
                                <Field label="Portfolio / Reel URL" name="portfolio" type="url" placeholder="https://…" />
                                <FormRow>
                                    <Field label="Instagram" name="instagram" placeholder="@handle" />
                                    <Field label="Other Social" name="social" placeholder="YouTube, TikTok, etc." />
                                </FormRow>
                                <div>
                                    <label className="text-xs tracking-[0.24em] uppercase text-muted-foreground">Upload Headshots</label>
                                    <div className="mt-3 border border-dashed hairline p-10 text-center cursor-pointer hover:border-gold transition-colors">
                                        <input type="file" accept="image/*" multiple className="hidden" id="photos" />
                                        <label htmlFor="photos" className="cursor-pointer">
                                            <div className="font-display text-2xl">Drop photos here</div>
                                            <div className="mt-2 text-xs text-muted-foreground tracking-wider">JPG or PNG · up to 10 files · 10MB each</div>
                                        </label>
                                    </div>
                                </div>
                            </FormSection>

                            <div className="border-t hairline pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                                    By submitting, you agree to be contacted by Ankush Arya Casting regarding casting opportunities.
                                </p>
                                <button type="submit" className="bg-gold text-primary-foreground px-8 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground transition-colors">
                                    Submit Profile
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}

function FormSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
    return (
        <div className="border-t hairline pt-10">
            <div className="flex items-baseline gap-4 mb-8">
                <span className="text-gold text-xs tracking-[0.3em]">{n}</span>
                <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}

function FormRow({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}{required && " *"}</span>
            <input
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                className="mt-3 w-full bg-transparent border-b hairline py-3 text-base focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/40"
            />
        </label>
    );
}

function TextArea({ label, name, rows = 4, placeholder }: { label: string; name: string; rows?: number; placeholder?: string }) {
    return (
        <label className="block">
            <span className="text-xs tracking-[0.24em] uppercase text-muted-foreground">{label}</span>
            <textarea
                name={name}
                rows={rows}
                placeholder={placeholder}
                className="mt-3 w-full bg-transparent border-b hairline py-3 text-base focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/40 resize-none"
            />
        </label>
    );
}