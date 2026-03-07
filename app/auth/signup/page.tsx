'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';
import { validateEmail } from '@/lib/validate-email';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('tenant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function handleEmailChange(value: string) {
    setEmail(value);
    setEmailError(null);
    setEmailSuggestion(null);
    setEmailValid(false);

    if (value.length === 0) return;

    // Only validate once user has typed a reasonable email (has @ and something after)
    if (value.includes('@') && value.indexOf('@') < value.length - 1) {
      const result = validateEmail(value);
      if (!result.isValid) {
        setEmailError(result.error || null);
        setEmailSuggestion(result.suggestion || null);
      } else {
        setEmailValid(true);
      }
    }
  }

  function applySuggestion() {
    if (emailSuggestion) {
      setEmail(emailSuggestion);
      setEmailError(null);
      setEmailSuggestion(null);
      setEmailValid(true);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Final email validation before submit
    const result = validateEmail(email);
    if (!result.isValid) {
      setEmailError(result.error || 'Please enter a valid email address.');
      setEmailSuggestion(result.suggestion || null);
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Create auth user with metadata (name + role stored in auth.users)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
            role: role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        return;
      }

      // Create user profile via server-side API (bypasses RLS)
      const profileRes = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email: normalizedEmail,
          fullName: name,
          role,
        }),
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        setError(profileData.error || 'Failed to create profile');
        return;
      }

      // Redirect to verification or login
      router.push('/auth/verify-email');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to get started with our platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={emailError ? 'border-red-400 focus-visible:ring-red-400' : emailValid ? 'border-green-400 focus-visible:ring-green-400' : ''}
                  required
                />
                {emailValid && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {emailError && (
                <div className="text-sm text-red-600 flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    {emailSuggestion ? (
                      <>
                        Did you mean{' '}
                        <button
                          type="button"
                          onClick={applySuggestion}
                          className="font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          {emailSuggestion}
                        </button>
                        ?
                      </>
                    ) : (
                      emailError
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                I am a
              </label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant (Looking for apartments)</SelectItem>
                  <SelectItem value="landlord">Landlord (Renting properties)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !!emailError}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
