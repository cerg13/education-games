/**
 * Curriculum Store (Zustand)
 *
 * Central state management for the curriculum engine.
 * Persists to localStorage/IndexedDB for offline support.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  TopicTree,
  ChildProfile,
  LessonQueue,
  LessonResult,
  FeedbackRating,
  SubjectId,
  Lesson,
  TopicNode,
} from './types';
import { createInitialTopicTree } from './topic-tree';
import { createChildProfile, processLessonResult, calculateStars } from './adaptive-engine';
import {
  createLessonQueue,
  getNextLesson,
  startLesson,
  completeLesson,
  addReadyLesson,
  createPendingLesson,
} from './lesson-queue';
import {
  startWorker,
  stopWorker,
  ensureQueueFilled,
} from './background-worker';
import { createWorkerCallbacks } from './openmaic-adapter';

// ============================================================================
// Store Interface
// ============================================================================

interface CurriculumStore {
  // State
  topicTree: TopicTree;
  profiles: Record<string, ChildProfile>;
  queues: Record<string, LessonQueue>;
  activeChildId: string | null;
  activeLesson: Lesson | null;
  isWorkerRunning: boolean;

  // Profile Actions
  createProfile: (name: string, age: number, character: string) => string;
  setActiveChild: (childId: string) => void;
  getActiveProfile: () => ChildProfile | null;

  // Lesson Flow
  getNextLesson: () => Lesson | null;
  startLesson: (lessonId: string) => Lesson | null;
  completeLesson: (lessonId: string, score: number, feedback: FeedbackRating, timeSpent: number) => void;

  // Worker
  startBackgroundWorker: () => void;
  stopBackgroundWorker: () => void;

  // Stats
  getSubjectProgress: (childId: string) => Record<SubjectId, { level: number; completed: number; score: number }>;
  getRecentHistory: (childId: string, count?: number) => LessonResult[];
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCurriculumStore = create<CurriculumStore>()(
  persist(
    (set, get) => ({
      // Initial State
      topicTree: createInitialTopicTree(),
      profiles: {},
      queues: {},
      activeChildId: null,
      activeLesson: null,
      isWorkerRunning: false,

      // Profile Actions
      createProfile: (name, age, character) => {
        const id = nanoid(10);
        const profile = createChildProfile(id, name, age, character);
        const queue = createLessonQueue(id);

        // Seed initial lessons from topic tree so child has something to start with
        const tree = get().topicTree;
        const seedSubjects: SubjectId[] = ['math', 'reading', 'world'];
        for (const sub of seedSubjects) {
          const rootTopics = tree.subjects[sub].rootTopics;
          if (rootTopics.length > 0) {
            const topicId = rootTopics[0];
            const topic = tree.nodes[topicId];
            if (topic) {
              const lesson = createPendingLesson(
                topicId,
                sub,
                topic.title,
                topic.description,
                topic.difficulty,
                sub === 'math' ? 'interactive' : sub === 'reading' ? 'slides' : 'story',
              );
              lesson.status = 'ready';
              lesson.queuePosition = seedSubjects.indexOf(sub);
              addReadyLesson(queue, lesson);
            }
          }
        }

        set((state) => ({
          profiles: { ...state.profiles, [id]: profile },
          queues: { ...state.queues, [id]: queue },
        }));

        return id;
      },

      setActiveChild: (childId) => {
        set({ activeChildId: childId });
      },

      getActiveProfile: () => {
        const { activeChildId, profiles } = get();
        if (!activeChildId) return null;
        return profiles[activeChildId] || null;
      },

      // Lesson Flow
      getNextLesson: () => {
        const { activeChildId, queues } = get();
        if (!activeChildId) return null;
        const queue = queues[activeChildId];
        if (!queue) return null;
        return getNextLesson(queue);
      },

      startLesson: (lessonId) => {
        const { activeChildId, queues } = get();
        if (!activeChildId) return null;

        const queue = { ...queues[activeChildId] };
        if (!queue) return null;

        const lesson = startLesson(queue, lessonId);
        if (lesson) {
          set((state) => ({
            queues: { ...state.queues, [activeChildId]: queue },
            activeLesson: lesson,
          }));
        }
        return lesson;
      },

      completeLesson: (lessonId, score, feedback, timeSpent) => {
        const { activeChildId, profiles, queues, topicTree, activeLesson } = get();
        if (!activeChildId) return;

        const profile = profiles[activeChildId];
        const queue = queues[activeChildId];
        if (!profile || !queue) return;

        const lesson = activeLesson;
        if (!lesson || lesson.id !== lessonId) return;

        const stars = calculateStars(score);

        const result: LessonResult = {
          lessonId,
          topicId: lesson.topicId,
          subjectId: lesson.subjectId,
          score,
          feedback,
          timeSpent,
          starsEarned: stars,
          completedAt: new Date().toISOString(),
        };

        // Process through adaptive engine
        const { updatedProfile, decision } = processLessonResult(
          { ...profile },
          result,
          topicTree,
        );

        // Remove from queue
        completeLesson(queue, lessonId);

        // Update state
        set((state) => ({
          profiles: { ...state.profiles, [activeChildId]: updatedProfile },
          queues: { ...state.queues, [activeChildId]: queue },
          activeLesson: null,
        }));

        // Ensure queue stays filled
        ensureQueueFilled(
          activeChildId,
          queue,
          updatedProfile,
          topicTree,
          decision.subjectPriorities,
          decision.preferredFormats,
        );

        // Schedule topic expansion if needed
        if (decision.shouldExpandTopic && decision.expandTopicId) {
          // This will be picked up by the background worker
          console.log(`[Curriculum] Expanding topic: ${decision.expandTopicId}`);
        }
      },

      // Worker
      startBackgroundWorker: () => {
        const store = get();

        const callbacks = createWorkerCallbacks(
          () => store.topicTree,
          (childId) => store.profiles[childId] || null,
          (childId) => store.queues[childId] || null,
          (lesson) => {
            const { activeChildId, queues } = get();
            if (activeChildId && queues[activeChildId]) {
              set((state) => ({
                queues: {
                  ...state.queues,
                  [activeChildId]: {
                    ...state.queues[activeChildId],
                    ready: [...state.queues[activeChildId].ready, lesson],
                  },
                },
              }));
            }
          },
          (parentId, newChildren) => {
            console.log(`[Curriculum] Topic expanded: ${parentId}, ${newChildren.length} new children`);
          },
        );

        startWorker(30000, callbacks);
        set({ isWorkerRunning: true });
      },

      stopBackgroundWorker: () => {
        stopWorker();
        set({ isWorkerRunning: false });
      },

      // Stats
      getSubjectProgress: (childId) => {
        const profile = get().profiles[childId];
        if (!profile) return {} as any;

        const result: Record<SubjectId, { level: number; completed: number; score: number }> = {} as any;
        for (const [key, progress] of Object.entries(profile.subjectProgress)) {
          result[key as SubjectId] = {
            level: progress.currentLevel,
            completed: progress.lessonsCompleted,
            score: progress.averageScore,
          };
        }
        return result;
      },

      getRecentHistory: (childId, count = 10) => {
        const profile = get().profiles[childId];
        if (!profile) return [];
        return profile.lessonHistory.slice(-count);
      },
    }),
    {
      name: 'curriculum-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        topicTree: state.topicTree,
        profiles: state.profiles,
        queues: state.queues,
        activeChildId: state.activeChildId,
      }),
    },
  ),
);
