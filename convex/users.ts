import { query, mutation } from "./_generated/server";

export const getCurrentUser = query(async ({ db }, { userId }: { userId?: string }) => {
  if (!userId) {
    return null;
  }

  return await db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
    .unique();
});

export const createOrGetUser = mutation(async ({ db }, { userId, name }: { userId: string; name?: string }) => {
  // Check if user already exists
  const existingUser = await db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", userId))
    .unique();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  return await db.insert("users", {
    tokenIdentifier: userId,
    name: name || userId, // Use userId as name if no name provided
  });
});
