import { createFileRoute, Link ,useNavigate} from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  loginFn,
  getCurrentUserFn,
} from "@/lib/auth.functions";

import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Ankush Arya Casting" },
      {
        name: "description",
        content: "Sign in to your private talent account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("idle");
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await loginFn({
        data: { email, password },
      });

      if (!result.success) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      // Confirm that the browser received a usable session.
      const session = await getCurrentUserFn();

      if (!session.authenticated) {
        setStatus("error");
        setMessage(
          "Your credentials were accepted, but we couldn't confirm your session. Please try again."
        );
        return;
      }

      setPassword("");

await navigate({
  to: "/dashboard",
  replace: true,
});
    } catch (error) {
      console.error("Login request failed:", error);

      setStatus("error");
      setMessage("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-lg border hairline bg-surface p-8 md:p-12">

        <div className="flex justify-center mb-6">
          <ShieldCheck className="h-12 w-12 text-gold" />
        </div>

        <p className="text-center text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Ankush Arya Casting
        </p>

        <h1 className="mt-4 text-center font-display text-3xl md:text-4xl">
          Welcome Back
        </h1>

        <p className="mt-4 text-center text-sm text-muted-foreground leading-relaxed">
          Sign in to access your private talent account.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">

          <div>
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.2em] uppercase text-muted-foreground"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-3 w-full bg-transparent border-b hairline py-3 text-base text-foreground focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.2em] uppercase text-muted-foreground"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-3 w-full bg-transparent border-b hairline py-3 text-base text-foreground focus:outline-none focus:border-gold"
            />
          </div>

          {status !== "idle" && (
            <div
              role={status === "error" ? "alert" : "status"}
              aria-live="polite"
              className="border hairline p-4 flex items-start gap-3"
            >
              {status === "success" ? (
                <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              )}

              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-3 bg-gold text-primary-foreground px-8 py-4 text-xs tracking-[0.25em] uppercase font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

        </form>

        <div className="mt-10 pt-6 border-t hairline text-center">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/join"
              className="text-gold underline underline-offset-4"
            >
              Register here
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Your account and talent information remain private.
        </p>

      </div>
    </main>
  );
}