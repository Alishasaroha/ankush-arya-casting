import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  createAdminTalentProfileFn,
  getAdminTalentDirectoryFn,
  getCurrentUserFn,
  updateAdminTalentProfileStatusFn,
} from "@/lib/auth.functions";

export const Route = createFileRoute("/admin/talents")({
  beforeLoad: async () => {
    const auth = await getCurrentUserFn();

    if (!auth.authenticated) {
      throw redirect({ to: "/login" });
    }

    if (!auth.user.roles.includes("ADMIN")) {
      throw redirect({ to: "/dashboard" });
    }

    const { directory } = await getAdminTalentDirectoryFn({
      data: {
        search: "",
        gender: "",
        language: "",
        minAge: null,
        maxAge: null,
        minHeightCm: null,
        maxHeightCm: null,
        minExperienceYears: null,
        maxExperienceYears: null,
        status: "ACTIVE",
        page: 1,
      },
    });

    return { directory, email: auth.user.email };
  },
  component: AdminTalentDirectoryPage,
});

type ProfileStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

type DirectoryFilters = {
  status: "ALL" | ProfileStatus;
  search: string;
  gender: string;
  language: string;
  minAge: number | null;
  maxAge: number | null;
  minHeightCm: number | null;
  maxHeightCm: number | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
};

type FilterForm = {
  status: "ALL" | ProfileStatus;
  search: string;
  gender: string;
  language: string;
  minAge: string;
  maxAge: string;
  minHeightCm: string;
  maxHeightCm: string;
  minExperienceYears: string;
  maxExperienceYears: string;
};

