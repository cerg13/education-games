/**
 * Background Worker
 *
 * Runs in the background to:
 * 1. Search the web for educational content by topic
 * 2. Build knowledge base from found content
 * 3. Generate lessons via OpenMAIC pipeline
 * 4. Pre-generate TTS audio for lessons
 * 5. Expand topic tree when needed
 *
 * The worker ensures the child always has lessons ready.
 */

import { nanoid } from 'nanoid';
import type {
  GenerationJob,
  KnowledgeEntry,
  TopicNode,
  TopicTree,
  ChildProfile,
  Lesson,
  LessonQueue,
  SubjectId,
} from './types';
import { expandTopic } from './topic-tree';
import { addReadyLesson, createPendingLesson, needsMoreLessons, planNextLessons } from './lesson-queue';

// ============================================================================
// Worker State
// ============================================================================

interface WorkerState {
  isRunning: boolean;
  jobs: GenerationJob[];
  knowledgeBase: KnowledgeEntry[];
  intervalId?: ReturnType<typeof setInterval>;
}

const state: WorkerState = {
  isRunning: false,
  jobs: [],
  knowledgeBase: [],
};

// ============================================================================
// Worker Lifecycle
// ============================================================================

export function startWorker(
  pollIntervalMs: number = 30000,
  callbacks: WorkerCallbacks,
): void {
  if (state.isRunning) return;
  state.isRunning = true;

  // Process pending jobs periodically
  state.intervalId = setInterval(async () => {
    await processNextJob(callbacks);
  }, pollIntervalMs);

  console.log('[BackgroundWorker] Started with poll interval', pollIntervalMs, 'ms');
}

export function stopWorker(): void {
  state.isRunning = false;
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = undefined;
  }
  console.log('[BackgroundWorker] Stopped');
}

export function addJob(job: GenerationJob): void {
  state.jobs.push(job);
  state.jobs.sort((a, b) => b.priority - a.priority);
}

export function addJobs(jobs: GenerationJob[]): void {
  state.jobs.push(...jobs);
  state.jobs.sort((a, b) => b.priority - a.priority);
}

export function getJobStatus(): { pending: number; running: number; completed: number } {
  return {
    pending: state.jobs.filter((j) => j.status === 'pending').length,
    running: state.jobs.filter((j) => j.status === 'running').length,
    completed: state.jobs.filter((j) => j.status === 'completed').length,
  };
}

// ============================================================================
// Callbacks Interface
// ============================================================================

export interface WorkerCallbacks {
  /** Called to generate a lesson via OpenMAIC */
  generateLesson: (topicNode: TopicNode, knowledge: KnowledgeEntry[], profile: ChildProfile) => Promise<Lesson>;
  /** Called to search the web for educational content */
  webSearch: (query: string) => Promise<{ title: string; content: string; url: string }[]>;
  /** Called to expand a topic using AI */
  expandTopicAI: (topic: TopicNode, profile: ChildProfile) => Promise<{ title: string; description: string; difficulty: number; subjectId: SubjectId; minAge: number; prerequisites: string[] }[]>;
  /** Called to pre-generate TTS audio */
  generateTTS: (text: string, voice: string) => Promise<string>;
  /** Called when a lesson is ready */
  onLessonReady: (lesson: Lesson) => void;
  /** Called when topic tree is expanded */
  onTopicExpanded: (parentId: string, newChildren: TopicNode[]) => void;
  /** Called on error */
  onError: (job: GenerationJob, error: Error) => void;
  /** Get current state */
  getTree: () => TopicTree;
  getProfile: (childId: string) => ChildProfile | null;
  getQueue: (childId: string) => LessonQueue | null;
}

// ============================================================================
// Job Processing
// ============================================================================

async function processNextJob(callbacks: WorkerCallbacks): Promise<void> {
  const job = state.jobs.find((j) => j.status === 'pending');
  if (!job) return;

  job.status = 'running';

  try {
    switch (job.type) {
      case 'web_research':
        await processWebResearch(job, callbacks);
        break;
      case 'expand_topic':
        await processExpandTopic(job, callbacks);
        break;
      case 'generate_lesson':
        await processGenerateLesson(job, callbacks);
        break;
    }
    job.status = 'completed';
    job.completedAt = new Date().toISOString();
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : String(error);
    callbacks.onError(job, error instanceof Error ? error : new Error(String(error)));
  }
}

