import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent, ReactNode, ChangeEvent } from "react";
import { PageHero } from "@/components/site/PageHero";
import { ShieldCheck, User, Users, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/join")({
    head: () => ({
        meta: [
            { title: "Register Talent Account — Ankush Arya Casting" },
            {
                name: "description",
                content: "Create a talent account with Ankush Arya Casting. Secure registration for actors and child artists managed by parents or legal guardians.",
            },
            { property: "og:title", content: "Register Talent Account — Ankush Arya Casting" },
            { property: "og:description", content: "Create your private talent profile with Ankush Arya Casting." },
        ],
    }),
    component: Join,
});

type AccountType = "actor" | "child_artist";

const TALENT_CATEGORIES = [
    "Actor",
    "Model",
    "Child Artist",
    "Content Creator",
    "Influencer",
    "Other",
] as const;

type TalentCategory = (typeof TALENT_CATEGORIES)[number];

const REGISTRATION_FLOW = [
    {
        step: "01",
        title: "Account Setup",
        description: "Choose your registration type and create your secure account credentials.",
    },
    {
        step: "02",
        title: "Email Verification",
        description: "Verify your email address via a secure link to activate your account.",
    },
    {
        step: "03",
        title: "Profile Completion",
        description: "Complete your confidential talent profile with measurements, portfolio, and craft experience.",
    },
];

