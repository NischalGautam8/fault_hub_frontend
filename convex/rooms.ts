import { query } from "./_generated/server";

export const getMyRooms = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return [];
  }
  
  const user = await db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    return [];
  }

  const rooms = await db.query("rooms").collect();
  return rooms.filter(room => room.members.includes(user._id));
});
