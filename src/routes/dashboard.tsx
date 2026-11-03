import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useState } from "react";

import {
  getCurrentUserFn,
  getMyTalentProfilesFn,
  logoutFn,
} from "@/lib/auth.functions";

import { LogOut, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const auth = await getCurrentUserFn();

    if (!auth.authenticated) {
      throw redirect({ to: "/login" });
    }

    // This server function independently enforces role and record access.
    const { profiles } = await getMyTalentProfilesFn();

    return {
      user: auth.user,
      profiles,
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profiles } = Route.useRouteContext();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  // This is a parent route. Render its child route instead of the dashboard
  // when the user opens a nested page such as /dashboard/profile/:profileId.
  if (pathname.startsWith("/dashboard/profile/")) {
    return <Outlet />;
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      await logoutFn();

      await navigate({
        to: "/login",
        replace: true,
      });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
      setError("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between border-b hairline pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Ankush Arya Casting
            </p>

            <h1 className="mt-3 font-display text-3xl md:text-5xl">
              Your Account
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user.roles.includes("ADMIN") && (
              <a
                href="/admin/talents"
                className="inline-flex items-center gap-2 border hairline px-4 py-3 text-xs uppercase tracking-widest hover:border-gold"
              >
                <Users className="h-4 w-4" />
                Talent Directory
              </a>
            )}
            <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Signing Out..." : "Logout"}
            </button>
          </div>
        </div>

        <section className="mt-12 border hairline bg-surface p-8">
          <div className="flex items-center gap-3 text-gold">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs uppercase tracking-widest">
              Authenticated Account
            </span>
          </div>

          <h2 className="mt-6 font-display text-2xl">Welcome back</h2>

          <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>

          <div className="mt-8 border-t hairline pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Account Roles
            </p>

            <p className="mt-2 text-sm">{user.roles.join(", ")}</p>
          </div>
        </section>

        <section className="mt-8 border hairline bg-surface p-8">
          <h2 className="font-display text-2xl">Accessible Talent Profiles</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Only profiles permitted by your account roles and relationships are
            returned by the server.
          </p>

          {profiles.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No talent profiles are currently linked to your account.
            </p>
          ) : (
            <div className="mt-6 divide-y divide-border">
              {profiles.map((profile) => (
                <article key={profile.id} className="py-4 first:pt-0">
                  <h3 className="font-medium">{profile.fullName}</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {[profile.location, profile.heightCm ? `${profile.heightCm} cm` : null]
                      .filter(Boolean)
                      .join(" · ") || "Profile details not added yet"}
                  </p>
                  <Link
                    to="/dashboard/profile/$profileId"
                    params={{ profileId: profile.id }}
                    className="mt-3 inline-block text-xs uppercase tracking-widest text-gold underline-offset-4 hover:underline"
                  >
                    Edit profile
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Your private talent account is accessible only through an
          authenticated session and server-side permissions.
        </p>
      </div>
    </main>
  );
}
