import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  getCurrentUserFn,
  logoutFn,
} from "@/lib/auth.functions";

import { ShieldCheck, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const result = await getCurrentUserFn();

    if (!result.authenticated) {
      throw redirect({ to: "/login" });
    }

    return { user: result.user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      await logoutFn();

      await navigate({
        to: "/login",
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-4xl">

        <div className="flex justify-between items-center border-b hairline pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Ankush Arya Casting
            </p>

            <h1 className="mt-3 font-display text-3xl md:text-5xl">
              Your Account
            </h1>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Signing Out..." : "Logout"}
          </button>
        </div>

        <section className="mt-12 border hairline bg-surface p-8">
          <div className="flex items-center gap-3 text-gold">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs uppercase tracking-widest">
              Authenticated Account
            </span>
          </div>

          <h2 className="mt-6 font-display text-2xl">
            Welcome back
          </h2>

          <p className="mt-3 text-sm text-muted-foreground">
            {user.email}
          </p>

          <div className="mt-8 border-t hairline pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Account Roles
            </p>

            <p className="mt-2 text-sm">
              {user.roles.join(", ")}
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Your private talent account is accessible only through an authenticated session.
        </p>

      </div>
    </main>
  );
}