import { mutation, query } from "./_generated/server";
export const sendMessage = mutation(async ({ db, auth }, { roomId, content }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) throw new Error("Not logged in");

  return await db.insert("messages", {
    roomId,
    senderId: identity.tokenIdentifier, // Neon userId
    content,
    createdAt: Date.now(),
  });
});

export const getMessages = query(async ({ db }, { roomId }) => {
  return await db.query("messages")
    .withIndex("by_room", q => q.eq("roomId", roomId))
    .order("asc")
    .collect();
});