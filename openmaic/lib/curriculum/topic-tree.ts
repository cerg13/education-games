/**
 * Curriculum Topic Tree
 *
 * Dynamic topic tree that expands as the child progresses.
 * Initial seed topics for Math, Reading, and Surrounding World.
 * AI generates new sub-topics when a branch is explored.
 */

import { nanoid } from 'nanoid';
import type { TopicTree, TopicNode, SubjectId, SubjectConfig } from './types';

// ============================================================================
// Default Subject Configuration
// ============================================================================

const DEFAULT_SUBJECTS: Record<SubjectId, SubjectConfig> = {
  math: {
    id: 'math',
    name: 'Математика',
    icon: '🔢',
    color: '#8B5CF6',
    rootTopics: [],
    priority: 3,
  },
  reading: {
    id: 'reading',
    name: 'Чтение',
    icon: '📖',
    color: '#3B82F6',
    rootTopics: [],
    priority: 3,
  },
  world: {
    id: 'world',
    name: 'Окружающий мир',
    icon: '🌍',
    color: '#10B981',
    rootTopics: [],
    priority: 3,
  },
  logic: {
    id: 'logic',
    name: 'Логика',
    icon: '🧩',
    color: '#F59E0B',
    rootTopics: [],
    priority: 1,
  },
  nature: {
    id: 'nature',
    name: 'Природа',
    icon: '🌿',
    color: '#22C55E',
    rootTopics: [],
    priority: 1,
  },
  emotions: {
    id: 'emotions',
    name: 'Эмоции',
    icon: '💖',
    color: '#EC4899',
    rootTopics: [],
    priority: 1,
  },
  safety: {
    id: 'safety',
    name: 'Безопасность',
    icon: '🛡️',
    color: '#EF4444',
    rootTopics: [],
    priority: 1,
  },
};

// ============================================================================
// Seed Topics (initial curriculum for age 5+)
// ============================================================================

function createNode(
  subjectId: SubjectId,
  title: string,
  description: string,
  difficulty: number,
  parentId: string | null = null,
  prerequisites: string[] = [],
): TopicNode {
  return {
    id: nanoid(10),
    subjectId,
    parentId,
    title,
    description,
    difficulty,
    minAge: 5,
    prerequisites,
    lessonCount: 0,
    expanded: false,
    children: [],
    sourceUrls: [],
    createdAt: new Date().toISOString(),
  };
}

