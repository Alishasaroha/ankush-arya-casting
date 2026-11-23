import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { resetPasswordFn } from "@/lib/auth.functions";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — Ankush Arya Casting" },
      {
        name: "description",
        content: "Choose a new password for your Ankush Arya Casting account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const hasToken = /^[a-f0-9]{64}$/i.test(token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasToken) {
      setStatus("error");
      setMessage("This password reset link is invalid or incomplete.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await resetPasswordFn({
        data: { token, password, confirmPassword },
      });
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);

      if (result.success) {
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Password reset submission failed:", error);
      setStatus("error");
      setMessage("Unable to reset your password. Please request a new link.");
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
          Set a New Password
        </h1>

        <p className="mt-4 text-center text-sm text-muted-foreground leading-relaxed">
          Choose a new password for your account. It must contain at least
          eight characters.
        </p>

        {!hasToken ? (
          <div className="mt-8 border hairline p-5 text-center">
            <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or incomplete. Request a new link.
            </p>
            <Link
              to="/forgot-password"
              className="mt-5 inline-block text-xs text-gold underline underline-offset-4"
            >
              Request another reset link
            </Link>
          </div>
        ) : status === "success" ? (
          <div className="mt-8 border hairline p-5 text-center">
            <ShieldCheck className="h-7 w-7 text-gold mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-2 text-xs text-gold underline underline-offset-4"
            >
              Continue to sign in
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label
                htmlFor="password"
                className="block text-xs tracking-[0.2em] uppercase text-muted-foreground"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="mt-3 w-full bg-transparent border-b hairline py-3 text-base text-foreground focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs tracking-[0.2em] uppercase text-muted-foreground"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                className="mt-3 w-full bg-transparent border-b hairline py-3 text-base text-foreground focus:outline-none focus:border-gold"
              />
            </div>

            {status === "error" && (
              <div role="alert" aria-live="polite" className="border hairline p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-muted-foreground">{message}</p>
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
                  Updating...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-10 pt-6 border-t hairline text-center">
          <Link
            to="/login"
            className="text-xs text-gold underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
