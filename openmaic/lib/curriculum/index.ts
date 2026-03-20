/**
 * Curriculum Engine — Main Entry Point
 *
 * Self-expanding adaptive curriculum for children's education.
 * Integrates with OpenMAIC for lesson generation.
 */

export { createInitialTopicTree, getAvailableTopics, getTopicsByPriority, expandTopic } from './topic-tree';
export { processLessonResult, calculateStars, createChildProfile } from './adaptive-engine';
export type { AdaptiveDecision } from './adaptive-engine';
export {
  createLessonQueue,
  needsMoreLessons,
  lessonsNeeded,
  getNextLesson,
  startLesson,
  completeLesson,
  addReadyLesson,
  createPendingLesson,
  planNextLessons,
} from './lesson-queue';
export {
  startWorker,
  stopWorker,
  addJob,
  addJobs,
  getJobStatus,
  ensureQueueFilled,
  getKnowledgeForTopic,
  getKnowledgeForSubject,
  getKnowledgeStats,
} from './background-worker';
export type { WorkerCallbacks } from './background-worker';
export type {
  SubjectId,
  TopicNode,
  TopicTree,
  SubjectConfig,
  Lesson,
  LessonStatus,
  LessonFormat,
  FeedbackRating,
  ChildProfile,
  SubjectProgress,
  LessonResult,
  ChildPreferences,
  LessonQueue,
  GenerationJob,
  KnowledgeEntry,
  CurriculumEvent,
} from './types';
