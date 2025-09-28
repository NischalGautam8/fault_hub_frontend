import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const sendMessage = mutation(async ({ db }, { roomId, content, username }: { roomId: Id<"rooms">; content: string; username: string }) => {
  if (!username) throw new Error("Username is required");

  // Get the room to check if it's private
  const room = await db.get(roomId);
  if (!room) throw new Error("Room not found");

  // For private rooms, check if the username is in the members list
  if (room.isprivate) {
    if (!room.members.includes(username)) {
      throw new Error("User is not a member of this private room");
    }
  }

  return await db.insert("messages", {
    roomId,
    senderId: username, // Use username directly
    content,
    createdAt: Date.now(),
  });
});

export const getMessages = query(async ({ db }, { roomId, username, limit = 50, cursor }: { roomId: Id<"rooms">; username?: string; limit?: number; cursor?: string }) => {
  if (!username) throw new Error("User must be logged in to view messages");

  // Get the room to check if it's private
  const room = await db.get(roomId);
  if (!room) throw new Error("Room not found");

  // For private rooms, check if the username is in the members list
  if (room.isprivate) {
    if (!room.members.includes(username)) {
      throw new Error("User is not a member of this private room");
    }
  }

  // Get messages with pagination (newest first, then reverse for display)
  let query = db.query("messages")
    .withIndex("by_room", q => q.eq("roomId", roomId))
    .order("desc");

  if (cursor) {
    query = query.filter(q => q.lt(q.field("_creationTime"), parseInt(cursor)));
  }

  const messages = await query.take(limit);
  
  return {
    messages: messages.reverse(), // Reverse to show oldest first
    nextCursor: messages.length === limit ? messages[messages.length - 1]._creationTime.toString() : null,
    hasMore: messages.length === limit
  };
});

export const getLastMessage = query(async ({ db }, { roomId }: { roomId: Id<"rooms"> }) => {
  return await db.query("messages")
    .withIndex("by_room", q => q.eq("roomId", roomId))
    .order("desc")
    .first();
});