export function createInitialTopicTree(): TopicTree {
  const subjects = { ...DEFAULT_SUBJECTS };
  const nodes: Record<string, TopicNode> = {};

  // === MATH ===
  const mathCounting = createNode('math', 'Счёт до 10', 'Учимся считать от 1 до 10', 1);
  const mathCounting20 = createNode('math', 'Счёт до 20', 'Считаем от 10 до 20', 2, null, [mathCounting.id]);
  const mathAddition = createNode('math', 'Сложение', 'Складываем числа до 10', 3, null, [mathCounting.id]);
  const mathSubtraction = createNode('math', 'Вычитание', 'Вычитаем числа до 10', 3, null, [mathCounting.id]);
  const mathShapes = createNode('math', 'Фигуры', 'Круг, квадрат, треугольник', 1);
  const mathCompare = createNode('math', 'Сравнение чисел', 'Больше, меньше, равно', 2, null, [mathCounting.id]);

  subjects.math.rootTopics = [
    mathCounting.id, mathCounting20.id, mathAddition.id,
    mathSubtraction.id, mathShapes.id, mathCompare.id,
  ];

  // === READING ===
  const readLetters = createNode('reading', 'Буквы', 'Учим буквы русского алфавита', 1);
  const readVowels = createNode('reading', 'Гласные звуки', 'А, О, У, И, Э, Ы', 1);
  const readConsonants = createNode('reading', 'Согласные звуки', 'Б, В, Г, Д и другие', 2, null, [readVowels.id]);
  const readSyllables = createNode('reading', 'Слоги', 'Учимся читать слоги: МА, ПА, БА', 3, null, [readLetters.id]);
  const readWords = createNode('reading', 'Простые слова', 'Читаем первые слова: МАМА, ПАПА', 4, null, [readSyllables.id]);
  const readSentences = createNode('reading', 'Предложения', 'Читаем простые предложения', 5, null, [readWords.id]);

  subjects.reading.rootTopics = [
    readLetters.id, readVowels.id, readConsonants.id,
    readSyllables.id, readWords.id, readSentences.id,
  ];

  // === SURROUNDING WORLD ===
  const worldAnimals = createNode('world', 'Животные', 'Домашние и дикие животные', 1);
  const worldPlants = createNode('world', 'Растения', 'Деревья, цветы, ягоды', 1);
  const worldWeather = createNode('world', 'Погода и времена года', 'Весна, лето, осень, зима', 1);
  const worldBody = createNode('world', 'Моё тело', 'Части тела и органы чувств', 2);
  const worldProfessions = createNode('world', 'Профессии', 'Кем работают взрослые', 2);
  const worldTransport = createNode('world', 'Транспорт', 'Машины, поезда, самолёты', 1);

  subjects.world.rootTopics = [
    worldAnimals.id, worldPlants.id, worldWeather.id,
    worldBody.id, worldProfessions.id, worldTransport.id,
  ];

  // === LOGIC (lower priority) ===
  const logicPatterns = createNode('logic', 'Узоры и паттерны', 'Найди закономерность', 1);
  const logicSequences = createNode('logic', 'Последовательности', 'Что идёт дальше?', 2);
  const logicClassify = createNode('logic', 'Классификация', 'Раздели на группы', 2);

  subjects.logic.rootTopics = [logicPatterns.id, logicSequences.id, logicClassify.id];

  // === NATURE ===
  const natureSeasons = createNode('nature', 'Времена года в природе', 'Что происходит весной, летом, осенью, зимой', 1);
  const natureInsects = createNode('nature', 'Насекомые', 'Бабочки, жуки, муравьи', 1);
  const natureWater = createNode('nature', 'Вода', 'Откуда берётся дождь и снег', 2);

  subjects.nature.rootTopics = [natureSeasons.id, natureInsects.id, natureWater.id];

  // === EMOTIONS ===
  const emotionsBasic = createNode('emotions', 'Основные эмоции', 'Радость, грусть, злость, страх', 1);
  const emotionsFriendship = createNode('emotions', 'Дружба', 'Как дружить и помогать', 2);
  const emotionsEmpathy = createNode('emotions', 'Сочувствие', 'Понимать чувства других', 3);

  subjects.emotions.rootTopics = [emotionsBasic.id, emotionsFriendship.id, emotionsEmpathy.id];

  // === SAFETY ===
  const safetyRoad = createNode('safety', 'На дороге', 'Правила перехода дороги', 1);
  const safetyHome = createNode('safety', 'Дома', 'Безопасность дома', 1);
  const safetyStrangers = createNode('safety', 'Незнакомые люди', 'Как вести себя с незнакомцами', 2);

  subjects.safety.rootTopics = [safetyRoad.id, safetyHome.id, safetyStrangers.id];

  // Collect all nodes
  const allNodes = [
    mathCounting, mathCounting20, mathAddition, mathSubtraction, mathShapes, mathCompare,
    readLetters, readVowels, readConsonants, readSyllables, readWords, readSentences,
    worldAnimals, worldPlants, worldWeather, worldBody, worldProfessions, worldTransport,
    logicPatterns, logicSequences, logicClassify,
    natureSeasons, natureInsects, natureWater,
    emotionsBasic, emotionsFriendship, emotionsEmpathy,
    safetyRoad, safetyHome, safetyStrangers,
  ];

  for (const node of allNodes) {
    nodes[node.id] = node;
  }

  return { subjects, nodes };
}

// ============================================================================
// Topic Tree Operations
// ============================================================================

/** Get next available topics for a child based on completed prerequisites */
export function getAvailableTopics(
  tree: TopicTree,
  completedTopics: string[],
  subjectId?: SubjectId,
): TopicNode[] {
  const completedSet = new Set(completedTopics);

  return Object.values(tree.nodes).filter((node) => {
    if (subjectId && node.subjectId !== subjectId) return false;
    if (completedSet.has(node.id)) return false;
    return node.prerequisites.every((prereq) => completedSet.has(prereq));
  });
}

/** Get topics sorted by priority for lesson generation */
export function getTopicsByPriority(
  tree: TopicTree,
  childProgress: Record<SubjectId, { lessonsCompleted: number; averageScore: number }>,
): TopicNode[] {
  const available = getAvailableTopics(tree, []);

  return available.sort((a, b) => {
    const aPriority = tree.subjects[a.subjectId].priority;
    const bPriority = tree.subjects[b.subjectId].priority;

    // Higher subject priority first
    if (aPriority !== bPriority) return bPriority - aPriority;

    // Lower difficulty first (easier topics for beginners)
    return a.difficulty - b.difficulty;
  });
}

/** Add dynamically generated child topics to a parent node */
export function expandTopic(
  tree: TopicTree,
  parentId: string,
  childTopics: Omit<TopicNode, 'id' | 'parentId' | 'createdAt' | 'lessonCount' | 'expanded' | 'children' | 'sourceUrls'>[],
): TopicNode[] {
  const parent = tree.nodes[parentId];
  if (!parent) throw new Error(`Topic not found: ${parentId}`);

  const newNodes: TopicNode[] = childTopics.map((topic) => ({
    ...topic,
    id: nanoid(10),
    parentId,
    lessonCount: 0,
    expanded: false,
    children: [],
    sourceUrls: [],
    createdAt: new Date().toISOString(),
  }));

  for (const node of newNodes) {
    tree.nodes[node.id] = node;
    parent.children.push(node.id);
  }

  parent.expanded = true;
  return newNodes;
}
