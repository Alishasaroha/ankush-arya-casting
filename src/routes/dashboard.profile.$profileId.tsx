import { useState, type FormEvent } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  getCurrentUserFn,
  getTalentProfileFn,
  updateTalentProfileFn,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/dashboard/profile/$profileId")({
  beforeLoad: async ({ params }) => {
    const auth = await getCurrentUserFn();

    if (!auth.authenticated) {
      throw redirect({ to: "/login" });
    }

    // The server function checks ownership/guardian/admin access for this ID.
    const { profile } = await getTalentProfileFn({
      data: { profileId: params.profileId },
    });

    return { profile, email: auth.user.email };
  },
  component: EditTalentProfilePage,
});

type ProfileForm = {
  fullName: string;
  dateOfBirth: string;
  heightCm: string;
  gender: string;
  location: string;
  bio: string;
};

function toDateInput(value: Date | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

function EditTalentProfilePage() {
  const { profile, email } = Route.useRouteContext();
  const [form, setForm] = useState<ProfileForm>(() => ({
    fullName: profile.fullName,
    dateOfBirth: toDateInput(profile.dateOfBirth),
    heightCm: profile.heightCm?.toString() ?? "",
    gender: profile.gender ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await updateTalentProfileFn({
        data: {
          profileId: profile.id,
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
          heightCm: form.heightCm === "" ? null : Number(form.heightCm),
          gender: form.gender,
          location: form.location,
          bio: form.bio,
        },
      });

      setMessage("Your talent profile has been updated.");
    } catch (saveError) {
      console.error("Talent profile update failed:", saveError);
      setError(
        "We couldn't save your changes. Please review the details and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <a
          href="/dashboard"
          className="text-xs uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
        >
          ← Back to dashboard
        </a>

        <header className="mt-8 border-b hairline pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Ankush Arya Casting
          </p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">
            Edit Talent Profile
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{email}</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 border hairline bg-surface p-6 md:p-8"
        >
          <div>
            <h2 className="font-display text-2xl">{profile.fullName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your details accurate so the agency has your latest profile.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Full name
              </span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Date of birth
              </span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  updateField("dateOfBirth", event.target.value)
                }
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Height (cm)
              </span>
              <input
                type="number"
                min={30}
                max={250}
                step={1}
                value={form.heightCm}
                onChange={(event) => updateField("heightCm", event.target.value)}
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Gender
              </span>
              <input
                maxLength={50}
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Current location
              </span>
              <input
                maxLength={150}
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                placeholder="City, State"
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Short bio
              </span>
              <textarea
                rows={5}
                maxLength={2000}
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="A short introduction about your experience and interests"
                className="w-full resize-y border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
              <span className="mt-2 block text-right text-xs text-muted-foreground">
                {form.bio.length}/2000
              </span>
            </label>
          </div>

          {message && (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t hairline pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <a
              href="/dashboard"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
