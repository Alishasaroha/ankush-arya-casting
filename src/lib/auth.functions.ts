import { createResendVerificationRequest } from "./server/auth/resend-verification";
import { createServerFn } from "@tanstack/react-start";
import { sendVerificationEmail } from "./server/email/send-verification-email";

import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "./validation/auth";
import { verifyEmailToken } from "./server/auth/verify-email";

import {
  registerAdultActor,
  RegistrationValidationError,
  EmailAlreadyRegisteredError,
} from "./server/auth/register";

export const registerAdultActorFn = createServerFn({
  method: "POST",
})
  .validator(registerSchema)
  .handler(async ({ data }) => {
    try {
      // 1. Create account and generate verification token.
      const registeredActor = await registerAdultActor(data);

      try {
        // 2. Send verification email.
        await sendVerificationEmail({
          to: registeredActor.user.email,
          fullName: registeredActor.profile.fullName,
          token: registeredActor.verificationToken,
        });

        return {
          success: true as const,
          message:
            "Account created successfully! Please check your email to verify your account.",
        };
      } catch (emailError) {
        // Account exists even if email delivery fails.
        console.error(
          "Verification email delivery failed:",
          emailError instanceof Error ? emailError.message : "Unknown error"
        );

        return {
          success: true as const,
          message:
            "Your account was created, but we couldn't send the verification email. Please contact Ankush Arya Casting for assistance.",
        };
      }
    } catch (error) {
      if (error instanceof RegistrationValidationError) {
        return {
          success: false as const,
          code: "VALIDATION_ERROR" as const,
          fieldErrors: error.fieldErrors,
        };
      }

      if (error instanceof EmailAlreadyRegisteredError) {
        return {
          success: false as const,
          code: "EMAIL_ALREADY_REGISTERED" as const,
          message: "An account with this email already exists.",
        };
      }

      console.error("Adult actor registration failed:", error);

      return {
        success: false as const,
        code: "REGISTRATION_FAILED" as const,
        message: "We couldn't complete registration. Please try again.",
      };
    }
  });

  export const verifyEmailFn = createServerFn({
  method: "POST",
})
  .validator(verifyEmailSchema)
  .handler(async ({ data }) => {
    try {
      return await verifyEmailToken(data.token);
    } catch (error) {
      console.error("Email verification failed:", error);

      return {
        success: false as const,
        code: "VERIFICATION_FAILED" as const,
        message: "We couldn't verify your email. Please try again.",
      };
    }
  });
  export const resendVerificationFn = createServerFn({
  method: "POST",
})
  .validator(resendVerificationSchema)
  .handler(async ({ data }) => {
    try {
      // Generate a fresh token for an eligible account.
      const request = await createResendVerificationRequest(
        data.email
      );

      // Send email only when an eligible request exists.
      if (request) {
        try {
          await sendVerificationEmail({
            to: request.email,
            fullName: request.fullName,
            token: request.token,
          });
        } catch (emailError) {
          console.error(
            "Resend verification email failed:",
            emailError instanceof Error
              ? emailError.message
              : "Unknown error"
          );
        }
      }

      // Always return a generic response.
      return {
        success: true as const,
        message:
          "If an unverified account exists for this email, a verification email will be sent shortly.",
      };
    } catch (error) {
      console.error("Resend verification request failed:", error);

      return {
        success: false as const,
        message: "Unable to process your request. Please try again later.",
      };
    }
  });