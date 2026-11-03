import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

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

    const { profile } = await getTalentProfileFn({
      data: { profileId: params.profileId },
    });

    return { profile, email: auth.user.email };
  },
  component: EditTalentProfilePage,
});

type ProfileLinkDraft = { title: string; url: string };
type PhotoDraft = { url: string; altText: string };
type LinkListName = "previousWorkLinks" | "portfolioLinks";

type ProfileForm = {
  fullName: string;
  dateOfBirth: string;
  heightCm: string;
  gender: string;
  location: string;
  bio: string;
  languages: string;
  experienceYears: string;
  experienceSummary: string;
  instagramHandle: string;
  introVideoUrl: string;
  previousWorkLinks: ProfileLinkDraft[];
  portfolioLinks: ProfileLinkDraft[];
  photos: PhotoDraft[];
};

function toDateInput(value: Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
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
    languages: profile.languages.join(", "),
    experienceYears: profile.experienceYears?.toString() ?? "",
    experienceSummary: profile.experienceSummary ?? "",
    instagramHandle: profile.instagramHandle ?? "",
    introVideoUrl: profile.introVideoUrl ?? "",
    previousWorkLinks: profile.links
      .filter((link) => link.type === "PREVIOUS_WORK")
      .map(({ title, url }) => ({ title, url })),
    portfolioLinks: profile.links
      .filter((link) => link.type === "PORTFOLIO")
      .map(({ title, url }) => ({ title, url })),
    photos: profile.photos.map(({ url, altText }) => ({
      url,
      altText: altText ?? "",
    })),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearStatus() {
    setMessage("");
    setError("");
  }

  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    clearStatus();
  }

  function updateLink(list: LinkListName, index: number, field: keyof ProfileLinkDraft, value: string) {
    setForm((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    clearStatus();
  }

  function addLink(list: LinkListName) {
    setForm((current) => ({
      ...current,
      [list]: [...current[list], { title: "", url: "" }],
    }));
    clearStatus();
  }

  function removeLink(list: LinkListName, index: number) {
    setForm((current) => ({
      ...current,
      [list]: current[list].filter((_, itemIndex) => itemIndex !== index),
    }));
    clearStatus();
  }

  function updatePhoto(index: number, field: keyof PhotoDraft, value: string) {
    setForm((current) => ({
      ...current,
      photos: current.photos.map((photo, photoIndex) =>
        photoIndex === index ? { ...photo, [field]: value } : photo,
      ),
    }));
    clearStatus();
  }

  function addPhoto() {
    setForm((current) => ({
      ...current,
      photos: [...current.photos, { url: "", altText: "" }],
    }));
    clearStatus();
  }

  function removePhoto(index: number) {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
    clearStatus();
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
          languages: form.languages.split(",").map((item) => item.trim()).filter(Boolean),
          experienceYears: form.experienceYears === "" ? null : Number(form.experienceYears),
          experienceSummary: form.experienceSummary,
          instagramHandle: form.instagramHandle,
          introVideoUrl: form.introVideoUrl,
          previousWorkLinks: form.previousWorkLinks.filter((item) => item.title.trim() || item.url.trim()),
          portfolioLinks: form.portfolioLinks.filter((item) => item.title.trim() || item.url.trim()),
          photos: form.photos.filter((item) => item.url.trim() || item.altText.trim()),
        },
      });
      setMessage("Your talent profile has been updated.");
    } catch (saveError) {
      console.error("Talent profile update failed:", saveError);
      setError("We couldn't save your changes. Check that each added link uses HTTPS and that all entries are complete.");
    } finally {
      setIsSaving(false);
    }
  }

  function renderLinkCollection(list: LinkListName, heading: string) {
    const items = form[list];

    return (
      <section className="space-y-5 border-t hairline pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">{heading}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add a title and a public HTTPS link for each item.</p>
          </div>
          <button type="button" onClick={() => addLink(list)} className="border hairline px-4 py-2 text-xs uppercase tracking-widest hover:border-gold">
            + Add link
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No links added yet.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="grid gap-4 border hairline p-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Title</span>
                <input required maxLength={120} value={item.title} onChange={(event) => updateLink(list, index, "title", event.target.value)} placeholder="Project or portfolio title" className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">URL</span>
                <input required type="url" value={item.url} onChange={(event) => updateLink(list, index, "url", event.target.value)} placeholder="https://..." className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <button type="button" onClick={() => removeLink(list, index)} className="text-left text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive md:col-span-2">
                Remove link
              </button>
            </div>
          ))
        )}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="text-xs uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline">
          ← Back to dashboard
        </Link>

        <header className="mt-8 border-b hairline pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Ankush Arya Casting</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">Edit Talent Profile</h1>
          <p className="mt-3 text-sm text-muted-foreground">{email}</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 border hairline bg-surface p-6 md:p-8">
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-2xl">Basic Information</h2>
              <p className="mt-2 text-sm text-muted-foreground">Keep your personal details accurate and up to date.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Full name</span>
                <input required minLength={2} maxLength={100} value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Date of birth</span>
                <input type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Height (cm)</span>
                <input type="number" min={30} max={250} step={1} value={form.heightCm} onChange={(event) => updateField("heightCm", event.target.value)} className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Gender</span>
                <input maxLength={50} value={form.gender} onChange={(event) => updateField("gender", event.target.value)} className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Current location</span>
                <input maxLength={150} value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="City, State" className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Short bio</span>
                <textarea rows={4} maxLength={2000} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder="A short introduction about yourself" className="w-full resize-y border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              </label>
            </div>
          </section>

          <section className="space-y-6 border-t hairline pt-8">
            <div>
              <h2 className="font-display text-2xl">Languages & Experience</h2>
              <p className="mt-2 text-sm text-muted-foreground">Tell the agency which languages you speak and about your work.</p>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Languages known</span>
              <input value={form.languages} onChange={(event) => updateField("languages", event.target.value)} placeholder="Hindi, English, Punjabi" className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              <span className="mt-2 block text-xs text-muted-foreground">Separate languages with commas.</span>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Years of experience</span>
              <input type="number" min={0} max={80} step={1} value={form.experienceYears} onChange={(event) => updateField("experienceYears", event.target.value)} placeholder="e.g. 3" className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold md:max-w-xs" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Experience details</span>
              <textarea rows={4} maxLength={2000} value={form.experienceSummary} onChange={(event) => updateField("experienceSummary", event.target.value)} placeholder="Describe your acting, modelling, theatre, or other relevant experience." className="w-full resize-y border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
            </label>
          </section>

          {renderLinkCollection("previousWorkLinks", "Previous Work")}
          {renderLinkCollection("portfolioLinks", "Portfolio Links")}

          <section className="space-y-6 border-t hairline pt-8">
            <div>
              <h2 className="font-display text-2xl">Social & Introduction</h2>
              <p className="mt-2 text-sm text-muted-foreground">Add public links the agency can use to review your profile.</p>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Instagram handle</span>
              <input value={form.instagramHandle} onChange={(event) => updateField("instagramHandle", event.target.value)} placeholder="@yourusername" maxLength={31} className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Introduction video link</span>
              <input type="url" value={form.introVideoUrl} onChange={(event) => updateField("introVideoUrl", event.target.value)} placeholder="https://..." className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              <span className="mt-2 block text-xs text-muted-foreground">Use a shareable HTTPS link, for example from YouTube or Vimeo.</span>
            </label>
          </section>

          <section className="space-y-6 border-t hairline pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl">Photos</h2>
                <p className="mt-2 text-sm text-muted-foreground">Add links to your hosted profile photos.</p>
              </div>
              <button type="button" onClick={addPhoto} className="border hairline px-4 py-2 text-xs uppercase tracking-widest hover:border-gold">
                + Add photo
              </button>
            </div>
            <p className="text-xs text-muted-foreground">For now, add HTTPS image URLs. Direct photo uploads and secure cloud storage will be added separately.</p>
            {form.photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos added yet.</p>
            ) : (
              form.photos.map((photo, index) => (
                <div key={index} className="grid gap-4 border hairline p-4">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Photo URL</span>
                    <input required type="url" value={photo.url} onChange={(event) => updatePhoto(index, "url", event.target.value)} placeholder="https://..." className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Description (optional)</span>
                    <input maxLength={200} value={photo.altText} onChange={(event) => updatePhoto(index, "altText", event.target.value)} placeholder="Headshot, full-length, portfolio..." className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <button type="button" onClick={() => removePhoto(index)} className="text-left text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive">Remove photo</button>
                </div>
              ))
            )}
          </section>

          {message && <p role="status" className="text-sm text-green-700">{message}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-4 border-t hairline pt-6">
            <button type="submit" disabled={isSaving} className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50">
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <Link to="/dashboard" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
