import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the schema for your Convex database
export default defineSchema({
  // Add your tables here as needed for the chat portal
  // For example:
  rooms: defineTable({
    name: v.string(),
    isprivate: v.boolean(),
    members: v.array(v.string()),
  }).index("by_member", ["members"]),

  messages: defineTable({
    roomId: v.string(),
    senderId: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_room", ["roomId"]).index("by_sender", ["senderId"]),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
