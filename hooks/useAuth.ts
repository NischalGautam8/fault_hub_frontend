import { getAuthToken } from "@/lib/api";

export const useAuth = () => {
  const token = getAuthToken();

  return {
    isLoading: false,
    isAuthenticated: !!token,
    fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      return getAuthToken();
    },
  };
};
