import "dotenv/config";

import { Resend } from "resend";

interface VerificationEmailInput {
  to: string;
  fullName: string;
  token: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function sendVerificationEmail({
  to,
  fullName,
  token,
}: VerificationEmailInput): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;

  if (!apiKey || !from || !appUrl) {
    throw new Error("Email environment variables are missing.");
  }

  const resend = new Resend(apiKey);

  const verificationUrl = new URL("/verify-email", appUrl);
  verificationUrl.searchParams.set("token", token);

  const safeName = escapeHtml(fullName);
  const safeUrl = escapeHtml(verificationUrl.toString());

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Verify your email | Ankush Arya Casting",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px;">
        <h1>Ankush Arya Casting</h1>
        <h2>Verify your email address</h2>

        <p>Hello ${safeName},</p>

        <p>
          Thank you for registering with Ankush Arya Casting.
          Please verify your email address to continue.
        </p>

        <a
          href="${safeUrl}"
          style="display: inline-block; padding: 14px 24px; background: #b89a60; color: white; text-decoration: none;"
        >
          Verify Email Address
        </a>

        <p>This link expires in 30 minutes.</p>

        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
    text: `
Hello ${fullName},

Thank you for registering with Ankush Arya Casting.

Verify your email using this link:
${verificationUrl.toString()}

This link expires in 30 minutes.
    `,
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Email provider did not return a message ID.");
  }

  return data.id;
}