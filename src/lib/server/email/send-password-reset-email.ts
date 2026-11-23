import "dotenv/config";

import nodemailer from "nodemailer";

interface PasswordResetEmailInput {
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

export async function sendPasswordResetEmail({
  to,
  fullName,
  token,
}: PasswordResetEmailInput): Promise<string> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
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

  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);

  const safeName = escapeHtml(fullName);
  const safeUrl = escapeHtml(resetUrl.toString());

  const html = [
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px;">',
    "<h1>Ankush Arya Casting</h1>",
    "<h2>Reset your password</h2>",
    "<p>Hello " + safeName + ",</p>",
    "<p>We received a request to reset the password for your Ankush Arya Casting account.</p>",
    '<a href="' + safeUrl + '" style="display: inline-block; padding: 14px 24px; background: #b89a60; color: white; text-decoration: none;">Reset Password</a>',
    "<p>This link expires in 30 minutes and can only be used once.</p>",
    "<p>If you did not request a password reset, you can ignore this email. Your password will remain unchanged.</p>",
    "</div>",
  ].join("");

  const text = [
    "Hello " + fullName + ",",
    "",
    "We received a request to reset your Ankush Arya Casting password.",
    "",
    "Use this link to choose a new password:",
    resetUrl.toString(),
    "",
    "This link expires in 30 minutes and can only be used once.",
    "If you did not request this reset, you can ignore this email.",
  ].join("\n");

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Reset your password | Ankush Arya Casting",
    html,
    text,
  });

  if (!info.messageId) {
    throw new Error("SMTP server did not return a message ID.");
  }

  return info.messageId;
}
