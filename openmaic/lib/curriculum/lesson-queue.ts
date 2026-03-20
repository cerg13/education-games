/**
 * Lesson Queue Manager
 *
 * Maintains a buffer of ready-to-play lessons per child.
 * Proactively generates lessons in the background so the child
 * never has to wait. Prioritizes subjects based on adaptive engine.
 */

import { nanoid } from 'nanoid';
import type {
  LessonQueue,
  Lesson,
  SubjectId,
  LessonFormat,
  TopicTree,
  ChildProfile,
  GenerationJob,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TARGET_READY = 8;
const MIN_READY_THRESHOLD = 3; // Trigger generation when below this

// ============================================================================
// Queue Management
// ============================================================================

export function createLessonQueue(childId: string): LessonQueue {
  return {
    childId,
    ready: [],
    generating: [],
    targetReadyCount: DEFAULT_TARGET_READY,
  };
}

/** Check if queue needs more lessons */
export function needsMoreLessons(queue: LessonQueue): boolean {
  return queue.ready.length < MIN_READY_THRESHOLD;
}

/** How many lessons should we generate to fill the queue */
export function lessonsNeeded(queue: LessonQueue): number {
  const total = queue.ready.length + queue.generating.length;
  return Math.max(0, queue.targetReadyCount - total);
}

/** Get next lesson for the child to play */
export function getNextLesson(queue: LessonQueue): Lesson | null {
  if (queue.ready.length === 0) return null;

  // Sort by queue position and return first
  queue.ready.sort((a, b) => a.queuePosition - b.queuePosition);
  return queue.ready[0];
}

/** Mark a lesson as started */
export function startLesson(queue: LessonQueue, lessonId: string): Lesson | null {
  const idx = queue.ready.findIndex((l) => l.id === lessonId);
  if (idx === -1) return null;

  const lesson = queue.ready[idx];
  lesson.status = 'in_progress';
  queue.ready.splice(idx, 1);
  return lesson;
}

/** Mark a lesson as completed and remove from queue */
export function completeLesson(queue: LessonQueue, lessonId: string): void {
  // Remove from ready or generating
  queue.ready = queue.ready.filter((l) => l.id !== lessonId);
  queue.generating = queue.generating.filter((l) => l.id !== lessonId);
}

/** Add a generated lesson to the ready queue */
export function addReadyLesson(queue: LessonQueue, lesson: Lesson): void {
  lesson.status = 'ready';
  lesson.queuePosition = queue.ready.length;

  // Remove from generating if it was there
  queue.generating = queue.generating.filter((l) => l.id !== lesson.id);

  queue.ready.push(lesson);
}

/** Create a placeholder lesson that's being generated */
export function createPendingLesson(
  topicId: string,
  subjectId: SubjectId,
  title: string,
  description: string,
  difficulty: number,
  format: LessonFormat,
): Lesson {
  return {
    id: nanoid(12),
    topicId,
    subjectId,
    title,
    description,
    difficulty,
    format,
    status: 'generating',
    queuePosition: 999,
    estimatedMinutes: formatToMinutes(format),
    audioCacheKeys: [],
    createdAt: new Date().toISOString(),
  };
}

function formatToMinutes(format: LessonFormat): number {
  switch (format) {
    case 'slides': return 5;
    case 'quiz': return 3;
    case 'interactive': return 7;
    case 'story': return 5;
    case 'game': return 10;
  }
}

// ============================================================================
// Generation Planning
// ============================================================================

/** Determine which lessons to generate based on adaptive priorities */
export function planNextLessons(
  queue: LessonQueue,
  profile: ChildProfile,
  tree: TopicTree,
  subjectPriorities: Record<SubjectId, number>,
  preferredFormats: LessonFormat[],
): GenerationJob[] {
  const needed = lessonsNeeded(queue);
  if (needed <= 0) return [];

  // Calculate weighted distribution per subject
  const totalPriority = Object.values(subjectPriorities).reduce((sum, p) => sum + p, 0);
  const jobs: GenerationJob[] = [];

  // Distribute lessons across subjects by priority
  const subjectSlots: { subjectId: SubjectId; count: number }[] = [];
  let remaining = needed;

  const sortedSubjects = (Object.entries(subjectPriorities) as [SubjectId, number][])
    .sort(([, a], [, b]) => b - a);

  for (const [subjectId, priority] of sortedSubjects) {
    if (remaining <= 0) break;
    const count = Math.max(1, Math.round((priority / totalPriority) * needed));
    const actual = Math.min(count, remaining);
    subjectSlots.push({ subjectId, count: actual });
    remaining -= actual;
  }

  // Create generation jobs for each slot
  for (const { subjectId, count } of subjectSlots) {
    const progress = profile.subjectProgress[subjectId];
    const completedSet = new Set(progress?.completedTopics || []);

    // Find available topics
    const availableTopics = Object.values(tree.nodes).filter((node) => {
      if (node.subjectId !== subjectId) return false;
      if (completedSet.has(node.id)) return false;
      if (node.difficulty > (progress?.currentLevel || 1) + 1) return false;
      return node.prerequisites.every((prereq) => completedSet.has(prereq));
    });

    for (let i = 0; i < count && i < availableTopics.length; i++) {
      const topic = availableTopics[i];
      const format = preferredFormats[i % preferredFormats.length] || 'interactive';

      jobs.push({
        id: nanoid(12),
        childId: queue.childId,
        topicId: topic.id,
        subjectId,
        type: 'generate_lesson',
        status: 'pending',
        priority: subjectPriorities[subjectId] || 1,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return jobs;
}
