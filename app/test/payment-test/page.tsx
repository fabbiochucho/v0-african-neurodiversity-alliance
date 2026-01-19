'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SUBSCRIPTION_TIERS = [
  { id: 'free', name: 'Free', price: 0, description: 'Get started for free' },
  { id: 'premium', name: 'Premium', price: 4.99, description: '$4.99/month' },
  { id: 'pro', name: 'Pro', price: 9.99, description: '$9.99/month' },
  { id: 'institutional', name: 'Institutional', price: 99, description: '$99/year' },
];

export default function PaymentTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState('premium');
  const supabase = createClientComponentClient();

  const testInitializePayment = async (tier: string) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated. Please login first.');
        setLoading(false);
        return;
      }

      const tierData = SUBSCRIPTION_TIERS.find((t) => t.id === tier);
      if (!tierData || tierData.price === 0) {
        setError('Invalid tier selected or free tier selected');
        setLoading(false);
        return;
      }

      // Call payment initialization API
      const response = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: tierData.price,
          tier,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Payment error: ${data.error || 'Unknown error'}`);
      } else {
        setMessage(`Payment link generated! Redirecting to Flutterwave...`);
        console.log("[v0] Payment initialized:", data);
        // Redirect to Flutterwave link
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          setMessage(`Transaction reference: ${data.transaction_id}`);
        }
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testVerifyPayment = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Get transaction reference from URL or ask user
      const transactionRef = prompt('Enter Flutterwave transaction reference:');
      if (!transactionRef) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payments/flutterwave/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionRef }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(`Verification error: ${data.error || 'Unknown error'}`);
      } else {
        setMessage(`Payment verified! Status: ${data.status}`);
        console.log("[v0] Payment verified:", data);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCheckSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated.');
        return;
      }

      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (err) {
        setMessage('No active subscription');
        console.log("[v0] No subscription found:", err);
      } else {
        setMessage(`Current tier: ${data.tier}, Status: ${data.status}`);
        console.log("[v0] Current subscription:", data);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Flutterwave Payment Test Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {SUBSCRIPTION_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-3 rounded border text-left cursor-pointer transition ${
                    selectedTier === tier.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  disabled={loading || tier.price === 0}
                >
                  <div className="font-medium">{tier.name}</div>
                  <div className="text-sm text-muted-foreground">{tier.description}</div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => testInitializePayment(selectedTier)}
                disabled={loading || selectedTier === 'free'}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Initialize Payment'}
              </Button>
              <Button onClick={testVerifyPayment} disabled={loading} variant="outline" className="w-full bg-transparent">
                Verify Payment
              </Button>
              <Button onClick={testCheckSubscription} disabled={loading} variant="secondary" className="w-full">
                Check Subscription
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

            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-medium">Test Flutterwave Card:</p>
              <p>Card: 4242 4242 4242 4242</p>
              <p>Expiry: 09/25</p>
              <p>CVV: 123</p>
              <p className="mt-2">Test Flow:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Login at /auth/login</li>
                <li>Select tier and click Initialize Payment</li>
                <li>Use test card in Flutterwave popup</li>
                <li>Return to app and click Verify Payment</li>
                <li>Check subscription in database</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
