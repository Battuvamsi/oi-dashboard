import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  // @ts-ignore - Temporary workaround for Convex type inference issue
  const userQuery = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);

  // This effect updates the loading state once auth is loaded and user data is available
  // It ensures we only show content when both authentication state and user data are ready
  useEffect(() => {
    if (!isAuthLoading && userQuery !== undefined) {
      setIsLoading(false);
    }
  }, [isAuthLoading, userQuery]);

  return {
    isLoading,
    isAuthenticated,
    user: userQuery,
    signIn,
    signOut,
  };
}
