import type { ReactNode } from "react";

export function PageHero({
    eyebrow,
    title,
    subtitle,
    children,
}: {
    eyebrow: string;
    title: ReactNode;
    subtitle?: string;
    children?: ReactNode;
}) {
    return (
        <section className="pt-40 pb-20 md:pt-56 md:pb-28 border-b hairline">
            <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                <div className="eyebrow animate-reveal">{eyebrow}</div>
                <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-[8rem] leading-[0.92] tracking-[-0.03em] text-balance animate-reveal" style={{ animationDelay: "0.1s" }}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-8 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed animate-reveal" style={{ animationDelay: "0.2s" }}>
                        {subtitle}
                    </p>
                )}
                {children && <div className="mt-10 animate-reveal" style={{ animationDelay: "0.3s" }}>{children}</div>}
            </div>
        </section>
    );
}
