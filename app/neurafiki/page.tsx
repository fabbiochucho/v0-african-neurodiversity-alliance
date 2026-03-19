'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';

interface RecommendedContent {
  contentId: string;
  title: string;
  reason: string;
  relevance: number;
  type: string;
  pillar: string;
}

export default function NeurafikiPage() {
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const pillars = [
    {
      id: 'family-support',
      name: 'Family Support',
      description: 'Parent education, home strategies, emotional resilience',
      icon: Icons.Heart,
    },
    {
      id: 'school-inclusion',
      name: 'School Inclusion',
      description: 'Working with teachers, accommodations, IEP meetings',
      icon: Icons.BookOpen,
    },
    {
      id: 'cultural-context',
      name: 'Cultural Context',
      description: 'Extended family, faith, stigma, community wisdom',
      icon: Icons.Globe,
    },
    {
      id: 'advocacy',
      name: 'Advocacy & Systems',
      description: 'Policy awareness, inclusion models, your story',
      icon: Icons.Target,
    },
    {
      id: 'research',
      name: 'Research & Learning',
      description: 'Evidence, studies, thought leadership',
      icon: Icons.Lightbulb,
    },
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/neurafiki/recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentResults: {
            communication: 3,
            sensory: 4,
            social: 2,
            movement: 3,
            regulation: 2,
            learning: 3,
          },
          childAge: 8,
          selectedGoalIds: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('[v0] Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = selectedPillar
    ? recommendations.filter((r) => r.pillar === selectedPillar)
    : recommendations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-balance mb-2">
            Neurafiki: A Friend to Neurodivergent Minds
          </h1>
          <p className="text-lg text-muted-foreground">
            Parent education, community wisdom, and culturally grounded support for African families
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Neurafiki Pillars */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">The Five Pillars of Neurafiki</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {pillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(selectedPillar === pillar.id ? null : pillar.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPillar === pillar.id
                      ? 'border-[#3C9C87] bg-[#3C9C87]/10'
                      : 'border-muted hover:border-[#3C9C87]'
                  }`}
                >
                  <div className="mb-2">
                    <PillarIcon className="w-6 h-6 text-[#3C9C87]" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{pillar.name}</h3>
                  <p className="text-xs text-muted-foreground">{pillar.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recommended Content */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedPillar ? `${selectedPillar.replace('-', ' ')} Resources` : 'Recommended for You'}
            </h2>
            {selectedPillar && (
              <Button variant="outline" onClick={() => setSelectedPillar(null)}>
                Clear Filter
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading personalized recommendations...</p>
            </div>
          ) : filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRecommendations.map((content) => (
                <Card key={content.contentId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{content.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{content.reason}</p>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {content.relevance}% match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-[#3C9C87]/10 text-[#3C9C87] rounded">
                          {content.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {content.pillar.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" className="flex-1">
                          Read Now
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-muted-foreground">
                No content found for this filter. Try selecting a different pillar.
              </p>
            </Card>
          )}
        </section>

        {/* Neurafiki Mission Statement */}
        <section className="mt-16 bg-[#3C9C87]/5 border border-[#3C9C87]/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-[#3C9C87]">Our Mission</h2>
          <div className="space-y-4 text-foreground">
            <p>
              <strong>Neurafiki</strong> - A friend to neurodivergent minds - is a neurodiversity pillar under Become Change.
            </p>
            <blockquote className="text-xl font-semibold italic border-l-4 border-[#3C9C87] pl-4 my-4">
              "People may see a diagnosis. We choose to see a destiny."
            </blockquote>
            <p>
              We help families, communities, and systems understand, support, and celebrate neurodivergent minds.
              Rooted in African lived experience, grounded in family systems, and built on community wisdom.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