function numberOrNull(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function AdminTalentDirectoryPage() {
  const { directory: initialDirectory, email } = Route.useRouteContext();
  const navigate = useNavigate();
  const [directory, setDirectory] = useState(initialDirectory);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    fullName: "",
    dateOfBirth: "",
    heightCm: "",
    gender: "",
    location: "",
    bio: "",
    languages: "",
    experienceYears: "",
    experienceSummary: "",
  });
  const [filters, setFilters] = useState<FilterForm>({
    status: "ACTIVE",
    search: "",
    gender: "",
    language: "",
    minAge: "",
    maxAge: "",
    minHeightCm: "",
    maxHeightCm: "",
    minExperienceYears: "",
    maxExperienceYears: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const { profile } = await createAdminTalentProfileFn({
        data: {
          fullName: createForm.fullName,
          dateOfBirth: createForm.dateOfBirth,
          heightCm: numberOrNull(createForm.heightCm),
          gender: createForm.gender,
          location: createForm.location,
          bio: createForm.bio,
          languages: createForm.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          experienceYears: numberOrNull(createForm.experienceYears),
          experienceSummary: createForm.experienceSummary,
        },
      });

      await navigate({
        to: "/dashboard/profile/$profileId",
        params: { profileId: profile.id },
      });
    } catch (creationError) {
      console.error("Admin talent profile creation failed:", creationError);
      setCreateError("We couldn't create this talent profile. Check the details and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function updateCreateField(
    field: keyof typeof createForm,
    value: string,
  ) {
    setCreateForm((current) => ({ ...current, [field]: value }));
    setCreateError("");
  }

  function updateFilter(field: keyof FilterForm, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function getFilterValues(): DirectoryFilters {
    return {
      status: filters.status,
      search: filters.search.trim(),
      gender: filters.gender.trim(),
      language: filters.language.trim(),
      minAge: numberOrNull(filters.minAge),
      maxAge: numberOrNull(filters.maxAge),
      minHeightCm: numberOrNull(filters.minHeightCm),
      maxHeightCm: numberOrNull(filters.maxHeightCm),
      minExperienceYears: numberOrNull(filters.minExperienceYears),
      maxExperienceYears: numberOrNull(filters.maxExperienceYears),
    };
  }

  async function loadDirectory(page: number, values: DirectoryFilters) {
    setIsLoading(true);
    setError("");

    try {
      const { directory: nextDirectory } = await getAdminTalentDirectoryFn({
        data: { ...values, page },
      });
      setDirectory(nextDirectory);
    } catch (loadError) {
      console.error("Admin talent directory request failed:", loadError);
      setError("We couldn't load the talent directory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadDirectory(1, getFilterValues());
  }

  async function handleStatusChange(profileId: string, status: ProfileStatus) {
    setUpdatingProfileId(profileId);
    setError("");

    try {
      await updateAdminTalentProfileStatusFn({
        data: { profileId, status },
      });
      await loadDirectory(directory.page, getFilterValues());
    } catch (statusError) {
      console.error("Talent profile status update failed:", statusError);
      setError("We couldn't update this profile status. Please try again.");
    } finally {
      setUpdatingProfileId(null);
    }
  }

  function clearFilters() {
    const emptyFilters: FilterForm = {
      status: "ACTIVE",
      search: "",
      gender: "",
      language: "",
      minAge: "",
      maxAge: "",
      minHeightCm: "",
      maxHeightCm: "",
      minExperienceYears: "",
      maxExperienceYears: "",
    };

    setFilters(emptyFilters);
    void loadDirectory(1, {
      status: "ACTIVE",
      search: "",
      gender: "",
      language: "",
      minAge: null,
      maxAge: null,
      minHeightCm: null,
      maxHeightCm: null,
      minExperienceYears: null,
      maxExperienceYears: null,
    });
  }

  const firstResult =
    directory.total === 0 ? 0 : (directory.page - 1) * directory.pageSize + 1;
  const lastResult = Math.min(
    directory.page * directory.pageSize,
    directory.total,
  );

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/dashboard"
          className="text-xs uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
        >
          ← Back to account
        </Link>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-5 border-b hairline pb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Ankush Arya Casting · Administration
            </p>
            <h1 className="mt-3 font-display text-3xl md:text-5xl">
              Talent Directory
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="border hairline px-4 py-3 text-xs uppercase tracking-widest">
              {directory.total.toLocaleString()} matching profiles
            </p>
            <button
              type="button"
              onClick={() => setIsCreateFormOpen((open) => !open)}
              className="bg-foreground px-5 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80"
            >
              {isCreateFormOpen ? "Close form" : "+ Add talent"}
            </button>
          </div>
        </header>

        {isCreateFormOpen && (
          <form
            onSubmit={handleCreateSubmit}
            className="mt-8 space-y-6 border hairline bg-surface p-6 md:p-8"
          >
            <div>
              <h2 className="font-display text-2xl">Add Talent Profile</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a private agency record for an actor who has not registered yet.
                This profile will remain unclaimed until a separate account-linking process is completed.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Full name *</span>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={createForm.fullName}
                  onChange={(event) => updateCreateField("fullName", event.target.value)}
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Date of birth</span>
                <input
                  type="date"
                  value={createForm.dateOfBirth}
                  onChange={(event) => updateCreateField("dateOfBirth", event.target.value)}
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Height (cm)</span>
                <input
                  type="number"
                  min={30}
                  max={250}
                  step={1}
                  value={createForm.heightCm}
                  onChange={(event) => updateCreateField("heightCm", event.target.value)}
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Gender</span>
                <input
                  maxLength={50}
                  value={createForm.gender}
                  onChange={(event) => updateCreateField("gender", event.target.value)}
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Current location</span>
                <input
                  maxLength={150}
                  value={createForm.location}
                  onChange={(event) => updateCreateField("location", event.target.value)}
                  placeholder="City, State"
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Languages known</span>
                <input
                  value={createForm.languages}
                  onChange={(event) => updateCreateField("languages", event.target.value)}
                  placeholder="Hindi, English, Punjabi"
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Years of experience</span>
                <input
                  type="number"
                  min={0}
                  max={80}
                  step={1}
                  value={createForm.experienceYears}
                  onChange={(event) => updateCreateField("experienceYears", event.target.value)}
                  className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Short bio</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={createForm.bio}
                  onChange={(event) => updateCreateField("bio", event.target.value)}
                  className="w-full resize-y border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">Experience details</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={createForm.experienceSummary}
                  onChange={(event) => updateCreateField("experienceSummary", event.target.value)}
                  className="w-full resize-y border hairline bg-background px-4 py-3 outline-none focus:border-gold"
                />
              </label>
            </div>

            {createError && <p role="alert" className="text-sm text-destructive">{createError}</p>}

            <div className="flex flex-wrap gap-3 border-t hairline pt-5">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create profile"}
              </button>
              <button
                type="button"
                onClick={() => setIsCreateFormOpen(false)}
                disabled={isCreating}
                className="border hairline px-6 py-3 text-xs uppercase tracking-widest hover:border-gold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 border hairline bg-surface p-6 md:p-8"
        >
          <div>
            <h2 className="font-display text-2xl">Search & Filters</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Search by name or location, then narrow results using the actor's profile details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="block text-sm md:col-span-2">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Name or location
              </span>
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                maxLength={100}
                placeholder="Search actors or cities..."
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Gender
              </span>
              <input
                value={filters.gender}
                onChange={(event) => updateFilter("gender", event.target.value)}
                maxLength={50}
                placeholder="e.g. Female"
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Profile status
              </span>
              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value as FilterForm["status"])}
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
                <option value="ALL">All statuses</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Language (exact match)
              </span>
              <input
                value={filters.language}
                onChange={(event) => updateFilter("language", event.target.value)}
                maxLength={60}
                placeholder="e.g. Hindi"
                className="w-full border hairline bg-background px-4 py-3 outline-none focus:border-gold"
              />
            </label>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Age range
              </legend>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Min</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={filters.minAge}
                  onChange={(event) => updateFilter("minAge", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Max</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={filters.maxAge}
                  onChange={(event) => updateFilter("maxAge", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Height (cm)
              </legend>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Min</span>
                <input
                  type="number"
                  min={30}
                  max={250}
                  value={filters.minHeightCm}
                  onChange={(event) => updateFilter("minHeightCm", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Max</span>
                <input
                  type="number"
                  min={30}
                  max={250}
                  value={filters.maxHeightCm}
                  onChange={(event) => updateFilter("maxHeightCm", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
            </fieldset>

            <fieldset className="grid grid-cols-2 gap-3">
              <legend className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Experience (years)
              </legend>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Min</span>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={filters.minExperienceYears}
                  onChange={(event) => updateFilter("minExperienceYears", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
              <label className="text-sm">
                <span className="mb-2 block text-xs text-muted-foreground">Max</span>
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={filters.maxExperienceYears}
                  onChange={(event) => updateFilter("maxExperienceYears", event.target.value)}
                  className="w-full border hairline bg-background px-3 py-3 outline-none focus:border-gold"
                />
              </label>
            </fieldset>
          </div>

          <div className="flex flex-wrap gap-3 border-t hairline pt-5">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background hover:opacity-80 disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Apply filters"}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              disabled={isLoading}
              className="border hairline px-6 py-3 text-xs uppercase tracking-widest hover:border-gold disabled:opacity-50"
            >
              Clear filters
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline pb-4">
            <div>
              <h2 className="font-display text-2xl">Profiles</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Showing {firstResult.toLocaleString()}–{lastResult.toLocaleString()} of {directory.total.toLocaleString()}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {directory.page} / {directory.totalPages}
            </p>
          </div>

          {directory.profiles.length === 0 ? (
            <div className="border-b hairline py-12 text-center">
              <h3 className="font-display text-xl">No matching profiles</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing or clearing your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {directory.profiles.map((profile) => {
                const age = calculateAge(profile.dateOfBirth);

                return (
                  <article
                    key={profile.id}
                    className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl">{profile.fullName}</h3>
                        <span className="border hairline px-2 py-1 text-[10px] uppercase tracking-widest">
                          {profile.status}
                        </span>
                        {profile.isUnclaimed && (
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Unclaimed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[profile.location, profile.gender]
                          .filter(Boolean)
                          .join(" · ") || "Location and gender not added"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-widest text-muted-foreground">
                        {age !== null && <span>{age} years</span>}
                        {profile.heightCm !== null && <span>{profile.heightCm} cm</span>}
                        {profile.experienceYears !== null && (
                          <span>{profile.experienceYears} years experience</span>
                        )}
                      </div>
                      {profile.languages.length > 0 && (
                        <p className="mt-3 text-sm">
                          <span className="text-muted-foreground">Languages: </span>
                          {profile.languages.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        Status
                        <select
                          value={profile.status}
                          disabled={updatingProfileId === profile.id}
                          onChange={(event) => void handleStatusChange(profile.id, event.target.value as ProfileStatus)}
                          className="mt-2 block border hairline bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-gold disabled:opacity-50"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </label>
                      <Link
                        to="/dashboard/profile/$profileId"
                        params={{ profileId: profile.id }}
                        className="inline-flex shrink-0 items-center justify-center border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold"
                      >
                        View / Edit Profile
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t hairline pt-5">
            <button
              type="button"
              disabled={isLoading || directory.page <= 1}
              onClick={() => void loadDirectory(directory.page - 1, getFilterValues())}
              className="border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={isLoading || directory.page >= directory.totalPages}
              onClick={() => void loadDirectory(directory.page + 1, getFilterValues())}
              className="border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
