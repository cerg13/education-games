/**
 * OpenMAIC Adapter
 *
 * Bridges the curriculum engine with OpenMAIC's lesson generation pipeline.
 * Transforms topic nodes into OpenMAIC classroom generation requests
 * and converts results back to curriculum Lesson objects.
 */

import { nanoid } from 'nanoid';
import type {
  TopicNode,
  TopicTree,
  KnowledgeEntry,
  ChildProfile,
  Lesson,
  LessonFormat,
  LessonQueue,
  SubjectId,
} from './types';
import type { WorkerCallbacks } from './background-worker';

// ============================================================================
// OpenMAIC Classroom Generation
// ============================================================================

const OPENMAIC_API = process.env.NEXT_PUBLIC_OPENMAIC_API || '';

/** Generate a lesson using OpenMAIC's classroom generation pipeline */
export async function generateLessonViaOpenMAIC(
  topicNode: TopicNode,
  knowledge: KnowledgeEntry[],
  profile: ChildProfile,
): Promise<Lesson> {
  // Build the requirement prompt for OpenMAIC
  const requirement = buildLessonRequirement(topicNode, knowledge, profile);

  // Call OpenMAIC's generate-classroom API
  const response = await fetch(`${OPENMAIC_API}/api/generate-classroom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements: {
        requirement,
        language: 'ru-RU',
        userNickname: profile.name,
        userBio: `Ребёнок ${profile.age} лет, уровень ${profile.subjectProgress[topicNode.subjectId]?.currentLevel || 1}`,
      },
      options: {
        sceneCount: topicNode.difficulty <= 3 ? 3 : 5,
        enableQuiz: true,
        enableInteractive: topicNode.subjectId !== 'reading',
        ttsProvider: 'silero-tts',
        ttsVoice: 'xenia',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenMAIC generation failed: ${response.statusText}`);
  }

  const result = await response.json();

  // Poll for completion
  const classroomId = await pollForCompletion(result.jobId, result.pollUrl);

  // Create lesson from generated classroom
  const lesson: Lesson = {
    id: nanoid(12),
    topicId: topicNode.id,
    subjectId: topicNode.subjectId,
    title: topicNode.title,
    description: topicNode.description,
    difficulty: topicNode.difficulty,
    format: determineFormat(topicNode),
    classroomId,
    status: 'ready',
    queuePosition: 999,
    estimatedMinutes: topicNode.difficulty <= 3 ? 5 : 8,
    audioCacheKeys: [],
    createdAt: new Date().toISOString(),
  };

  return lesson;
}

async function pollForCompletion(jobId: string, pollUrl: string): Promise<string> {
  const maxAttempts = 60;
  const pollInterval = 3000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const response = await fetch(`${OPENMAIC_API}${pollUrl}`);
    if (!response.ok) continue;

    const status = await response.json();
    if (status.status === 'completed' && status.classroomId) {
      return status.classroomId;
    }
    if (status.status === 'failed') {
      throw new Error(`Generation failed: ${status.error}`);
    }
  }

  throw new Error('Generation timed out');
}

// ============================================================================
// Prompt Building
// ============================================================================

function buildLessonRequirement(
  topic: TopicNode,
  knowledge: KnowledgeEntry[],
  profile: ChildProfile,
): string {
  const level = profile.subjectProgress[topic.subjectId]?.currentLevel || 1;
  const age = profile.age;

  let prompt = `Создай интерактивный урок для ребёнка ${age} лет на тему "${topic.title}".

Описание темы: ${topic.description}
Уровень сложности: ${topic.difficulty}/10 (текущий уровень ученика: ${level}/10)
Предмет: ${getSubjectName(topic.subjectId)}

ВАЖНЫЕ ТРЕБОВАНИЯ:
- Язык: русский
- Возраст аудитории: ${age} лет
- Используй простые слова и короткие предложения
- Добавь яркие примеры и аналогии из жизни ребёнка
- Включи интерактивные элементы (квизы, задания)
- Тон: дружелюбный, поддерживающий, весёлый
- Продолжительность: ${topic.difficulty <= 3 ? '3-5' : '5-8'} минут`;

  // Add knowledge context if available
  if (knowledge.length > 0) {
    prompt += '\n\nДополнительные материалы по теме:\n';
    for (const entry of knowledge.slice(0, 3)) {
      prompt += `- ${entry.title}: ${entry.content.slice(0, 300)}\n`;
    }
  }

  // Add subject-specific instructions
  prompt += '\n\n' + getSubjectInstructions(topic.subjectId, level);

  return prompt;
}

function getSubjectName(subjectId: SubjectId): string {
  const names: Record<SubjectId, string> = {
    math: 'Математика',
    reading: 'Чтение',
    world: 'Окружающий мир',
    logic: 'Логика',
    nature: 'Природа',
    emotions: 'Эмоции и чувства',
    safety: 'Безопасность',
  };
  return names[subjectId];
}

