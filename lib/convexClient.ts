import { ConvexHttpClient } from "convex/browser";

// Create a Convex HTTP client for server-side operations
// This will be used in your Next.js API routes or server components
export const convexHttpClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);
