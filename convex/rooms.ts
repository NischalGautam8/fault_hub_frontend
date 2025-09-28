import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getMyRooms = query(async ({ db }, { username }: { username?: string }) => {
  if (!username) {
    return [];
  }

  const rooms = await db.query("rooms").collect();
  // Only return DM rooms (private rooms with exactly 2 members) where user is a member
  const dmRooms = rooms.filter(room => 
    room.isprivate && 
    room.members.length === 2 && 
    room.members.includes(username)
  );

  // Transform rooms to show the other person's name instead of full room name
  return dmRooms.map(room => ({
    ...room,
    displayName: room.members.find(member => member !== username) || room.name
  }));
});

export const getPublicRooms = query(async ({ db }) => {
  // Get all rooms that are not private
  return await db.query("rooms")
    .filter(q => q.eq(q.field("isprivate"), false))
    .collect();
});

export const createRoom = mutation(async ({ db }, { name, isprivate, memberNames, username }: { name: string; isprivate: boolean; memberNames?: string[]; username: string }) => {
  if (!username) throw new Error("Username is required");

  const members = isprivate ? [...(memberNames || []), username] : [];

  return await db.insert("rooms", {
    name,
    isprivate,
    members,
  });
});

// Create a DM room between two users
export const createDMRoom = mutation(async ({ db }, { username, otherUsername }: { username: string; otherUsername: string }) => {
  if (!username || !otherUsername) throw new Error("Both usernames are required");
  if (username === otherUsername) throw new Error("Cannot create DM with yourself");

  // Check if DM already exists between these users
  const existingRooms = await db.query("rooms").collect();
  const existingDM = existingRooms.find(room => 
    room.isprivate && 
    room.members.length === 2 && 
    room.members.includes(username) && 
    room.members.includes(otherUsername)
  );

  if (existingDM) {
    return existingDM;
  }

  // Create new DM room
  const roomName = `DM: ${username} & ${otherUsername}`;
  return await db.insert("rooms", {
    name: roomName,
    isprivate: true,
    members: [username, otherUsername],
  });
});

// Helper mutation to create test rooms
export const createTestRooms = mutation(async ({ db }) => {
  // Create a public room if it doesn't exist
  const publicRooms = await db.query("rooms")
    .filter(q => q.eq(q.field("name"), "General Chat"))
    .collect();
  
  if (publicRooms.length === 0) {
    await db.insert("rooms", {
      name: "General Chat",
      isprivate: false,
      members: [],
    });
  }

  // Create another public room
  const publicRooms2 = await db.query("rooms")
    .filter(q => q.eq(q.field("name"), "Random"))
    .collect();
  
  if (publicRooms2.length === 0) {
    await db.insert("rooms", {
      name: "Random",
      isprivate: false,
      members: [],
    });
  }

  return "Test rooms created";
});
