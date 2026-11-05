import { useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import {
  getCurrentUserFn,
  getTalentProfileFn,
  updateTalentProfileFn,
  grantManagerAccessFn,
  revokeManagerAccessFn,
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
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState(profile.photos);
  const [photoAltText, setPhotoAltText] = useState("");
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerAccess, setManagerAccess] = useState(profile.managerAccessGrants);
  const [isGrantingManager, setIsGrantingManager] = useState(false);
  const [revokingManagerUserId, setRevokingManagerUserId] = useState<string | null>(null);
  const [managerAccessMessage, setManagerAccessMessage] = useState("");
  const [managerAccessError, setManagerAccessError] = useState("");
  const canEdit = profile.access.canEdit;
  const canManageManagerAccess = profile.access.canManageManagerAccess;

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

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";

    if (selectedFiles.length === 0) return;

    if (photos.length + selectedFiles.length > 30) {
      setPhotoError("A talent profile can contain up to 30 photos.");
      setPhotoMessage("");
      return;
    }

    setIsUploadingPhotos(true);
    setPhotoMessage("");
    setPhotoError("");

    let uploadedCount = 0;

    try {
      // Upload one at a time so each request gets an accurate server-side sort order.
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", photoAltText);

        const response = await fetch(
          `/api/talent-profiles/${profile.id}/photos`,
          {
            method: "POST",
            body: formData,
            credentials: "same-origin",
          },
        );

        const result = (await response.json().catch(() => ({}))) as {
          photo?: (typeof profile.photos)[number];
          message?: string;
        };

        if (!response.ok || !result.photo) {
          throw new Error(result.message ?? "A photo could not be uploaded.");
        }

        setPhotos((current) => [...current, result.photo!]);
        uploadedCount += 1;
      }

      setPhotoMessage(
        `${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} uploaded successfully.`,
      );
    } catch (uploadError) {
      setPhotoError(
        uploadError instanceof Error
          ? uploadError.message
          : "We couldn't upload the selected photos.",
      );

      if (uploadedCount > 0) {
        setPhotoMessage(
          `${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} uploaded before the error.`,
        );
      }
    } finally {
      setIsUploadingPhotos(false);
    }
  }

  async function handleRemovePhoto(photoId: string) {
    setDeletingPhotoId(photoId);
    setPhotoMessage("");
    setPhotoError("");

    try {
      const response = await fetch(
        `/api/talent-profiles/${profile.id}/photos/${photoId}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message ?? "We couldn't remove this photo.");
      }

      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      setPhotoMessage("Photo removed successfully.");
    } catch (removeError) {
      setPhotoError(
        removeError instanceof Error
          ? removeError.message
          : "We couldn't remove this photo.",
      );
    } finally {
      setDeletingPhotoId(null);
    }
  }

  async function handleGrantManagerAccess() {
    setIsGrantingManager(true);
    setManagerAccessMessage("");
    setManagerAccessError("");

    try {
      const result = await grantManagerAccessFn({
        data: {
          profileId: profile.id,
          managerEmail: managerEmail.trim(),
        },
      });

      if (!result.success) {
        setManagerAccessError(result.message);
        return;
      }

      setManagerAccess((current) => [
        result.grant,
        ...current.filter((grant) => grant.managerUserId !== result.grant.managerUserId),
      ]);
      setManagerEmail("");
      setManagerAccessMessage("Manager access granted. The manager can now view this profile.");
    } catch (grantError) {
      console.error("Grant manager access failed:", grantError);
      setManagerAccessError("We couldn't grant access. Please try again.");
    } finally {
      setIsGrantingManager(false);
    }
  }

  async function handleRevokeManagerAccess(managerUserId: string) {
    setRevokingManagerUserId(managerUserId);
    setManagerAccessMessage("");
    setManagerAccessError("");

    try {
      const result = await revokeManagerAccessFn({
        data: {
          profileId: profile.id,
          managerUserId,
        },
      });

      if (!result.success) {
        setManagerAccessError(result.message);
        return;
      }

      setManagerAccess((current) =>
        current.filter((grant) => grant.managerUserId !== managerUserId),
      );
      setManagerAccessMessage("Manager access revoked.");
    } catch (revokeError) {
      console.error("Revoke manager access failed:", revokeError);
      setManagerAccessError("We couldn't revoke access. Please try again.");
    } finally {
      setRevokingManagerUserId(null);
    }
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
          <h1 className="mt-3 font-display text-3xl md:text-5xl">{canEdit ? "Edit Talent Profile" : "Talent Profile"}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{email}</p>
          {profile.guardianRelationship && (
            <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
              Managed by guardian · {profile.guardianRelationship}
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 border hairline bg-surface p-6 md:p-8">
          {!canEdit && (
            <p role="note" className="border border-gold/30 bg-surface-elevated p-4 text-sm text-muted-foreground">
              You have read-only manager access to this profile. Profile details and photos cannot be changed.
            </p>
          )}
          <fieldset disabled={!canEdit} className="contents">
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
              <input type="url" value={form.introVideoUrl} onChange={(event) => updateField("introVideoUrl", event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold" />
              <span className="mt-2 block text-xs text-muted-foreground">Paste a shareable YouTube video URL. Video files are not uploaded or stored by the agency.</span>
            </label>
          </section>

          <section className="space-y-6 border-t hairline pt-8">
            <div>
              <h2 className="font-display text-2xl">Profile Photos</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload clear, recent photos for the agency to review.
              </p>
            </div>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Photo description (optional)
              </span>
              <input
                maxLength={200}
                value={photoAltText}
                onChange={(event) => setPhotoAltText(event.target.value)}
                placeholder="Headshot, full-length, portfolio..."
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
              <span className="mt-2 block text-xs text-muted-foreground">
                This description is applied to every photo selected in the next upload.
              </span>
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed hairline bg-background px-6 py-8 text-center transition-colors hover:border-gold">
              <span className="text-sm font-medium">
                {isUploadingPhotos ? "Uploading photos..." : "Choose photos to upload"}
              </span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG or WebP · Maximum 5 MB each · Up to 30 photos per profile
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isUploadingPhotos}
                onChange={handlePhotoUpload}
                className="mt-2 block w-full max-w-xs text-xs text-muted-foreground file:mr-3 file:border file:border-current file:bg-transparent file:px-3 file:py-2 file:text-xs file:uppercase file:tracking-widest"
              />
            </label>

            {photoMessage && <p role="status" className="text-sm text-green-700">{photoMessage}</p>}
            {photoError && <p role="alert" className="text-sm text-destructive">{photoError}</p>}

            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="overflow-hidden border hairline">
                    <img
                      src={photo.url}
                      alt={photo.altText ?? "Talent profile photo"}
                      className="aspect-[4/5] w-full bg-background object-cover"
                      loading="lazy"
                    />
                    <div className="flex items-center justify-between gap-3 p-3">
                      <p className="min-w-0 truncate text-xs text-muted-foreground">
                        {photo.altText || "Profile photo"}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        disabled={isUploadingPhotos || deletingPhotoId !== null}
                        className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        {deletingPhotoId === photo.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          </fieldset>

          {canManageManagerAccess && (
            <section className="space-y-5 border-t hairline pt-8">
              <div>
                <h2 className="font-display text-2xl">Manager Access</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Give a verified manager permission to view this profile. Access is read-only and can be revoked at any time.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="block text-sm">
                  <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                    Manager account email
                  </span>
                  <input
                    type="text"
                    inputMode="email"
                    autoComplete="email"
                    value={managerEmail}
                    onChange={(event) => setManagerEmail(event.target.value)}
                    placeholder="manager@example.com"
                    className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleGrantManagerAccess}
                  disabled={isGrantingManager || !managerEmail.trim()}
                  className="self-end bg-foreground px-5 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80 disabled:opacity-50"
                >
                  {isGrantingManager ? "Granting..." : "Grant access"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The manager must already have a Manager account and a verified email address.
              </p>

              {managerAccess.length === 0 ? (
                <p className="text-sm text-muted-foreground">No managers currently have access.</p>
              ) : (
                <div className="divide-y divide-border border-y hairline">
                  {managerAccess.map((grant) => (
                    <div key={grant.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {grant.managerUser.fullName || grant.managerUser.email}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {grant.managerUser.email} · Granted {new Date(grant.grantedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeManagerAccess(grant.managerUserId)}
                        disabled={revokingManagerUserId !== null}
                        className="border hairline px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-50"
                      >
                        {revokingManagerUserId === grant.managerUserId ? "Revoking..." : "Revoke"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {managerAccessMessage && <p role="status" className="text-sm text-green-700">{managerAccessMessage}</p>}
              {managerAccessError && <p role="alert" className="text-sm text-destructive">{managerAccessError}</p>}
            </section>
          )}

          {message && <p role="status" className="text-sm text-green-700">{message}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-4 border-t hairline pt-6">
            <button type="submit" disabled={!canEdit || isSaving || isUploadingPhotos || deletingPhotoId !== null} className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition-opacity hover:opacity-80 disabled:opacity-50">
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
