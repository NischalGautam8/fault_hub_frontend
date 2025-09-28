// Client-side JWT utilities
export interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

// Simple JWT decode (without verification - verification should be done by your backend)
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    console.log('Decoded JWT payload:', decoded);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('Token is expired');
      return null;
    }
    
    // Try to map common JWT field variations to our expected format
    const userId = decoded.userId || decoded.sub || decoded.id || decoded.username;
    const email = decoded.email || decoded.user_email;
    
    if (!userId) {
      console.warn('No userId found in JWT payload. Available fields:', Object.keys(decoded));
      return null;
    }
    
    return {
      userId,
      email,
      exp: decoded.exp,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const decoded = decodeJWT(token);
  return decoded !== null;
}



export function getUserIdFromToken(token: string | null): string | null {
  if (!token) {
    console.log('No token provided to getUserIdFromToken');
    return null;
  }
  
  const decoded = decodeJWT(token);
  const userId = decoded?.userId || null;
  
  // Save username to localStorage for easy access
  if (userId && typeof window !== 'undefined') {
    localStorage.setItem('username', userId);
  }
  
  console.log('Extracted userId from token:', userId);
  return userId;
}

// Get username from localStorage (fallback if JWT parsing fails)
export function getUsernameFromStorage(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('username');
  }
  return null;
}