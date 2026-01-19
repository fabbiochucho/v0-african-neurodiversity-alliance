'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Corrected import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export default function IEPTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [learnerName, setLearnerName] = useState('');
  const [age, setAge] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const supabase = createClientComponentClient(); // Corrected variable declaration

  const testCreateLearner = async () => {
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

      const { data, error: err } = await supabase
        .from('learner_profiles')
        .insert([
          {
            user_id: user.id,
            name: learnerName || 'Test Learner',
            age: age ? parseInt(age) : 8,
            country: 'Ghana',
            diagnosis_domains: domains.length > 0 ? domains : ['ASD', 'ADHD'],
          },
        ])
        .select();

      if (err) {
        setError(`Learner creation error: ${err.message}`);
      } else {
        setMessage(`Learner created successfully! ID: ${data?.[0]?.id}`);
        console.log("[v0] Learner created:", data?.[0]);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateIEP = async () => {
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

      // Get first learner
      const { data: learners, error: learnerErr } = await supabase
        .from('learner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (learnerErr || !learners?.length) {
        setError('No learner found. Create a learner first.');
        setLoading(false);
        return;
      }

      const learner_id = learners[0].id;

      const { data, error: err } = await supabase
        .from('ieps')
        .insert([
          {
            learner_id,
            created_by: user.id,
            title: 'Test IEP',
            description: 'IEP created for testing',
            status: 'draft',
            adaptive_goals: [
              {
                goal: 'Improve communication skills',
                domain: 'ASD',
                target_date: '2024-03-31',
              },
            ],
            custom_goals: [
              {
                goal: 'Practice focus exercises',
                domain: 'ADHD',
                target_date: '2024-03-31',
              },
            ],
            ai_summary: 'Test IEP with adaptive goals for ASD and ADHD.',
          },
        ])
        .select();

      if (err) {
        setError(`IEP creation error: ${err.message}`);
      } else {
        setMessage(`IEP created successfully! ID: ${data?.[0]?.id}`);
        console.log("[v0] IEP created:", data?.[0]);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogProgress = async () => {
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

      // Get first goal
      const { data: ieps } = await supabase
        .from('ieps')
        .select('id')
        .eq('created_by', user.id)
        .limit(1);

      if (!ieps?.length) {
        setError('No IEP found. Create an IEP first.');
        setLoading(false);
        return;
      }

      const { data: goals } = await supabase
        .from('iep_goals')
        .select('id')
        .eq('iep_id', ieps[0].id)
        .limit(1);

      if (!goals?.length) {
        setError('No goals found in IEP.');
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('progress_logs')
        .insert([
          {
            goal_id: goals[0].id,
            logged_by: user.id,
            rating: 4,
            notes: 'Good progress today',
            logged_date: new Date().toISOString().split('T')[0],
          },
        ])
        .select();

      if (err) {
        setError(`Progress log error: ${err.message}`);
      } else {
        setMessage(`Progress logged successfully!`);
        console.log("[v0] Progress logged:", data?.[0]);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleDomain = (domain: string) => {
    setDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>IEP Workflow Test Console</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Learner Name"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                disabled={loading}
              />
              <Input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Diagnosis Domains:</p>
              <div className="space-y-1">
                {['ASD', 'ADHD', 'Dyslexia', 'Dyspraxia'].map((domain) => (
                  <div key={domain} className="flex items-center gap-2">
                    <Checkbox
                      checked={domains.includes(domain)}
                      onCheckedChange={() => toggleDomain(domain)}
                      disabled={loading}
                    />
                    <label className="text-sm">{domain}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={testCreateLearner} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Learner'}
              </Button>
              <Button onClick={testCreateIEP} disabled={loading} className="w-full bg-transparent" variant="outline">
                {loading ? 'Creating...' : 'Create IEP'}
              </Button>
              <Button onClick={testLogProgress} disabled={loading} className="w-full" variant="secondary">
                {loading ? 'Logging...' : 'Log Progress (Rating: 4)'}
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

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Test Flow:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Login first at /auth/login</li>
                <li>Create a Learner</li>
                <li>Create an IEP</li>
                <li>Log Progress</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
