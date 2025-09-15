import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  requestPasswordReset,
  resetPassword,
} = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
