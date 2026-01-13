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
  let headers: Headers;
  
  if (request) {
    headers = request.headers as unknown as Headers;
  } else {
    const { headers: nextHeaders } = await import('next/headers');
    headers = nextHeaders() as unknown as Headers;
  }
  
  return await auth.api.getSession({
    headers: headers,
  });
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
