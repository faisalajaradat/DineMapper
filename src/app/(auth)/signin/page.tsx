'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user, setUser } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Login (sets httpOnly cookie)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // REQUIRED for cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Login failed');
      }

      // Fetch authenticated user from cookie
      const meResponse = await fetch('/api/auth/me', {
        credentials: 'include', // REQUIRED for cookies
      });

      if (!meResponse.ok) {
        throw new Error('Failed to authenticate session');
      }

      const userData = await meResponse.json();
      setUser(userData.user);

      router.push('/home');
    } catch (err: any) {
      console.error('SignIn error:', err);
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200
                         focus:ring-opacity-50"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                         focus:border-indigo-300 focus:ring focus:ring-indigo-200
                         focus:ring-opacity-50"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded
                       hover:bg-blue-600 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Do not have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-600">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}