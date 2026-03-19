import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { APIError, errorHandler } from '@/lib/error-handler';
import { getRecommendedContent } from '@/lib/neurafiki-content';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new APIError(401, 'UNAUTHORIZED', 'User must be authenticated');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new APIError(400, 'INVALID_JSON', 'Request body must be valid JSON');
    }

    const { assessmentResults, childAge, selectedGoalIds } = body;

    if (!assessmentResults || !childAge) {
      throw new APIError(
        400,
        'MISSING_PARAMS',
        'assessmentResults and childAge are required'
      );
    }

    // Get Neurafiki content recommendations
    const recommendations = await getRecommendedContent(
      user.id,
      assessmentResults,
      childAge,
      selectedGoalIds || []
    );

    return NextResponse.json(
      {
        success: true,
        recommendations,
        message: `Found ${recommendations.length} personalized Neurafiki resources for your child`,
      },
      { status: 200 }
    );
  } catch (err) {
    const { status, body } = errorHandler(err);
    return NextResponse.json(body, { status });
  }
}
