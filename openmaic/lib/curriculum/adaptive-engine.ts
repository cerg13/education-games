/**
 * Adaptive Engine
 *
 * Analyzes child's performance and feedback to adjust:
 * - Difficulty level per subject
 * - Topic priority and rotation
 * - Lesson format preferences
 * - Queue generation strategy
 */

import type {
  ChildProfile,
  SubjectProgress,
  LessonResult,
  SubjectId,
  FeedbackRating,
  LessonFormat,
  TopicTree,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const EASY_THRESHOLD = 80;    // Score above this = easy
const HARD_THRESHOLD = 50;    // Score below this = too hard
const STREAK_TO_LEVEL_UP = 3; // Consecutive easy passes to increase difficulty
const STREAK_TO_LEVEL_DOWN = 2; // Consecutive fails to decrease difficulty
const MAX_DIFFICULTY = 10;
const MIN_DIFFICULTY = 1;

// ============================================================================
// Core Adaptive Logic
// ============================================================================

export interface AdaptiveDecision {
  /** Should difficulty change? */
  difficultyDelta: number;
  /** New difficulty level */
  newDifficulty: number;
  /** Which subjects to prioritize for next lessons */
  subjectPriorities: Record<SubjectId, number>;
  /** Preferred formats based on feedback */
  preferredFormats: LessonFormat[];
  /** Should we expand the topic tree in this subject? */
  shouldExpandTopic: boolean;
  /** Specific topic to expand (if any) */
  expandTopicId?: string;
  /** Recommended next topic IDs */
  recommendedTopics: string[];
}

/** Process a completed lesson and return adaptive decisions */
export function processLessonResult(
  profile: ChildProfile,
  result: LessonResult,
  tree: TopicTree,
): { updatedProfile: ChildProfile; decision: AdaptiveDecision } {
  const subject = result.subjectId;
  const progress = profile.subjectProgress[subject] || createDefaultProgress(subject);

  // Update streaks
  if (result.score >= EASY_THRESHOLD) {
    progress.easyStreak++;
    progress.failStreak = 0;
  } else if (result.score < HARD_THRESHOLD) {
    progress.failStreak++;
    progress.easyStreak = 0;
  } else {
    progress.easyStreak = 0;
    progress.failStreak = 0;
  }

  // Calculate difficulty adjustment
  let difficultyDelta = 0;
  if (progress.easyStreak >= STREAK_TO_LEVEL_UP) {
    difficultyDelta = 1;
    progress.easyStreak = 0;
  } else if (progress.failStreak >= STREAK_TO_LEVEL_DOWN) {
    difficultyDelta = -1;
    progress.failStreak = 0;
  }

  const newDifficulty = Math.max(
    MIN_DIFFICULTY,
    Math.min(MAX_DIFFICULTY, progress.currentLevel + difficultyDelta),
  );
  progress.currentLevel = newDifficulty;

  // Update stats
  progress.lessonsCompleted++;
  progress.averageScore = updateRunningAverage(
    progress.averageScore,
    result.score,
    progress.lessonsCompleted,
  );

  // Mark topic as completed if score is good enough
  if (result.score >= HARD_THRESHOLD && !progress.completedTopics.includes(result.topicId)) {
    progress.completedTopics.push(result.topicId);
  }

  // Update preferences from feedback
  updatePreferences(profile.preferences, result);

  // Calculate subject priorities
  const subjectPriorities = calculateSubjectPriorities(profile, result);

  // Determine preferred formats
  const preferredFormats = getPreferredFormats(profile.preferences);

  // Should we expand the topic tree?
  const topicNode = tree.nodes[result.topicId];
  const shouldExpandTopic =
    topicNode &&
    !topicNode.expanded &&
    result.score >= EASY_THRESHOLD &&
    result.feedback !== 'disliked';

  // Find recommended next topics
  const recommendedTopics = getRecommendedTopics(tree, progress, subject);

  // Update profile
  profile.subjectProgress[subject] = progress;
  profile.totalLessonsCompleted++;
  profile.totalStars += result.starsEarned;
  profile.lessonHistory.push(result);
  profile.lastActiveAt = new Date().toISOString();

  const decision: AdaptiveDecision = {
    difficultyDelta,
    newDifficulty,
    subjectPriorities,
    preferredFormats,
    shouldExpandTopic,
    expandTopicId: shouldExpandTopic ? result.topicId : undefined,
    recommendedTopics,
  };

  return { updatedProfile: profile, decision };
}

// ============================================================================
// Helper Functions
// ============================================================================

function createDefaultProgress(subjectId: SubjectId): SubjectProgress {
  return {
    subjectId,
    currentLevel: 1,
    completedTopics: [],
    activeTopicId: null,
    lessonsCompleted: 0,
    averageScore: 0,
    easyStreak: 0,
    failStreak: 0,
  };
}

function updateRunningAverage(current: number, newValue: number, count: number): number {
  return Math.round(((current * (count - 1)) + newValue) / count);
}

function updatePreferences(prefs: ChildProfile['preferences'], result: LessonResult): void {
  const feedbackWeight = feedbackToWeight(result.feedback);

  // Update format preference
  // (lesson format is not in LessonResult, but we track via topic)
  // For now, track subject preferences
  prefs.preferredSubjects[result.subjectId] =
    (prefs.preferredSubjects[result.subjectId] || 0) + feedbackWeight;

  if (result.feedback === 'loved') {
    if (!prefs.lovedTopics.includes(result.topicId)) {
      prefs.lovedTopics.push(result.topicId);
    }
  } else if (result.feedback === 'disliked') {
    if (!prefs.dislikedTopics.includes(result.topicId)) {
      prefs.dislikedTopics.push(result.topicId);
    }
  }
}

function feedbackToWeight(feedback: FeedbackRating): number {
  switch (feedback) {
    case 'loved': return 3;
    case 'liked': return 1;
    case 'neutral': return 0;
    case 'disliked': return -2;
  }
}

/** Calculate how many lessons to pre-generate per subject */
function calculateSubjectPriorities(
  profile: ChildProfile,
  latestResult: LessonResult,
): Record<SubjectId, number> {
  const priorities: Record<SubjectId, number> = {} as Record<SubjectId, number>;
  const subjects: SubjectId[] = ['math', 'reading', 'world', 'logic', 'nature', 'emotions', 'safety'];

  for (const sub of subjects) {
    const progress = profile.subjectProgress[sub];
    const preference = profile.preferences.preferredSubjects[sub] || 0;
    const lessonsCompleted = progress?.lessonsCompleted || 0;

    // Base priority: subjects with more progress get more lessons
    let priority = 1;

    // Boost subjects the child enjoys
    if (preference > 0) priority += Math.min(preference, 5);

    // Boost the subject they just completed (momentum)
    if (sub === latestResult.subjectId && latestResult.feedback !== 'disliked') {
      priority += 2;
    }

    // Core subjects (math, reading, world) always get a base boost
    if (sub === 'math' || sub === 'reading' || sub === 'world') {
      priority += 2;
    }

    // Reduce priority for subjects they dislike
    if (preference < -3) priority = Math.max(1, priority - 3);

    priorities[sub] = priority;
  }

  return priorities;
}

function getPreferredFormats(prefs: ChildProfile['preferences']): LessonFormat[] {
  const formats = Object.entries(prefs.preferredFormats)
    .sort(([, a], [, b]) => b - a)
    .map(([format]) => format as LessonFormat);

  // Default order if no preferences yet
  if (formats.length === 0) {
    return ['interactive', 'quiz', 'slides', 'story', 'game'];
  }

  return formats;
}

function getRecommendedTopics(
  tree: TopicTree,
  progress: SubjectProgress,
  subjectId: SubjectId,
): string[] {
  const completedSet = new Set(progress.completedTopics);

  // Find topics in this subject that have met prerequisites
  const available = Object.values(tree.nodes).filter((node) => {
    if (node.subjectId !== subjectId) return false;
    if (completedSet.has(node.id)) return false;
    if (node.difficulty > progress.currentLevel + 1) return false;
    return node.prerequisites.every((prereq) => completedSet.has(prereq));
  });

  // Sort by difficulty (closest to current level first)
  return available
    .sort((a, b) => {
      const aDist = Math.abs(a.difficulty - progress.currentLevel);
      const bDist = Math.abs(b.difficulty - progress.currentLevel);
      return aDist - bDist;
    })
    .slice(0, 5)
    .map((n) => n.id);
}

/** Calculate stars earned based on score */
export function calculateStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}

/** Create a new child profile */
export function createChildProfile(
  id: string,
  name: string,
  age: number,
  character: string,
): ChildProfile {
  const subjects: SubjectId[] = ['math', 'reading', 'world', 'logic', 'nature', 'emotions', 'safety'];

  const subjectProgress: Record<SubjectId, SubjectProgress> = {} as Record<SubjectId, SubjectProgress>;
  for (const sub of subjects) {
    subjectProgress[sub] = createDefaultProgress(sub);
  }

  return {
    id,
    name,
    age,
    character,
    subjectProgress,
    totalLessonsCompleted: 0,
    totalStars: 0,
    lessonHistory: [],
    preferences: {
      preferredFormats: {} as Record<LessonFormat, number>,
      preferredSubjects: {} as Record<SubjectId, number>,
      lovedTopics: [],
      dislikedTopics: [],
    },
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
}
