import { query } from "./_generated/server";

export const getCurrentUser = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
});
