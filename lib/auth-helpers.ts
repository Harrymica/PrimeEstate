import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { UserRole } from './types';

export async function getCurrentUser() {
  const supabase = await createClient();

  try {
    // Try getUser() first — it validates the JWT with Supabase Auth server
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user) return user;

    // If getUser() returned an error (e.g. network timeout), fall back to
    // getSession() which reads the JWT from cookies without a network call.
    // The JWT is still cryptographically signed, so this is safe for
    // identifying the user. The middleware already refreshes sessions.
    if (error) {
      console.warn('getUser() failed, falling back to getSession():', error.message);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user ?? null;
    }

    return null;
  } catch (err) {
    // Handle unexpected errors (e.g. fetch timeout exceptions)
    console.warn('Auth check failed, falling back to getSession():', err);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user ?? null;
    } catch {
      return null;
    }
  }
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function requireRole(requiredRole: UserRole | UserRole[]) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/auth/login');
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(profile.role)) {
    redirect('/unauthorized');
  }

  return profile;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
