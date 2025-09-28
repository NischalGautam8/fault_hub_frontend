"use node";

import jwt, { JwtPayload } from "jsonwebtoken";

// Define the expected JWT payload structure
interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
}

// Custom JWT verifier for Node.js environment
export const verifyJWT = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    
    const payload = jwt.verify(token, secret) as CustomJwtPayload;
    
    // Map JWT payload to Convex identity
    return {
      tokenIdentifier: payload.userId,   // use Neon userId
      name: payload.email,
    };
  } catch (error) {
    throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};