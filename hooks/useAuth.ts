import { getAuthToken } from "@/lib/api";
import { isTokenValid, getUserIdFromToken, getUsernameFromStorage } from "@/lib/jwt-utils";

export const useAuth = () => {
  const token = getAuthToken();
  const isAuthenticated = isTokenValid(token);
  const userId = getUserIdFromToken(token) || getUsernameFromStorage();

  return {
    isLoading: false,
    isAuthenticated,
    userId,
    username: userId, // alias for clarity
    token,
    fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      return getAuthToken();
    },
  };
};