function getSubjectInstructions(subjectId: SubjectId, level: number): string {
  switch (subjectId) {
    case 'math':
      return `Математические задания:
- Уровень ${level}: ${level <= 2 ? 'счёт, распознавание цифр' : level <= 4 ? 'сложение и вычитание до 10' : level <= 6 ? 'сложение и вычитание до 20' : 'умножение, деление'}
- Используй визуальные примеры (фрукты, игрушки, животные)
- Каждый квиз должен иметь картинки или эмодзи
- Хвали за правильные ответы`;

    case 'reading':
      return `Задания на чтение:
- Уровень ${level}: ${level <= 2 ? 'буквы и звуки' : level <= 4 ? 'слоги и простые слова' : 'предложения и короткие тексты'}
- Каждую букву/слог озвучивай
- Используй крупный шрифт
- Добавь картинки к словам`;

    case 'world':
      return `Окружающий мир:
- Используй фотографии и иллюстрации
- Расскажи интересные факты
- Задай вопросы "А ты знал, что...?"
- Свяжи с повседневным опытом ребёнка`;

    default:
      return `Общие рекомендации:
- Начни с чего-то знакомого ребёнку
- Постепенно вводи новые понятия
- Завершай квизом для закрепления
- Используй поощрения и звёзды`;
  }
}

function determineFormat(topic: TopicNode): LessonFormat {
  // Math and logic → interactive
  if (topic.subjectId === 'math' || topic.subjectId === 'logic') return 'interactive';
  // Reading → slides (with audio)
  if (topic.subjectId === 'reading') return 'slides';
  // Nature, world → story + quiz
  if (topic.subjectId === 'nature' || topic.subjectId === 'world') return 'story';
  // Default
  return 'quiz';
}

// ============================================================================
// Topic Expansion via AI
// ============================================================================

/** Use AI to generate child topics for a parent topic */
export async function expandTopicViaAI(
  topic: TopicNode,
  profile: ChildProfile,
): Promise<{ title: string; description: string; difficulty: number; subjectId: SubjectId; minAge: number; prerequisites: string[] }[]> {
  const response = await fetch(`${OPENMAIC_API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `Ты — эксперт по детскому образованию. Генерируй подтемы для учебной программы ребёнка ${profile.age} лет.
Отвечай ТОЛЬКО JSON массивом объектов с полями: title, description, difficulty (1-10).`,
        },
        {
          role: 'user',
          content: `Тема: "${topic.title}" (${getSubjectName(topic.subjectId)}, сложность ${topic.difficulty}/10)
Описание: ${topic.description}

Сгенерируй 3-5 подтем, которые углубляют эту тему. Каждая подтема должна быть чуть сложнее родительской (difficulty +1-2).
Подтемы должны быть конкретными, интересными ребёнку и практичными.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI topic expansion failed: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content || '';

  // Parse JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON array');
  }

  const parsed = JSON.parse(jsonMatch[0]) as { title: string; description: string; difficulty: number }[];

  return parsed.map((item) => ({
    title: item.title,
    description: item.description,
    difficulty: Math.min(10, Math.max(1, item.difficulty)),
    subjectId: topic.subjectId,
    minAge: profile.age,
    prerequisites: [topic.id],
  }));
}

// ============================================================================
// Web Search via Tavily
// ============================================================================

export async function searchForContent(
  query: string,
): Promise<{ title: string; content: string; url: string }[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) {
    console.warn('[OpenMAIC Adapter] No TAVILY_API_KEY, skipping web search');
    return [];
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    console.error('[OpenMAIC Adapter] Tavily search failed:', response.statusText);
    return [];
  }

  const data = await response.json();
  return (data.results || []).map((r: any) => ({
    title: r.title || '',
    content: r.content || '',
    url: r.url || '',
  }));
}

// ============================================================================
// Create Worker Callbacks
// ============================================================================

export function createWorkerCallbacks(
  getTree: () => TopicTree,
  getProfile: (childId: string) => ChildProfile | null,
  getQueue: (childId: string) => LessonQueue | null,
  onLessonReady: (lesson: Lesson) => void,
  onTopicExpanded: (parentId: string, newChildren: TopicNode[]) => void,
): WorkerCallbacks {
  return {
    generateLesson: generateLessonViaOpenMAIC,
    webSearch: searchForContent,
    expandTopicAI: expandTopicViaAI,
    generateTTS: async (text: string, voice: string) => {
      // TTS is handled by OpenMAIC during classroom generation
      return '';
    },
    onLessonReady,
    onTopicExpanded,
    onError: (job, error) => {
      console.error(`[BackgroundWorker] Job ${job.id} failed:`, error.message);
    },
    getTree,
    getProfile,
    getQueue,
  };
}
