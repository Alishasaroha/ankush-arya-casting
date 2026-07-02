console.log("REAL ROOT FILE LOADED"); import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    Outlet,
    Link,
    createRootRouteWithContext,
    useRouter,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";

function NotFoundComponent() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="max-w-md text-center">
                <div className="eyebrow">Error 404</div>
                <h1 className="mt-6 font-display text-7xl tracking-tight">Off Script.</h1>
                <p className="mt-4 text-sm text-muted-foreground">
                    This page doesn't exist in our archives.
                </p>
                <Link
                    to="/"
                    className="mt-10 inline-flex items-center border hairline px-6 py-3 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
    console.error(error);
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="max-w-md text-center">
                <div className="eyebrow">Something broke</div>
                <h1 className="mt-6 font-display text-5xl tracking-tight">Cut.</h1>
                <p className="mt-4 text-sm text-muted-foreground">
                    The page didn't load. Try again or head home.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => { router.invalidate(); reset(); }}
                        className="border hairline px-6 py-3 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="border hairline px-6 py-3 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Ankush Arya Casting — India's Talent Network" },
            { name: "description", content: "Casting agency and talent network connecting 10,000+ actors, models and performers with India's leading producers, brands and storytellers." },
            { name: "author", content: "Ankush Arya Casting" },
            { property: "og:title", content: "Ankush Arya Casting" },
            { property: "og:description", content: "India's emerging talent discovery platform — 10,000+ artists, one network." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200..600;1,9..144,200..500&family=Inter:wght@300;400;500;600&display=swap",
            },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const { queryClient } = Route.useRouteContext();

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <SiteHeader />
                <main className="flex-1">
                    <Outlet />
                </main>
                <SiteFooter />
            </div>
        </QueryClientProvider>
    );
}