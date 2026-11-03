import { createResendVerificationRequest } from "./server/auth/resend-verification";
import { createServerFn } from "@tanstack/react-start";
import { sendVerificationEmail } from "./server/email/send-verification-email";
import { loginSchema } from "./validation/auth";
import {
  getSessionCookie,
  clearSessionCookie,
} from "./server/auth/session-cookie";

import {
  getSessionUser,
  revokeSession,
} from "./server/auth/session";
import {
  authenticateUser,
  InvalidCredentialsError,
  EmailNotVerifiedError,
} from "./server/auth/login";

import { createSession } from "./server/auth/session";
import { setSessionCookie } from "./server/auth/session-cookie";
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
  export const loginFn = createServerFn({
  method: "POST",
})
  .validator(loginSchema)
  .handler(async ({ data }) => {
    try {
      // 1. Verify credentials and email status.
      const user = await authenticateUser(
        data.email,
        data.password
      );

      // 2. Create a database-backed session.
      const session = await createSession(user.id);

      // 3. Store the raw token in an HTTP-only cookie.
      setSessionCookie(session.token);

      return {
        success: true as const,
        user,
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return {
          success: false as const,
          code: "INVALID_CREDENTIALS" as const,
          message: "Email or password is incorrect.",
        };
      }

      if (error instanceof EmailNotVerifiedError) {
        return {
          success: false as const,
          code: "EMAIL_NOT_VERIFIED" as const,
          message: error.message,
        };
      }

      console.error("Login failed:", error);

      return {
        success: false as const,
        code: "LOGIN_FAILED" as const,
        message: "Unable to sign in. Please try again.",
      };
    }
  });
  export const getCurrentUserFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const token = getSessionCookie();

  if (!token) {
    return {
      authenticated: false as const,
      user: null,
    };
  }

  const user = await getSessionUser(token);

  if (!user || !user.emailVerifiedAt) {
    await revokeSession(token);
    clearSessionCookie();

    return {
      authenticated: false as const,
      user: null,
    };
  }

  return {
    authenticated: true as const,
    user: {
      id: user.userId,
      email: user.email,
      roles: user.roles,
    },
  };
});
export const logoutFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const token = getSessionCookie();

  try {
    if (token) {
      await revokeSession(token);
    }
  } finally {
    clearSessionCookie();
  }

  return {
    success: true as const,
    message: "You have been logged out successfully.",
  };
});