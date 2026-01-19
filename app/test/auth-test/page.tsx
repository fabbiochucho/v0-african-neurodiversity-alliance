'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Import createClientComponentClient

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ); // Declare createClientComponentClient

  const testSignUp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
      });
      
      if (error) {
        setError(`Sign-up error: ${error.message}`);
      } else {
        setMessage('Sign-up successful! Check email for confirmation.');
        console.log("[v0] Sign-up response:", data);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(`Login error: ${error.message}`);
      } else {
        setMessage('Login successful! Redirecting...');
        console.log("[v0] Login response:", data);
        setTimeout(() => router.push('/protected'), 2000);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    setError('');
    
    try {
      await supabase.auth.signOut();
      setMessage('Logged out successfully!');
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setMessage(`Active session: ${session.user.email}`);
        console.log("[v0] Current session:", session);
      } else {
        setMessage('No active session');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testSignUp} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Sign Up'}
              </Button>
              <Button onClick={testLogin} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Login'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testSession} variant="outline" disabled={loading} className="w-full bg-transparent">
                Check Session
              </Button>
              <Button onClick={testLogout} variant="destructive" disabled={loading} className="w-full">
                Test Logout
              </Button>
            </div>

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Test credentials:</p>
              <p>Email: test@example.com</p>
              <p>Password: TestPassword123!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
