import { createServerFn } from "@tanstack/react-start";

import { createResendVerificationRequest } from "./server/auth/resend-verification";
import {
  authenticateUser,
  InvalidCredentialsError,
  EmailNotVerifiedError,
} from "./server/auth/login";
import {
  getAuthenticatedUser,
  listAccessibleTalentProfiles,
} from "./server/auth/authorization";
import { createSession, revokeSession } from "./server/auth/session";
import {
  clearSessionCookie,
  getSessionCookie,
  setSessionCookie,
} from "./server/auth/session-cookie";
import {
  registerAdultActor,
  registerGuardianWithChild,
  registerManager,
  RegistrationValidationError,
  EmailAlreadyRegisteredError,
} from "./server/auth/register";
import { verifyEmailToken } from "./server/auth/verify-email";
import { createGuardianChildProfile } from "./server/guardian-profile";
import { grantManagerAccess, revokeManagerAccess, ManagerAccessRequestError } from "./server/manager-access";
import { sendVerificationEmail } from "./server/email/send-verification-email";
import { getTalentProfile, updateTalentProfile } from "./server/talent-profile";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from "./validation/auth";
import { registerGuardianSchema, guardianChildProfileSchema } from "./validation/guardian";
import { managerRegistrationSchema, grantManagerAccessSchema, revokeManagerAccessSchema } from "./validation/manager";
import {
  talentProfileIdSchema,
  updateTalentProfileSchema,
} from "./validation/talent-profile";
import {
  adminTalentDirectorySchema,
  createAdminTalentProfileSchema,
  adminTalentProfileStatusSchema,
} from "./validation/admin-talent";
import {
  createAdminTalentProfile,
  searchAdminTalentProfiles,
  updateAdminTalentProfileStatus,
} from "./server/admin-talent";

export const registerAdultActorFn = createServerFn({
  method: "POST",
})
  .validator(registerSchema)
  .handler(async ({ data }) => {
    try {
      const registeredActor = await registerAdultActor(data);

      try {
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
        console.error(
          "Verification email delivery failed:",
          emailError instanceof Error ? emailError.message : "Unknown error",
        );

        return {
          success: true as const,
          message:
            "Your account was created, but we couldn't send the verification email. Please request a new verification email.",
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


export const registerChildArtistFn = createServerFn({
  method: "POST",
})
  .validator(registerGuardianSchema)
  .handler(async ({ data }) => {
    try {
      const registeredGuardian = await registerGuardianWithChild(data);

      try {
        await sendVerificationEmail({
          to: registeredGuardian.user.email,
          fullName: registeredGuardian.user.fullName ?? data.guardianName,
          token: registeredGuardian.verificationToken,
        });

        return {
          success: true as const,
          message:
            "Guardian account and child profile created. Please verify the guardian email address before signing in.",
        };
      } catch (emailError) {
        console.error(
          "Guardian verification email delivery failed:",
          emailError instanceof Error ? emailError.message : "Unknown error",
        );

        return {
          success: true as const,
          message:
            "Your guardian account and child profile were created, but we couldn't send the verification email. Please request a new verification email.",
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

      console.error("Guardian registration failed:", error);

      return {
        success: false as const,
        code: "REGISTRATION_FAILED" as const,
        message: "We couldn't complete guardian registration. Please try again.",
      };
    }
  });


export const registerManagerFn = createServerFn({
  method: "POST",
})
  .validator(managerRegistrationSchema)
  .handler(async ({ data }) => {
    try {
      const registeredManager = await registerManager(data);

      try {
        await sendVerificationEmail({
          to: registeredManager.user.email,
          fullName: registeredManager.user.fullName ?? data.fullName,
          token: registeredManager.verificationToken,
        });

        return {
          success: true as const,
          message:
            "Manager account created. Verify your email before signing in. A manager can only view talent profiles after the talent or guardian explicitly grants access.",
        };
      } catch (emailError) {
        console.error(
          "Manager verification email delivery failed:",
          emailError instanceof Error ? emailError.message : "Unknown error",
        );

        return {
          success: true as const,
          message:
            "Your manager account was created, but we couldn't send the verification email. Please request a new verification email.",
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

      console.error("Manager registration failed:", error);
      return {
        success: false as const,
        code: "REGISTRATION_FAILED" as const,
        message: "We couldn't complete manager registration. Please try again.",
      };
    }
  });

export const createGuardianChildProfileFn = createServerFn({
  method: "POST",
})
  .validator(guardianChildProfileSchema)
  .handler(async ({ data }) => {
    const profile = await createGuardianChildProfile(data);
    return { profile };
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
      const request = await createResendVerificationRequest(data.email);

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
              : "Unknown error",
          );
        }
      }

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
      const user = await authenticateUser(data.email, data.password);
      const session = await createSession(user.id);

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
  const user = await getAuthenticatedUser();

  if (!user) {
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

export const getMyTalentProfilesFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const profiles = await listAccessibleTalentProfiles();

  return { profiles };
});

export const getAdminTalentDirectoryFn = createServerFn({
  method: "GET",
})
  .validator(adminTalentDirectorySchema)
  .handler(async ({ data }) => {
    const directory = await searchAdminTalentProfiles(data);
    return { directory };
  });

export const createAdminTalentProfileFn = createServerFn({
  method: "POST",
})
  .validator(createAdminTalentProfileSchema)
  .handler(async ({ data }) => {
    const profile = await createAdminTalentProfile(data);
    return { profile };
  });

export const updateAdminTalentProfileStatusFn = createServerFn({
  method: "POST",
})
  .validator(adminTalentProfileStatusSchema)
  .handler(async ({ data }) => {
    const profile = await updateAdminTalentProfileStatus(data);
    return { profile };
  });

export const getTalentProfileFn = createServerFn({
  method: "GET",
})
  .validator(talentProfileIdSchema)
  .handler(async ({ data }) => {
    const profile = await getTalentProfile(data.profileId);

    return { profile };
  });


export const grantManagerAccessFn = createServerFn({
  method: "POST",
})
  .validator(grantManagerAccessSchema)
  .handler(async ({ data }) => {
    try {
      const grant = await grantManagerAccess(data);
      return { success: true as const, grant };
    } catch (error) {
      if (error instanceof ManagerAccessRequestError) {
        return { success: false as const, message: error.message };
      }
      throw error;
    }
  });

export const revokeManagerAccessFn = createServerFn({
  method: "POST",
})
  .validator(revokeManagerAccessSchema)
  .handler(async ({ data }) => {
    try {
      return await revokeManagerAccess(data);
    } catch (error) {
      if (error instanceof ManagerAccessRequestError) {
        return { success: false as const, message: error.message };
      }
      throw error;
    }
  });

export const updateTalentProfileFn = createServerFn({
  method: "POST",
})
  .validator(updateTalentProfileSchema)
  .handler(async ({ data }) => {
    const profile = await updateTalentProfile(data);

    return {
      success: true as const,
      profile,
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