function Join() {
    const [accountType, setAccountType] = useState<AccountType>("actor");
    const [category, setCategory] = useState<TalentCategory>("Actor");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [guardianName, setGuardianName] = useState("");
    const [childName, setChildName] = useState("");
    const [guardianRelationship, setGuardianRelationship] = useState("Parent");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [formNotice, setFormNotice] = useState<string | null>(null);

    const isChildArtist = accountType === "child_artist";

    function handleAccountTypeChange(type: AccountType) {
        setAccountType(type);
        setValidationError(null);
        setFormNotice(null);
        if (type === "child_artist") {
            setCategory("Child Artist");
        } else if (category === "Child Artist") {
            setCategory("Actor");
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setValidationError(null);
        setFormNotice(null);

        // Required field validation
        if (accountType === "actor" && !fullName.trim()) {
            setValidationError("Please enter your full legal name.");
            return;
        }

        if (accountType === "child_artist") {
            if (!guardianName.trim()) {
                setValidationError("Please enter the parent or legal guardian's full name.");
                return;
            }
            if (!guardianRelationship.trim()) {
                setValidationError("Please enter your relationship to the child artist.");
                return;
            }
            if (!childName.trim()) {
                setValidationError("Please enter the child artist's full name.");
                return;
            }
        }

        if (!email.trim()) {
            setValidationError("Please enter your email address.");
            return;
        }

        // Password validation
        if (password.length < 8) {
            setValidationError("Password must be at least 8 characters in length.");
            return;
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match. Please ensure both passwords are identical.");
            return;
        }

        // Unmistakably clear UI-only prototype message (no account created, no email sent)
        setFormNotice(
            `UI Prototype Notice: No account has been created and no verification email has been sent to ${email}. This interface is currently a front-end demonstration; backend authentication and email verification will be connected in a future update.`
        );
    }

    return (
        <>
            <PageHero
                eyebrow="Talent Registration"
                title={
                    <>
                        Begin your journey with <span className="italic text-gold">Ankush Arya Casting.</span>
                    </>
                }
                subtitle="Register for representation and casting consideration. All artist profiles remain strictly private and are accessible solely by authorized casting staff and verified account holders."
            />

            {/* Registration Progression */}
            <section aria-label="Registration process steps" className="py-16 md:py-20 border-b hairline bg-surface">
                <div className="mx-auto max-w-[1600px] px-6 md:px-12">
                    <div className="grid gap-px bg-border md:grid-cols-3">
                        {REGISTRATION_FLOW.map((item) => (
                            <div key={item.step} className="bg-surface p-8 md:p-12">
                                <div className="text-gold text-xs tracking-[0.3em] font-mono">{item.step}</div>
                                <h2 className="mt-4 font-display text-2xl md:text-3xl">{item.title}</h2>
                                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Form & Type Selection */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-3xl px-6 md:px-12">
                    <div className="mb-12">
                        <div className="eyebrow mb-3">Step 1 of 3</div>
                        <h2 className="font-display text-3xl md:text-5xl">Create Your Account</h2>
                        <p className="mt-4 text-muted-foreground leading-relaxed">
                            Select who you are registering for today. Registration requires email and password authentication,
                            followed by email confirmation before access is granted.
                        </p>
                    </div>

                    {/* Account Type Selection using native radios styled as cards */}
                    <fieldset className="mb-12 border-0 p-0 m-0">
                        <legend className="block text-xs tracking-[0.24em] uppercase text-muted-foreground mb-4">
                            Select Registration Option *
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AccountOptionCard
                                id="account-type-actor"
                                name="accountType"
                                value="actor"
                                title="Register as an Actor"
                                description="For adult actors, models, and performers managing their own talent account and submissions."
                                icon={<User className="h-5 w-5" />}
                                isSelected={accountType === "actor"}
                                onChange={handleAccountTypeChange}
                            />
                            <AccountOptionCard
                                id="account-type-child"
                                name="accountType"
                                value="child_artist"
                                title="Register a Child Artist"
                                description="For parents or legal guardians creating and managing a profile on behalf of a minor talent."
                                icon={<Users className="h-5 w-5" />}
                                isSelected={accountType === "child_artist"}
                                onChange={handleAccountTypeChange}
                            />
                        </div>

                        {/* Guardian Notice for Child Artists */}
                        {isChildArtist && (
                            <div
                                role="note"
                                className="mt-6 p-5 border hairline bg-surface-elevated/70 rounded-none flex items-start gap-4 animate-reveal"
                            >
                                <ShieldCheck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                                    <p className="font-medium text-foreground">
                                        Parental / Guardian Responsibility Notice
                                    </p>
                                    <p>
                                        Under our child talent protection policy, all accounts for performers under 18 must be
                                        created and administered by a parent or legal guardian. The parent/guardian maintains
                                        exclusive control of casting communications, schedule confirmations, and profile updates.
                                    </p>
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Primary Talent Category */}
                        <div className="border-t hairline pt-8">
                            <label className="block text-xs tracking-[0.24em] uppercase text-muted-foreground mb-3">
                                Primary Talent Category *
                            </label>
                            <p className="text-xs text-muted-foreground mb-4">
                                {isChildArtist
                                    ? "Registration as a child artist is locked to the Child Artist category. Additional subcategories can be configured during profile completion."
                                    : "Choose the primary category that best reflects the talent craft. Additional subcategories can be configured during profile completion."}
                            </p>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Talent Category">
                                {TALENT_CATEGORIES.map((cat) => {
                                    const checked = category === cat;
                                    const isLocked = isChildArtist && cat !== "Child Artist";
                                    return (
                                        <label
    key={cat}
    className={`px-4 py-2.5 text-xs tracking-[0.2em] uppercase border transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-gold ${
        checked
            ? "bg-gold text-primary-foreground border-gold font-medium"
            : isLocked
              ? "border-border/30 hairline text-muted-foreground/30 cursor-not-allowed opacity-50"
              : "border-border hairline hover:border-gold text-foreground"
    }`}
>
    <input
        type="radio"
        name="talentCategory"
        value={cat}
        checked={checked}
        disabled={isLocked}
        onChange={() => setCategory(cat)}
        className="sr-only"
    />
    {cat}
</label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Registrant / Actor Information */}
                        <div className="border-t hairline pt-8 space-y-6">
                            <h3 className="font-display text-2xl">
                                {accountType === "actor" ? "Personal Details" : "Guardian & Child Artist Information"}
                            </h3>

                            {accountType === "actor" ? (
                                <InputField
                                    id="fullName"
                                    name="fullName"
                                    label="Full Legal Name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    placeholder="Enter your full legal name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <InputField
                                            id="guardianName"
                                            name="guardianName"
                                            label="Parent / Guardian Full Name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            placeholder="Parent or legal guardian name"
                                            value={guardianName}
                                            onChange={(e) => setGuardianName(e.target.value)}
                                        />
                                        <InputField
                                            id="guardianRelationship"
                                            name="guardianRelationship"
                                            label="Relationship to Artist"
                                            type="text"
                                            required
                                            placeholder="e.g. Mother, Father, Legal Guardian"
                                            value={guardianRelationship}
                                            onChange={(e) => setGuardianRelationship(e.target.value)}
                                        />
                                    </div>
                                    <InputField
                                        id="childName"
                                        name="childName"
                                        label="Child Artist Full Name"
                                        type="text"
                                        required
                                        placeholder="Enter the minor artist's full name"
                                        value={childName}
                                        onChange={(e) => setChildName(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Credentials */}
                        <div className="border-t hairline pt-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display text-2xl">Login Credentials</h3>
                                <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Lock className="h-3 w-3 text-gold" /> Email & Password
                                </span>
                            </div>

                            <InputField
                                id="email"
                                name="email"
                                label={accountType === "actor" ? "Email Address" : "Parent / Guardian Email Address"}
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                helperText="Email verification will be required when registration is enabled."
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <InputField
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <InputField
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Privacy & Confidentiality Guarantee */}
                        <div className="border-t hairline pt-8">
                            <div className="bg-surface p-6 border hairline space-y-3">
                                <div className="flex items-center gap-2 text-gold text-xs tracking-wider uppercase font-medium">
                                    <ShieldCheck className="h-4 w-4" />
                                    Strict Privacy & Confidentiality Policy
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Talent profiles are intended to remain private and will not be displayed in a public directory. Access will be restricted to authorized agency staff and the relevant account holder or legal guardian. Your personal data, portfolio materials,
                                    and contact details are accessible solely by authorized Ankush Arya Casting staff and the verified
                                    account holder or legal guardian. Profiles are never made public.
                                </p>
                            </div>
                        </div>

                        {/* Validation Error Feedback */}
                        {validationError && (
                            <div
                                role="alert"
                                className="p-4 border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-start gap-3"
                            >
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>{validationError}</div>
                            </div>
                        )}

                        {/* Informational readiness feedback */}
                        {formNotice && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="p-5 border border-gold/40 bg-surface-elevated text-foreground text-sm flex items-start gap-3 animate-reveal"
                            >
                                <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <div className="font-medium text-gold text-xs uppercase tracking-wider">
                                        Front-End Prototype Notice — No Account Created
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{formNotice}</p>
                                </div>
                            </div>
                        )}

                        {/* Submission and Action */}
                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                By continuing, you acknowledge that this is a registration preview. Account creation and email verification are not yet enabled.
                            </div>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-3 bg-gold text-primary-foreground px-8 py-4 text-[11px] tracking-[0.28em] uppercase hover:bg-foreground hover:text-background transition-colors font-medium shrink-0 cursor-pointer"
                            >
                                Register Account
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

interface AccountOptionCardProps {
    id: string;
    name: string;
    value: AccountType;
    title: string;
    description: string;
    icon: ReactNode;
    isSelected: boolean;
    onChange: (type: AccountType) => void;
}

function AccountOptionCard({
    id,
    name,
    value,
    title,
    description,
    icon,
    isSelected,
    onChange,
}: AccountOptionCardProps) {
    return (
        <label
            htmlFor={id}
            className={`relative block p-6 text-left border transition-all cursor-pointer select-none ${
                isSelected
                    ? "border-gold bg-surface-elevated ring-1 ring-gold/40"
                    : "border-border hairline bg-surface hover:border-gold/50"
            } focus-within:ring-1 focus-within:ring-gold focus-within:border-gold`}
        >
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={isSelected}
                onChange={() => onChange(value)}
                className="sr-only"
            />
            <div className="flex items-center justify-between">
                <span className={`p-2 rounded-none ${isSelected ? "text-gold" : "text-muted-foreground"}`}>
                    {icon}
                </span>
                <span
                    className={`inline-block h-3 w-3 rounded-full border ${
                        isSelected ? "border-gold bg-gold" : "border-muted-foreground/40"
                    }`}
                    aria-hidden="true"
                />
            </div>
            <h3 className="mt-4 font-display text-xl text-foreground">{title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</p>
        </label>
    );
}

interface InputFieldProps {
    id: string;
    name: string;
    label: string;
    type?: string;
    required?: boolean;
    minLength?: number;
    autoComplete?: string;
    placeholder?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    helperText?: string;
}

function InputField({
    id,
    name,
    label,
    type = "text",
    required = false,
    minLength,
    autoComplete,
    placeholder,
    value,
    onChange,
    helperText,
}: InputFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-xs tracking-[0.24em] uppercase text-muted-foreground">
                {label}
                {required && <span className="text-gold ml-1">*</span>}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                required={required}
                minLength={minLength}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="mt-3 w-full bg-transparent border-b hairline py-3 text-base text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
            />
            {helperText && <p className="mt-2 text-[11px] text-muted-foreground/70">{helperText}</p>}
        </div>
    );
}
