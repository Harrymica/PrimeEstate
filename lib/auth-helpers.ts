import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { UserRole } from './types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
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
