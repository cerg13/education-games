/**
 * Curriculum API — Main endpoint
 *
 * GET  /api/curriculum?childId=xxx — Get curriculum state for a child
 * POST /api/curriculum — Create child profile
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialTopicTree,
  createChildProfile,
  createLessonQueue,
  getAvailableTopics,
} from '@/lib/curriculum';

// In-memory store (will be replaced with DB later)
const store = {
  topicTree: createInitialTopicTree(),
  profiles: new Map<string, any>(),
  queues: new Map<string, any>(),
};

export async function GET(req: NextRequest) {
  const childId = req.nextUrl.searchParams.get('childId');

  if (childId) {
    const profile = store.profiles.get(childId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const queue = store.queues.get(childId);
    const completedTopics = Object.values(profile.subjectProgress)
      .flatMap((p: any) => p.completedTopics);

    const availableTopics = getAvailableTopics(store.topicTree, completedTopics);

    return NextResponse.json({
      profile,
      queue: queue ? {
        ready: queue.ready.length,
        generating: queue.generating.length,
        nextLesson: queue.ready[0] || null,
      } : null,
      availableTopics: availableTopics.slice(0, 10),
      subjectProgress: profile.subjectProgress,
    });
  }

  // Return all profiles (for profile selection screen)
  const profiles = Array.from(store.profiles.values());
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, age, character } = body;

  if (!name || !age) {
    return NextResponse.json(
      { error: 'Name and age are required' },
      { status: 400 },
    );
  }

  const id = `child_${Date.now()}`;
  const profile = createChildProfile(id, name, age || 5, character || 'fox');
  const queue = createLessonQueue(id);

  store.profiles.set(id, profile);
  store.queues.set(id, queue);

  return NextResponse.json({ profile, queue }, { status: 201 });
}
