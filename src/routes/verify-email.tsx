import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { verifyEmailFn } from "@/lib/auth.functions";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  async function handleVerification() {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    setStatus("loading");

    try {
      const result = await verifyEmailFn({
        data: { token },
      });

      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
    } catch (error) {
      console.error("Verification request failed:", error);

      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-lg border hairline bg-surface p-8 md:p-12 text-center">

        <div className="flex justify-center mb-6">
          <ShieldCheck className="h-12 w-12 text-gold" />
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Ankush Arya Casting
        </p>

        <h1 className="mt-4 font-display text-3xl md:text-4xl">
          Email Verification
        </h1>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Verify your email address to confirm ownership of your account.
        </p>

        {status === "idle" && (
          <button
            onClick={handleVerification}
            disabled={!token}
            className="mt-8 w-full bg-gold text-primary-foreground py-4 text-xs tracking-[0.25em] uppercase font-medium disabled:opacity-50"
          >
            Verify Email
          </button>
        )}

        {status === "loading" && (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying your email...
          </div>
        )}

        {(status === "success" || status === "error") && (
          <div
            role={status === "error" ? "alert" : "status"}
            className="mt-8 border hairline p-5"
          >
            {status === "success" ? (
              <ShieldCheck className="h-7 w-7 text-gold mx-auto mb-3" />
            ) : (
              <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-3" />
            )}

            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

      </div>
    </main>
  );
}