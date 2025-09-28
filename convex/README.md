# Convex Setup

This directory contains the Convex backend for the chatting portal.

## Files

- `convex.json`: Convex project configuration
- `schema.ts`: Database schema definition

## Setup Instructions

1. Create a Convex account at https://convex.dev
2. Create a new Convex project
3. Deploy your Convex functions (when created)
4. Set the `NEXT_PUBLIC_CONVEX_URL` environment variable in `.env.local` to your project's URL

## Next Steps

To implement the chat functionality, you'll need to:

1. Create Convex functions for handling messages
2. Implement real-time subscriptions
3. Create API routes in your Next.js application to interact with Convex
