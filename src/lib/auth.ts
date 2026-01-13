import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from './db';
import { user, session, account, verification } from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
});

export type Session = typeof auth.$Infer.Session;

// Server-side auth helpers
export async function getSession(request?: Request) {
  if (request) {
    // Convert Request headers to Headers object
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    return await auth.api.getSession({
      headers: headers,
    });
  } else {
    // Use Next.js headers() for server components
    // ReadonlyHeaders needs to be converted to Headers for Better Auth
    const { headers } = await import('next/headers');
    const headersObj = await headers();
    
    // Convert ReadonlyHeaders to plain object first, then to Headers
    // This avoids issues with ReadonlyHeaders methods
    const headersPlain: Record<string, string> = {};
    
    // ReadonlyHeaders has keys() method
    const keys = headersObj.keys();
    for (const key of keys) {
      const value = headersObj.get(key);
      if (value !== null) {
        headersPlain[key] = value;
      }
    }
    
    // Create Headers from plain object
    const headersMap = new Headers();
    Object.entries(headersPlain).forEach(([key, value]) => {
      headersMap.set(key, value);
    });
    
    return await auth.api.getSession({
      headers: headersMap,
    });
  }
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
  try {
    const result = await getSession(request);
    return !!(result?.user && result?.session);
  } catch {
    return false;
  }
}

export async function requireAuth(request?: Request) {
  const result = await getSession(request);
  if (!result?.user || !result?.session) {
    throw new Error('Unauthorized');
  }
  return result;
}
