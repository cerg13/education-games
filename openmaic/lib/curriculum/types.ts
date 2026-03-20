/**
 * Curriculum Engine Types
 *
 * Self-expanding adaptive curriculum for children's education.
 * The system dynamically generates and manages topic trees,
 * lesson queues, and tracks child progress.
 */

// ============================================================================
// Topic Tree
// ============================================================================

export type SubjectId = 'math' | 'reading' | 'world' | 'logic' | 'nature' | 'emotions' | 'safety';

export interface TopicNode {
  id: string;
  subjectId: SubjectId;
  parentId: string | null;
  title: string;
  description: string;
  /** Difficulty level 1-10 */
  difficulty: number;
  /** Minimum age recommendation */
  minAge: number;
  /** Prerequisites — topic IDs that should be completed first */
  prerequisites: string[];
  /** How many lessons exist for this topic */
  lessonCount: number;
  /** Whether this node has been expanded (children generated) */
  expanded: boolean;
  /** Auto-generated children topic IDs */
  children: string[];
  /** Metadata from web research */
  sourceUrls: string[];
  createdAt: string;
}

export interface TopicTree {
  subjects: Record<SubjectId, SubjectConfig>;
  nodes: Record<string, TopicNode>;
}

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  /** Root topic IDs for this subject */
  rootTopics: string[];
  /** Priority weight (higher = more lessons generated) */
  priority: number;
}

// ============================================================================
// Lessons
// ============================================================================

export type LessonStatus = 'generating' | 'ready' | 'in_progress' | 'completed' | 'failed';
export type LessonFormat = 'slides' | 'quiz' | 'interactive' | 'story' | 'game';
export type FeedbackRating = 'loved' | 'liked' | 'neutral' | 'disliked';

export interface Lesson {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  difficulty: number;
  format: LessonFormat;
  /** OpenMAIC classroom ID (if generated) */
  classroomId?: string;
  status: LessonStatus;
  /** Position in queue (lower = sooner) */
  queuePosition: number;
  /** Estimated duration in minutes */
  estimatedMinutes: number;
  /** Pre-generated TTS audio cache keys */
  audioCacheKeys: string[];
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// Child Progress
// ============================================================================

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  character: string;
  /** Progress per subject */
  subjectProgress: Record<SubjectId, SubjectProgress>;
  /** Overall stats */
  totalLessonsCompleted: number;
  totalStars: number;
  /** Lesson history */
  lessonHistory: LessonResult[];
  /** Preferences learned from feedback */
  preferences: ChildPreferences;
  createdAt: string;
  lastActiveAt: string;
}

export interface SubjectProgress {
  subjectId: SubjectId;
  /** Current difficulty level achieved */
  currentLevel: number;
  /** Topics completed */
  completedTopics: string[];
  /** Current active topic */
  activeTopicId: string | null;
  /** Total lessons completed in this subject */
  lessonsCompleted: number;
  /** Average quiz score (0-100) */
  averageScore: number;
  /** Number of consecutive easy passes (triggers difficulty increase) */
  easyStreak: number;
  /** Number of consecutive fails (triggers difficulty decrease) */
  failStreak: number;
}

export interface LessonResult {
  lessonId: string;
  topicId: string;
  subjectId: SubjectId;
  /** Quiz score 0-100 */
  score: number;
  /** Child's feedback */
  feedback: FeedbackRating;
  /** Time spent in seconds */
  timeSpent: number;
  /** Stars earned */
  starsEarned: number;
  completedAt: string;
}

export interface ChildPreferences {
  /** Preferred lesson formats (learned from feedback) */
  preferredFormats: Record<LessonFormat, number>;
  /** Preferred subjects (learned from engagement) */
  preferredSubjects: Record<SubjectId, number>;
  /** Topics the child loved */
  lovedTopics: string[];
  /** Topics the child disliked */
  dislikedTopics: string[];
}

// ============================================================================
// Lesson Queue
// ============================================================================

export interface LessonQueue {
  childId: string;
  /** Ready lessons waiting to be played */
  ready: Lesson[];
  /** Lessons currently being generated */
  generating: Lesson[];
  /** Target: always keep this many ready lessons */
  targetReadyCount: number;
}

// ============================================================================
// Background Worker
// ============================================================================

export interface GenerationJob {
  id: string;
  childId: string;
  topicId: string;
  subjectId: SubjectId;
  type: 'expand_topic' | 'generate_lesson' | 'web_research';
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  /** Web search queries used */
  searchQueries?: string[];
  /** Found knowledge entries */
  knowledgeEntries?: KnowledgeEntry[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface KnowledgeEntry {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  title: string;
  content: string;
  sourceUrl: string;
  /** Relevance score 0-1 */
  relevance: number;
  /** Age-appropriateness score 0-1 */
  ageAppropriateness: number;
  createdAt: string;
}

// ============================================================================
// Events
// ============================================================================

export type CurriculumEvent =
  | { type: 'lesson_completed'; childId: string; result: LessonResult }
  | { type: 'topic_expanded'; topicId: string; newChildren: string[] }
  | { type: 'lesson_generated'; lessonId: string; topicId: string }
  | { type: 'difficulty_adjusted'; childId: string; subjectId: SubjectId; newLevel: number }
  | { type: 'queue_low'; childId: string; readyCount: number }
  | { type: 'knowledge_added'; entryId: string; topicId: string };