async function processWebResearch(
  job: GenerationJob,
  callbacks: WorkerCallbacks,
): Promise<void> {
  const tree = callbacks.getTree();
  const topic = tree.nodes[job.topicId];
  if (!topic) return;

  // Build age-appropriate search queries
  const queries = buildSearchQueries(topic);
  job.searchQueries = queries;

  const entries: KnowledgeEntry[] = [];
  for (const query of queries) {
    const results = await callbacks.webSearch(query);

    for (const result of results) {
      const entry: KnowledgeEntry = {
        id: nanoid(10),
        topicId: job.topicId,
        subjectId: job.subjectId,
        title: result.title,
        content: result.content.slice(0, 2000), // Limit content size
        sourceUrl: result.url,
        relevance: 0.8, // Will be scored by AI later
        ageAppropriateness: 0.9,
        createdAt: new Date().toISOString(),
      };
      entries.push(entry);
    }
  }

  job.knowledgeEntries = entries;
  state.knowledgeBase.push(...entries);
}

async function processExpandTopic(
  job: GenerationJob,
  callbacks: WorkerCallbacks,
): Promise<void> {
  const tree = callbacks.getTree();
  const topic = tree.nodes[job.topicId];
  if (!topic || topic.expanded) return;

  const profile = callbacks.getProfile(job.childId);
  if (!profile) return;

  const childTopics = await callbacks.expandTopicAI(topic, profile);

  const newNodes = expandTopic(tree, job.topicId, childTopics);
  callbacks.onTopicExpanded(job.topicId, newNodes);
}

async function processGenerateLesson(
  job: GenerationJob,
  callbacks: WorkerCallbacks,
): Promise<void> {
  const tree = callbacks.getTree();
  const topic = tree.nodes[job.topicId];
  if (!topic) return;

  const profile = callbacks.getProfile(job.childId);
  if (!profile) return;

  // Get relevant knowledge for this topic
  const knowledge = state.knowledgeBase.filter(
    (k) => k.topicId === job.topicId || k.subjectId === job.subjectId,
  );

  // Generate lesson via OpenMAIC
  const lesson = await callbacks.generateLesson(topic, knowledge, profile);

  // Add to queue
  const queue = callbacks.getQueue(job.childId);
  if (queue) {
    addReadyLesson(queue, lesson);
  }

  callbacks.onLessonReady(lesson);
}

// ============================================================================
// Proactive Queue Management
// ============================================================================

/**
 * Check if any child's queue is low and schedule generation jobs.
 * Should be called after each lesson completion.
 */
export function ensureQueueFilled(
  childId: string,
  queue: LessonQueue,
  profile: ChildProfile,
  tree: TopicTree,
  subjectPriorities: Record<SubjectId, number>,
  preferredFormats: string[],
): void {
  if (!needsMoreLessons(queue)) return;

  const jobs = planNextLessons(
    queue,
    profile,
    tree,
    subjectPriorities,
    preferredFormats as any,
  );

  // Also schedule web research for topics that don't have enough knowledge
  for (const job of jobs) {
    const topicKnowledge = state.knowledgeBase.filter((k) => k.topicId === job.topicId);
    if (topicKnowledge.length < 3) {
      addJob({
        id: nanoid(12),
        childId,
        topicId: job.topicId,
        subjectId: job.subjectId,
        type: 'web_research',
        status: 'pending',
        priority: job.priority + 1, // Research before generation
        createdAt: new Date().toISOString(),
      });
    }
  }

  addJobs(jobs);
}

// ============================================================================
// Search Query Builder
// ============================================================================

function buildSearchQueries(topic: TopicNode): string[] {
  const base = `${topic.title} для детей`;
  const queries = [
    `${base} 5 лет`,
    `${base} объяснение простое`,
    `${topic.title} интересные факты дети`,
  ];

  // Add subject-specific queries
  switch (topic.subjectId) {
    case 'math':
      queries.push(`${topic.title} задания для дошкольников`);
      break;
    case 'reading':
      queries.push(`${topic.title} обучение чтению`);
      break;
    case 'world':
      queries.push(`${topic.title} окружающий мир 1 класс`);
      break;
    case 'nature':
      queries.push(`${topic.title} природоведение дети`);
      break;
    case 'safety':
      queries.push(`${topic.title} правила безопасности дети`);
      break;
  }

  return queries;
}

// ============================================================================
// Knowledge Base Access
// ============================================================================

export function getKnowledgeForTopic(topicId: string): KnowledgeEntry[] {
  return state.knowledgeBase.filter((k) => k.topicId === topicId);
}

export function getKnowledgeForSubject(subjectId: SubjectId): KnowledgeEntry[] {
  return state.knowledgeBase.filter((k) => k.subjectId === subjectId);
}

export function getKnowledgeStats(): { total: number; bySubject: Record<string, number> } {
  const bySubject: Record<string, number> = {};
  for (const entry of state.knowledgeBase) {
    bySubject[entry.subjectId] = (bySubject[entry.subjectId] || 0) + 1;
  }
  return { total: state.knowledgeBase.length, bySubject };
}
