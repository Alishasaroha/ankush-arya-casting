import "dotenv/config";

import nodemailer from "nodemailer";

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
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  // Google displays App Passwords in groups; remove whitespace before SMTP auth.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;

  if (!user || !pass || !from || !appUrl) {
    throw new Error(
      "Email configuration is incomplete. Set SMTP_USER, SMTP_PASS, EMAIL_FROM, and APP_URL.",
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const verificationUrl = new URL("/verify-email", appUrl);
  verificationUrl.searchParams.set("token", token);

  const safeName = escapeHtml(fullName);
  const safeUrl = escapeHtml(verificationUrl.toString());

  const html = [
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px;">',
    "<h1>Ankush Arya Casting</h1>",
    "<h2>Verify your email address</h2>",
    "<p>Hello " + safeName + ",</p>",
    "<p>Thank you for registering with Ankush Arya Casting. Please verify your email address to continue.</p>",
    '<a href="' + safeUrl + '" style="display: inline-block; padding: 14px 24px; background: #b89a60; color: white; text-decoration: none;">Verify Email Address</a>',
    "<p>This link expires in 30 minutes.</p>",
    "<p>If you did not create this account, you can ignore this email.</p>",
    "</div>",
  ].join("");

  const text = [
    "Hello " + fullName + ",",
    "",
    "Thank you for registering with Ankush Arya Casting.",
    "",
    "Verify your email using this link:",
    verificationUrl.toString(),
    "",
    "This link expires in 30 minutes.",
  ].join("\n");

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Verify your email | Ankush Arya Casting",
    html,
    text,
  });

  if (!info.messageId) {
    throw new Error("SMTP server did not return a message ID.");
  }

  return info.messageId;
}
