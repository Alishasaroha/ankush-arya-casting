import { useState, type FormEvent } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAdminTalentDirectoryFn, getCurrentUserFn } from "@/lib/auth.functions";

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
        page: 1,
      },
    });

    return { directory, email: auth.user.email };
  },
  component: AdminTalentDirectoryPage,
});

type DirectoryFilters = {
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
  const [directory, setDirectory] = useState(initialDirectory);
  const [filters, setFilters] = useState<FilterForm>({
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
  const [error, setError] = useState("");

  function updateFilter(field: keyof FilterForm, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function getFilterValues(): DirectoryFilters {
    return {
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

  function clearFilters() {
    const emptyFilters: FilterForm = {
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
          <p className="border hairline px-4 py-3 text-xs uppercase tracking-widest">
            {directory.total.toLocaleString()} matching profiles
          </p>
        </header>

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
                      <h3 className="font-display text-xl">{profile.fullName}</h3>
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
                    <Link
                      to="/dashboard/profile/$profileId"
                      params={{ profileId: profile.id }}
                      className="inline-flex shrink-0 items-center justify-center border hairline px-5 py-3 text-xs uppercase tracking-widest hover:border-gold"
                    >
                      View / Edit Profile
                    </Link>
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
