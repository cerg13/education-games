// React hooks from global React (loaded via CDN)
const { useState, useEffect, useCallback, useRef } = React;

// API для работы с профилями
const API_URL = '/api';

const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return response.json();
};

const getProfiles = () => fetchAPI('/profiles');
const createProfile = (profile) => fetchAPI('/profiles', { method: 'POST', body: JSON.stringify(profile) });
const updateProfileAPI = (id, profile) => fetchAPI(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(profile) });
const deleteProfileAPI = (id) => fetchAPI(`/profiles/${id}`, { method: 'DELETE' });

// Структура островов по методике Зайцева (оптимальная последовательность)
const ISLANDS = {
  1: {
    name: 'Остров Гласных',
    emoji: '🏝️',
    color: '#FF6B9D',
    vowels: ['А', 'О', 'У'],
    consonants: ['М', 'С'],
    description: 'Первые звуки и слова',
    words: [
      { word: 'МА-МА', display: 'МАМА', image: '👩', syllables: ['МА', 'МА'] },
      { word: 'ПА-ПА', display: 'ПАПА', image: '👨', syllables: ['ПА', 'ПА'] },
      { word: 'СОМ', display: 'СОМ', image: '🐟', syllables: ['СОМ'] },
      { word: 'О-СА', display: 'ОСА', image: '🐝', syllables: ['О', 'СА'] },
      { word: 'СУ-МА', display: 'СУМА', image: '💰', syllables: ['СУ', 'МА'] },
      { word: 'МУ-МУ', display: 'МУМУ', image: '🐮', syllables: ['МУ', 'МУ'] },
      { word: 'СА-МА', display: 'САМА', image: '👧', syllables: ['СА', 'МА'] },
      { word: 'У-СЫ', display: 'УСЫ', image: '😺', syllables: ['У', 'СЫ'] },
    ]
  },
  2: {
    name: 'Остров Сонорных',
    emoji: '🌴',
    color: '#4ECDC4',
    vowels: ['Ы', 'Э'],
    consonants: ['Л', 'Н', 'Р'],
    description: 'Звуки, которые можно тянуть',
    words: [
      { word: 'ЛУ-НА', display: 'ЛУНА', image: '🌙', syllables: ['ЛУ', 'НА'] },
      { word: 'МЫ-ЛО', display: 'МЫЛО', image: '🧼', syllables: ['МЫ', 'ЛО'] },
      { word: 'РА-МА', display: 'РАМА', image: '🖼️', syllables: ['РА', 'МА'] },
      { word: 'НО-РА', display: 'НОРА', image: '🕳️', syllables: ['НО', 'РА'] },
      { word: 'РО-СА', display: 'РОСА', image: '💧', syllables: ['РО', 'СА'] },
      { word: 'ЛА-МА', display: 'ЛАМА', image: '🦙', syllables: ['ЛА', 'МА'] },
      { word: 'НО-СЫ', display: 'НОСЫ', image: '👃', syllables: ['НО', 'СЫ'] },
      { word: 'РЫ-СЫ', display: 'РЫСЫ', image: '🐆', syllables: ['РЫ', 'СЫ'] },
      { word: 'СО-ЛЬ', display: 'СОЛЬ', image: '🧂', syllables: ['СОЛЬ'] },
    ]
  },
  3: {
    name: 'Остров Шипящих',
    emoji: '🏖️',
    color: '#FFE66D',
    vowels: [],
    consonants: ['Ш', 'Х', 'К', 'П', 'Т'],
    description: 'Новые согласные',
    words: [
      { word: 'КА-ША', display: 'КАША', image: '🥣', syllables: ['КА', 'ША'] },
      { word: 'МУ-ХА', display: 'МУХА', image: '🪰', syllables: ['МУ', 'ХА'] },
      { word: 'РУ-КА', display: 'РУКА', image: '✋', syllables: ['РУ', 'КА'] },
      { word: 'УТ-КА', display: 'УТКА', image: '🦆', syllables: ['УТ', 'КА'] },
      { word: 'МАК', display: 'МАК', image: '🌺', syllables: ['МАК'] },
      { word: 'ТО-ПОР', display: 'ТОПОР', image: '🪓', syllables: ['ТО', 'ПОР'] },
      { word: 'ПУ-ХА', display: 'ПУХА', image: '🪶', syllables: ['ПУ', 'ХА'] },
      { word: 'КОТ', display: 'КОТ', image: '🐱', syllables: ['КОТ'] },
      { word: 'ШАР', display: 'ШАР', image: '🎈', syllables: ['ШАР'] },
      { word: 'ПА-ЛА-ТА', display: 'ПАЛАТА', image: '🏛️', syllables: ['ПА', 'ЛА', 'ТА'] },
    ]
  },
  4: {
    name: 'Остров Звонких',
    emoji: '🏔️',
    color: '#95E1D3',
    vowels: [],
    consonants: ['Б', 'В', 'Г', 'Д', 'З', 'Ж'],
    description: 'Звонкие согласные',
    words: [
      { word: 'ЖА-БА', display: 'ЖАБА', image: '🐸', syllables: ['ЖА', 'БА'] },
      { word: 'ЗЕ-БРА', display: 'ЗЕБРА', image: '🦓', syllables: ['ЗЕ', 'БРА'] },
      { word: 'ВО-ДА', display: 'ВОДА', image: '💧', syllables: ['ВО', 'ДА'] },
      { word: 'ДО-МА', display: 'ДОМА', image: '🏘️', syllables: ['ДО', 'МА'] },
      { word: 'БА-БА', display: 'БАБА', image: '👵', syllables: ['БА', 'БА'] },
      { word: 'ГО-РА', display: 'ГОРА', image: '⛰️', syllables: ['ГО', 'РА'] },
      { word: 'ЗУ-БЫ', display: 'ЗУБЫ', image: '🦷', syllables: ['ЗУ', 'БЫ'] },
      { word: 'ДУБ', display: 'ДУБ', image: '🌳', syllables: ['ДУБ'] },
      { word: 'ВА-ГОН', display: 'ВАГОН', image: '🚃', syllables: ['ВА', 'ГОН'] },
      { word: 'ЖУК', display: 'ЖУК', image: '🪲', syllables: ['ЖУК'] },
    ]
  },
  5: {
    name: 'Остров Книг',
    emoji: '📚',
    color: '#A8E6CF',
    vowels: ['Я', 'Е', 'Ё', 'Ю', 'И'],
    consonants: ['Й', 'Ч', 'Щ', 'Ц', 'Ф', 'Ь', 'Ъ'],
    description: 'Мягкие гласные и первые тексты',
    words: [
      { word: 'МО-РЕ', display: 'МОРЕ', image: '🌊', syllables: ['МО', 'РЕ'] },
      { word: 'МЯ-ЧИК', display: 'МЯЧИК', image: '⚽', syllables: ['МЯ', 'ЧИК'] },
      { word: 'РЫ-БА', display: 'РЫБА', image: '🐠', syllables: ['РЫ', 'БА'] },
      { word: 'ЧАЙ', display: 'ЧАЙ', image: '☕', syllables: ['ЧАЙ'] },
      { word: 'ЯБ-ЛО-КО', display: 'ЯБЛОКО', image: '🍎', syllables: ['ЯБ', 'ЛО', 'КО'] },
      { word: 'ЁЖ', display: 'ЁЖ', image: '🦔', syllables: ['ЁЖ'] },
      { word: 'ЮЛА', display: 'ЮЛА', image: '🪀', syllables: ['ЮЛА'] },
      { word: 'ЦВЕ-ТЫ', display: 'ЦВЕТЫ', image: '🌸', syllables: ['ЦВЕ', 'ТЫ'] },
      { word: 'ЩУ-КА', display: 'ЩУКА', image: '🐊', syllables: ['ЩУ', 'КА'] },
      { word: 'ФО-НА-РИК', display: 'ФОНАРИК', image: '🔦', syllables: ['ФО', 'НА', 'РИК'] },
    ],
    stories: [
      {
        title: 'МАМА И ЛУНА',
        image: '🌙',
        sentences: [
          { text: 'МАМА И СЫН', words: ['МАМА', 'И', 'СЫН'] },
          { text: 'ОНИ НА ГОРЕ', words: ['ОНИ', 'НА', 'ГОРЕ'] },
          { text: 'ЛУНА НА НЕБЕ', words: ['ЛУНА', 'НА', 'НЕБЕ'] },
        ]
      },
      {
        title: 'У РЕКИ',
        image: '🏞️',
        sentences: [
          { text: 'РЕКА БЫЛА ТИХАЯ', words: ['РЕКА', 'БЫЛА', 'ТИХАЯ'] },
          { text: 'РЫБА В ВОДЕ', words: ['РЫБА', 'В', 'ВОДЕ'] },
          { text: 'УТКА НА РЕКЕ', words: ['УТКА', 'НА', 'РЕКЕ'] },
        ]
      },
      {
        title: 'В ЛЕСУ',
        image: '🌲',
        sentences: [
          { text: 'ЛЕС БЫЛ БОЛЬШОЙ', words: ['ЛЕС', 'БЫЛ', 'БОЛЬШОЙ'] },
          { text: 'ТАМ ЖИЛИ ЗВЕРИ', words: ['ТАМ', 'ЖИЛИ', 'ЗВЕРИ'] },
          { text: 'ЗАЙКА И ЛИСА', words: ['ЗАЙКА', 'И', 'ЛИСА'] },
        ]
      },
      {
        title: 'КОТИК И МЫШКА',
        image: '🐱',
        sentences: [
          { text: 'ЖИЛ БЫЛ КОТИК', words: ['ЖИЛ', 'БЫЛ', 'КОТИК'] },
          { text: 'ОН ЛЮБИЛ ИГРАТЬ', words: ['ОН', 'ЛЮБИЛ', 'ИГРАТЬ'] },
          { text: 'МЫШКА БЕГАЛА ОТ КОТА', words: ['МЫШКА', 'БЕГАЛА', 'ОТ', 'КОТА'] },
        ]
      },
      {
        title: 'НА МОРЕ',
        image: '🌊',
        sentences: [
          { text: 'МЫ БЫЛИ НА МОРЕ', words: ['МЫ', 'БЫЛИ', 'НА', 'МОРЕ'] },
          { text: 'ВОДА БЫЛА ТЕПЛАЯ', words: ['ВОДА', 'БЫЛА', 'ТЕПЛАЯ'] },
          { text: 'РЫБКИ ПЛАВАЛИ В ВОДЕ', words: ['РЫБКИ', 'ПЛАВАЛИ', 'В', 'ВОДЕ'] },
        ]
      },
      {
        title: 'МОЙ ДОМ',
        image: '🏡',
        sentences: [
          { text: 'Я ЖИВУ В ДОМЕ', words: ['Я', 'ЖИВУ', 'В', 'ДОМЕ'] },
          { text: 'У МЕНЯ ЕСТЬ КОМНАТА', words: ['У', 'МЕНЯ', 'ЕСТЬ', 'КОМНАТА'] },
          { text: 'ТАМ МНОГО ИГРУШЕК', words: ['ТАМ', 'МНОГО', 'ИГРУШЕК'] },
        ]
      },
      {
        title: 'БАБОЧКА И ЦВЕТОК',
        image: '🦋',
        sentences: [
          { text: 'БАБОЧКА ЛЕТАЛА В САДУ', words: ['БАБОЧКА', 'ЛЕТАЛА', 'В', 'САДУ'] },
          { text: 'ОНА СЕЛА НА ЦВЕТОК', words: ['ОНА', 'СЕЛА', 'НА', 'ЦВЕТОК'] },
          { text: 'ЦВЕТОК БЫЛ КРАСИВЫЙ', words: ['ЦВЕТОК', 'БЫЛ', 'КРАСИВЫЙ'] },
        ]
      },
      {
        title: 'ЁЖ И ГРИБЫ',
        image: '🦔',
        sentences: [
          { text: 'ЁЖ ЖИЛ В ЛЕСУ', words: ['ЁЖ', 'ЖИЛ', 'В', 'ЛЕСУ'] },
          { text: 'ОН ИСКАЛ ГРИБЫ', words: ['ОН', 'ИСКАЛ', 'ГРИБЫ'] },
          { text: 'ЁЖ НАШЁЛ БОЛЬШОЙ ГРИБ', words: ['ЁЖ', 'НАШЁЛ', 'БОЛЬШОЙ', 'ГРИБ'] },
        ]
      },
      {
        title: 'ЩЕНОК',
        image: '🐶',
        sentences: [
          { text: 'У МЕНЯ ЕСТЬ ЩЕНОК', words: ['У', 'МЕНЯ', 'ЕСТЬ', 'ЩЕНОК'] },
          { text: 'ОН ОЧЕНЬ ВЕСЁЛЫЙ', words: ['ОН', 'ОЧЕНЬ', 'ВЕСЁЛЫЙ'] },
          { text: 'МЫ ИГРАЕМ ВМЕСТЕ', words: ['МЫ', 'ИГРАЕМ', 'ВМЕСТЕ'] },
        ]
      },
      {
        title: 'ЗИМНИЙ ДЕНЬ',
        image: '❄️',
        sentences: [
          { text: 'ЗИМОЙ ИДЁТ СНЕГ', words: ['ЗИМОЙ', 'ИДЁТ', 'СНЕГ'] },
          { text: 'ДЕТИ ЛЕПЯТ СНЕГОВИКА', words: ['ДЕТИ', 'ЛЕПЯТ', 'СНЕГОВИКА'] },
          { text: 'СНЕГОВИК УЛЫБАЕТСЯ', words: ['СНЕГОВИК', 'УЛЫБАЕТСЯ'] },
        ]
      },
      {
        title: 'ПТИЦЫ',
        image: '🐦',
        sentences: [
          { text: 'ПТИЦЫ ЛЕТАЮТ В НЕБЕ', words: ['ПТИЦЫ', 'ЛЕТАЮТ', 'В', 'НЕБЕ'] },
          { text: 'ОНИ ПОЮТ ПЕСНИ', words: ['ОНИ', 'ПОЮТ', 'ПЕСНИ'] },
          { text: 'ВЕСНОЙ ПТИЦЫ СТРОЯТ ГНЁЗДА', words: ['ВЕСНОЙ', 'ПТИЦЫ', 'СТРОЯТ', 'ГНЁЗДА'] },
        ]
      },
      {
        title: 'МОЯ СЕМЬЯ',
        image: '👨‍👩‍👧‍👦',
        sentences: [
          { text: 'У МЕНЯ БОЛЬШАЯ СЕМЬЯ', words: ['У', 'МЕНЯ', 'БОЛЬШАЯ', 'СЕМЬЯ'] },
          { text: 'МАМА ПАПА И БРАТИК', words: ['МАМА', 'ПАПА', 'И', 'БРАТИК'] },
          { text: 'МЫ ЛЮБИМ ДРУГ ДРУГА', words: ['МЫ', 'ЛЮБИМ', 'ДРУГ', 'ДРУГА'] },
        ]
      },
      {
        title: 'РАДУГА',
        image: '🌈',
        sentences: [
          { text: 'ПОСЛЕ ДОЖДЯ ВЫШЛА РАДУГА', words: ['ПОСЛЕ', 'ДОЖДЯ', 'ВЫШЛА', 'РАДУГА'] },
          { text: 'ОНА БЫЛА ЯРКАЯ', words: ['ОНА', 'БЫЛА', 'ЯРКАЯ'] },
          { text: 'Я СЧИТАЛ ВСЕ ЦВЕТА', words: ['Я', 'СЧИТАЛ', 'ВСЕ', 'ЦВЕТА'] },
        ]
      },
      {
        title: 'ПОХОД В ПАРК',
        image: '🏞️',
        sentences: [
          { text: 'МЫ ПОШЛИ В ПАРК', words: ['МЫ', 'ПОШЛИ', 'В', 'ПАРК'] },
          { text: 'ТАМ МНОГО ДЕРЕВЬЕВ', words: ['ТАМ', 'МНОГО', 'ДЕРЕВЬЕВ'] },
          { text: 'Я КАТАЛСЯ НА КАЧЕЛЯХ', words: ['Я', 'КАТАЛСЯ', 'НА', 'КАЧЕЛЯХ'] },
        ]
      },
      {
        title: 'КНИГА',
        image: '📚',
        sentences: [
          { text: 'Я ЛЮБЛЮ ЧИТАТЬ КНИГИ', words: ['Я', 'ЛЮБЛЮ', 'ЧИТАТЬ', 'КНИГИ'] },
          { text: 'В КНИГАХ МНОГО ИСТОРИЙ', words: ['В', 'КНИГАХ', 'МНОГО', 'ИСТОРИЙ'] },
          { text: 'КНИГИ УЧАТ НАС', words: ['КНИГИ', 'УЧАТ', 'НАС'] },
        ]
      },
      {
        title: 'КОСМОС',
        image: '🚀',
        sentences: [
          { text: 'РАКЕТА ЛЕТИТ В КОСМОС', words: ['РАКЕТА', 'ЛЕТИТ', 'В', 'КОСМОС'] },
          { text: 'ТАМ МНОГО ЗВЁЗД', words: ['ТАМ', 'МНОГО', 'ЗВЁЗД'] },
          { text: 'КОСМОНАВТ СМОТРИТ НА ЗЕМЛЮ', words: ['КОСМОНАВТ', 'СМОТРИТ', 'НА', 'ЗЕМЛЮ'] },
        ]
      },
      {
        title: 'ОГОРОД',
        image: '🌱',
        sentences: [
          { text: 'У БАБУШКИ ЕСТЬ ОГОРОД', words: ['У', 'БАБУШКИ', 'ЕСТЬ', 'ОГОРОД'] },
          { text: 'ТАМ РАСТУТ ОВОЩИ', words: ['ТАМ', 'РАСТУТ', 'ОВОЩИ'] },
          { text: 'Я ПОМОГАЮ БАБУШКЕ', words: ['Я', 'ПОМОГАЮ', 'БАБУШКЕ'] },
        ]
      },
      {
        title: 'ПРАЗДНИК',
        image: '🎉',
        sentences: [
          { text: 'СЕГОДНЯ МОЙ ДЕНЬ РОЖДЕНИЯ', words: ['СЕГОДНЯ', 'МОЙ', 'ДЕНЬ', 'РОЖДЕНИЯ'] },
          { text: 'ПРИШЛИ ВСЕ ДРУЗЬЯ', words: ['ПРИШЛИ', 'ВСЕ', 'ДРУЗЬЯ'] },
          { text: 'МЫ ЕЛИ ТОРТ', words: ['МЫ', 'ЕЛИ', 'ТОРТ'] },
        ]
      },
      {
        title: 'ВОЛШЕБНИК',
        image: '🧙',
        sentences: [
          { text: 'ЖИЛ БЫЛ ВОЛШЕБНИК', words: ['ЖИЛ', 'БЫЛ', 'ВОЛШЕБНИК'] },
          { text: 'ОН ТВОРИЛ ЧУДЕСА', words: ['ОН', 'ТВОРИЛ', 'ЧУДЕСА'] },
          { text: 'ВСЕМ ПОМОГАЛ', words: ['ВСЕМ', 'ПОМОГАЛ'] },
        ]
      },
      {
        title: 'ДЕЛЬФИНЫ',
        image: '🐬',
        sentences: [
          { text: 'ДЕЛЬФИНЫ ЖИВУТ В МОРЕ', words: ['ДЕЛЬФИНЫ', 'ЖИВУТ', 'В', 'МОРЕ'] },
          { text: 'ОНИ УМНЫЕ И ДОБРЫЕ', words: ['ОНИ', 'УМНЫЕ', 'И', 'ДОБРЫЕ'] },
          { text: 'ДЕЛЬФИНЫ ПРЫГАЮТ ИЗ ВОДЫ', words: ['ДЕЛЬФИНЫ', 'ПРЫГАЮТ', 'ИЗ', 'ВОДЫ'] },
        ]
      },
      {
        title: 'ОСЕНЬ',
        image: '🍂',
        sentences: [
          { text: 'ОСЕНЬЮ ЛИСТЬЯ ЖЕЛТЕЮТ', words: ['ОСЕНЬЮ', 'ЛИСТЬЯ', 'ЖЕЛТЕЮТ'] },
          { text: 'ОНИ ПАДАЮТ НА ЗЕМЛЮ', words: ['ОНИ', 'ПАДАЮТ', 'НА', 'ЗЕМЛЮ'] },
          { text: 'КРАСИВО В ЛЕСУ', words: ['КРАСИВО', 'В', 'ЛЕСУ'] },
        ]
      },
      {
        title: 'МАШИНА',
        image: '🚗',
        sentences: [
          { text: 'У ПАПЫ НОВАЯ МАШИНА', words: ['У', 'ПАПЫ', 'НОВАЯ', 'МАШИНА'] },
          { text: 'ОНА СИНЕГО ЦВЕТА', words: ['ОНА', 'СИНЕГО', 'ЦВЕТА'] },
          { text: 'МЫ ЕДЕМ НА ДАЧУ', words: ['МЫ', 'ЕДЕМ', 'НА', 'ДАЧУ'] },
        ]
      },
      {
        title: 'ДРУЗЬЯ',
        image: '👫',
        sentences: [
          { text: 'У МЕНЯ МНОГО ДРУЗЕЙ', words: ['У', 'МЕНЯ', 'МНОГО', 'ДРУЗЕЙ'] },
          { text: 'МЫ ИГРАЕМ ВМЕСТЕ', words: ['МЫ', 'ИГРАЕМ', 'ВМЕСТЕ'] },
          { text: 'ДРУЖБА ОЧЕНЬ ВАЖНА', words: ['ДРУЖБА', 'ОЧЕНЬ', 'ВАЖНА'] },
        ]
      },
      {
        title: 'ЗВЁЗДНОЕ НЕБО',
        image: '⭐',
        sentences: [
          { text: 'НОЧЬЮ НЕБО ПОЛНО ЗВЁЗД', words: ['НОЧЬЮ', 'НЕБО', 'ПОЛНО', 'ЗВЁЗД'] },
          { text: 'ОНИ ЯРКО СВЕТЯТ', words: ['ОНИ', 'ЯРКО', 'СВЕТЯТ'] },
          { text: 'Я ЗАГАДАЛ ЖЕЛАНИЕ', words: ['Я', 'ЗАГАДАЛ', 'ЖЕЛАНИЕ'] },
        ]
      }
    ]
  }
};

// Генерация складов для всех согласных
const ALL_CONSONANTS = ['М', 'Н', 'Л', 'Р', 'Й', 'С', 'З', 'Ш', 'Ж', 'Ч', 'Щ', 'Ц', 'Ф', 'Х', 'П', 'Т', 'К', 'Б', 'В', 'Г', 'Д'];
const ALL_VOWELS_HARD = ['А', 'О', 'У', 'Ы', 'Э'];
const ALL_VOWELS_SOFT = ['Я', 'Ё', 'Ю', 'И', 'Е'];

const SYLLABLES = {};
ALL_CONSONANTS.forEach(c => {
  SYLLABLES[c] = {
    hard: ALL_VOWELS_HARD.map(v => c + v),
    soft: ALL_VOWELS_SOFT.map(v => c + v),
  };
});

// Обратная совместимость
const VOWELS_HARD = ALL_VOWELS_HARD;
const VOWELS_SOFT = ALL_VOWELS_SOFT;
const CONSONANTS = ALL_CONSONANTS;

const CHARACTERS = [
  { id: 'fox', name: 'Лисёнок', emoji: '🦊', color: '#FF9F43' },
  { id: 'bunny', name: 'Зайка', emoji: '🐰', color: '#A8E6CF' },
  { id: 'bear', name: 'Мишка', emoji: '🐻', color: '#FFEAA7' },
];

// Система эволюции персонажа
const EVOLUTION_LEVELS = [
  {
    level: 1,
    name: 'Малыш',
    stars: 0,
    emoji: { fox: '🦊', bunny: '🐰', bear: '🐻' },
    title: 'Начинающий',
    bonus: 'Изучай буквы!',
    color: '#94a3b8'
  },
  {
    level: 2,
    name: 'Ученик',
    stars: 20,
    emoji: { fox: '🦊✨', bunny: '🐰✨', bear: '🐻✨' },
    title: 'Знаток букв',
    bonus: '+5% звёзд за задания',
    color: '#60a5fa'
  },
  {
    level: 3,
    name: 'Мастер',
    stars: 50,
    emoji: { fox: '🦊🌟', bunny: '🐰🌟', bear: '🐻🌟' },
    title: 'Мастер слов',
    bonus: '+10% звёзд за задания',
    color: '#a78bfa'
  },
  {
    level: 4,
    name: 'Эксперт',
    stars: 100,
    emoji: { fox: '🦊💫', bunny: '🐰💫', bear: '🐻💫' },
    title: 'Читатель',
    bonus: '+15% звёзд за задания',
    color: '#f472b6'
  },
  {
    level: 5,
    name: 'Чемпион',
    stars: 200,
    emoji: { fox: '🦊👑', bunny: '🐰👑', bear: '🐻👑' },
    title: 'Книжный гений',
    bonus: '+20% звёзд за задания',
    color: '#fbbf24'
  }
];

// Получить текущий уровень эволюции по количеству звёзд
const getEvolutionLevel = (stars) => {
  for (let i = EVOLUTION_LEVELS.length - 1; i >= 0; i--) {
    if (stars >= EVOLUTION_LEVELS[i].stars) {
      return EVOLUTION_LEVELS[i];
    }
  }
  return EVOLUTION_LEVELS[0];
};

// Получить следующий уровень эволюции
const getNextEvolution = (currentLevel) => {
  const currentIdx = EVOLUTION_LEVELS.findIndex(l => l.level === currentLevel.level);
  if (currentIdx < EVOLUTION_LEVELS.length - 1) {
    return EVOLUTION_LEVELS[currentIdx + 1];
  }
  return null;
};

const CARS = [
  { id: 'car1', name: 'Красная', emoji: '🚗', price: 10, color: '#e74c3c', game: 'parking', gameName: 'Парковка' },
  { id: 'car2', name: 'Синяя', emoji: '🚙', price: 15, color: '#3498db', game: 'fuel', gameName: 'Заправка' },
  { id: 'car3', name: 'Такси', emoji: '🚕', price: 20, color: '#f1c40f', game: 'taxi', gameName: 'Пассажиры' },
  { id: 'car4', name: 'Полиция', emoji: '🚓', price: 30, color: '#2c3e50', game: 'police', gameName: 'Поймай букву!' },
  { id: 'car5', name: 'Скорая', emoji: '🚑', price: 35, color: '#ecf0f1', game: 'ambulance', gameName: 'Вылечи слово' },
  { id: 'car6', name: 'Пожарная', emoji: '🚒', price: 40, color: '#c0392b', game: 'fire', gameName: 'Потуши огонь' },
  { id: 'car7', name: 'Грузовик', emoji: '🚚', price: 50, color: '#95a5a6', game: 'delivery', gameName: 'Доставка' },
  { id: 'car8', name: 'Гонка', emoji: '🏎️', price: 100, color: '#9b59b6', game: 'race', gameName: 'Буквогонка' },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#74b9ff', '#fd79a8'];

// ============ СИСТЕМА ДОСТИЖЕНИЙ ============

const ACHIEVEMENTS = {
  firstSteps: {
    id: 'firstSteps',
    name: 'Первые шаги',
    emoji: '👣',
    description: 'Выучи первую букву',
    color: '#4ECDC4',
    check: (profile) => {
      const totalLetters = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
        return sum + Object.keys(island.letters || {}).filter(l => island.letters[l]).length;
      }, 0);
      return totalLetters >= 1;
    }
  },
  masterOfVowels: {
    id: 'masterOfVowels',
    name: 'Мастер гласных',
    emoji: '🎤',
    description: 'Выучи все гласные буквы',
    color: '#FF6B9D',
    check: (profile) => {
      const island1 = profile.progress.islands?.[1];
      const island2 = profile.progress.islands?.[2];
      const island5 = profile.progress.islands?.[5];
      if (!island1 || !island2 || !island5) return false;

      const vowels1 = ISLANDS[1].vowels.every(v => island1.letters[v]);
      const vowels2 = ISLANDS[2].vowels.every(v => island2.letters[v]);
      const vowels5 = ISLANDS[5].vowels.every(v => island5.letters[v]);
      return vowels1 && vowels2 && vowels5;
    }
  },
  speedReader: {
    id: 'speedReader',
    name: 'Скорочтец',
    emoji: '⚡',
    description: 'Прочитай 20 слов',
    color: '#FFE66D',
    check: (profile) => {
      const totalWords = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
        return sum + (island.words || []).length;
      }, 0);
      return totalWords >= 20;
    }
  },
  bookworm: {
    id: 'bookworm',
    name: 'Книжный червь',
    emoji: '📚',
    description: 'Прочитай все истории',
    color: '#A8E6CF',
    check: (profile) => {
      const island5 = profile.progress.islands?.[5];
      if (!island5) return false;
      const totalStories = ISLANDS[5].stories?.length || 0;
      return (island5.stories || []).length >= totalStories;
    }
  },
  carCollector: {
    id: 'carCollector',
    name: 'Коллекционер',
    emoji: '🏆',
    description: 'Собери все 8 машинок',
    color: '#9b59b6',
    check: (profile) => (profile.cars || []).length >= 8
  },
  starGatherer: {
    id: 'starGatherer',
    name: 'Звездочёт',
    emoji: '⭐',
    description: 'Собери 50 звёзд',
    color: '#f1c40f',
    check: (profile) => (profile.stars || 0) >= 50
  },
  perfectStudent: {
    id: 'perfectStudent',
    name: 'Отличник',
    emoji: '🎓',
    description: 'Выучи все буквы всех островов',
    color: '#3498db',
    check: (profile) => {
      return Object.keys(ISLANDS).every(islandNum => {
        const island = ISLANDS[islandNum];
        const progress = profile.progress.islands?.[islandNum];
        if (!progress) return false;

        const allLetters = [...island.vowels, ...island.consonants];
        return allLetters.every(letter => progress.letters[letter]);
      });
    }
  },
  islandExplorer: {
    id: 'islandExplorer',
    name: 'Исследователь',
    emoji: '🗺️',
    description: 'Открой все острова',
    color: '#95E1D3',
    check: (profile) => {
      return Object.keys(ISLANDS).every(islandNum => {
        const progress = profile.progress.islands?.[islandNum];
        return progress?.unlocked;
      });
    }
  },
  wordMaster: {
    id: 'wordMaster',
    name: 'Мастер слов',
    emoji: '📖',
    description: 'Прочитай 50 слов',
    color: '#e74c3c',
    check: (profile) => {
      const totalWords = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
        return sum + (island.words || []).length;
      }, 0);
      return totalWords >= 50;
    }
  },
  persistent: {
    id: 'persistent',
    name: 'Упорный',
    emoji: '💪',
    description: 'Выучи 10 букв с повторениями',
    color: '#16a085',
    check: (profile) => {
      let count = 0;
      Object.values(profile.progress.islands || {}).forEach(island => {
        if (island.reviewData) {
          Object.values(island.reviewData).forEach(data => {
            if (data.masteryLevel >= 2) count++;
          });
        }
      });
      return count >= 10;
    }
  }
};

// Проверить и вернуть полученные достижения
const checkAchievements = (profile) => {
  const earned = [];
  const unearned = [];

  Object.values(ACHIEVEMENTS).forEach(achievement => {
    const isEarned = achievement.check(profile);
    if (isEarned) {
      earned.push(achievement);
    } else {
      unearned.push(achievement);
    }
  });

  return { earned, unearned, total: Object.keys(ACHIEVEMENTS).length };
};

// ============ АДАПТИВНАЯ СЛОЖНОСТЬ ============

const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Легко',
    emoji: '🌱',
    color: '#A8E6CF',
    timeLimit: 40, // секунд на задание
    hintsEnabled: true,
    targetsPerGame: 5,
    mistakesAllowed: 4,
    description: 'Больше времени, подсказки включены'
  },
  medium: {
    name: 'Средне',
    emoji: '🌿',
    color: '#FFD93D',
    timeLimit: 25,
    hintsEnabled: true,
    targetsPerGame: 7,
    mistakesAllowed: 2,
    description: 'Обычная сложность'
  },
  hard: {
    name: 'Сложно',
    emoji: '🌳',
    color: '#FF6B6B',
    timeLimit: 20,
    hintsEnabled: false,
    targetsPerGame: 10,
    mistakesAllowed: 1,
    description: 'Мало времени, без подсказок'
  }
};

// Вычислить процент успешности за последние занятия
const calculateSuccessRate = (profile) => {
  const recentStats = Object.entries(profile.stats || {})
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 5); // последние 5 дней

  if (recentStats.length === 0) return 0.7; // средний по умолчанию

  let totalTasks = 0;
  let totalStars = 0;

  recentStats.forEach(([_, data]) => {
    totalTasks += data.tasks || 0;
    totalStars += data.stars || 0;
  });

  if (totalTasks === 0) return 0.7;

  // Средняя успешность: примерно 3 звезды за задание - это хорошо
  const avgStarsPerTask = totalStars / totalTasks;
  return Math.min(avgStarsPerTask / 3, 1);
};

// Автоматически определить подходящую сложность
const getDifficultyForProfile = (profile) => {
  if (profile.difficultyLevel && profile.difficultyLevel !== 'auto') {
    return DIFFICULTY_LEVELS[profile.difficultyLevel];
  }

  const successRate = calculateSuccessRate(profile);

  if (successRate >= 0.85) return DIFFICULTY_LEVELS.hard;
  if (successRate >= 0.65) return DIFFICULTY_LEVELS.medium;
  return DIFFICULTY_LEVELS.easy;
};

// ============ ЕЖЕДНЕВНЫЕ ЗАДАНИЯ ============

const DAILY_CHALLENGES = [
  {
    id: 'practice_letters',
    name: 'Буквенная практика',
    emoji: '📝',
    description: 'Выучи 3 буквы',
    target: 3,
    reward: 5,
    type: 'letters',
    check: (profile, today) => {
      const todayStats = profile.stats?.[today];
      // Подсчитываем буквы, выученные сегодня
      let count = 0;
      Object.values(profile.progress.islands || {}).forEach(island => {
        if (island.reviewData) {
          Object.values(island.reviewData).forEach(data => {
            if (data.lastPracticed === today) count++;
          });
        }
      });
      return { current: Math.min(count, 3), target: 3, completed: count >= 3 };
    }
  },
  {
    id: 'read_words',
    name: 'Читатель дня',
    emoji: '📖',
    description: 'Прочитай 5 слов',
    target: 5,
    reward: 5,
    type: 'words',
    check: (profile, today) => {
      // Подсчитываем слова, прочитанные сегодня через reviewData
      let count = 0;
      Object.values(profile.progress.islands || {}).forEach(island => {
        (island.words || []).forEach(word => {
          // Считаем слова добавленные сегодня
          if (island.wordsCompletedToday?.[today]?.includes(word)) {
            count++;
          }
        });
      });
      const todayWords = profile.dailyProgress?.[today]?.wordsRead || 0;
      count = Math.max(count, todayWords);
      return { current: Math.min(count, 5), target: 5, completed: count >= 5 };
    }
  },
  {
    id: 'play_car_game',
    name: 'Водитель',
    emoji: '🚗',
    description: 'Сыграй в мини-игру с машинкой',
    target: 1,
    reward: 3,
    type: 'carGame',
    check: (profile, today) => {
      const played = profile.dailyProgress?.[today]?.carGamesPlayed || 0;
      return { current: Math.min(played, 1), target: 1, completed: played >= 1 };
    }
  },
  {
    id: 'earn_stars',
    name: 'Звёздный путь',
    emoji: '⭐',
    description: 'Заработай 15 звёзд',
    target: 15,
    reward: 5,
    type: 'stars',
    check: (profile, today) => {
      const starsToday = profile.stats?.[today]?.stars || 0;
      return { current: Math.min(starsToday, 15), target: 15, completed: starsToday >= 15 };
    }
  }
];

// Получить ежедневные задания с прогрессом
const getDailyChallenges = (profile) => {
  const today = getToday();
  return DAILY_CHALLENGES.map(challenge => {
    const progress = challenge.check(profile, today);
    return {
      ...challenge,
      ...progress
    };
  });
};

// Проверить и выдать награды за выполненные задания
const checkDailyChallengesRewards = (profile) => {
  const today = getToday();
  const completed = profile.dailyChallengesCompleted || {};
  const todayCompleted = completed[today] || [];

  const challenges = getDailyChallenges(profile);
  let newStars = 0;

  challenges.forEach(challenge => {
    if (challenge.completed && !todayCompleted.includes(challenge.id)) {
      newStars += challenge.reward;
      todayCompleted.push(challenge.id);
    }
  });

  if (newStars > 0) {
    return {
      stars: newStars,
      completed: { ...completed, [today]: todayCompleted }
    };
  }

  return null;
};

// Система серий (streak)
const getStreak = (profile) => {
  const stats = profile.stats || {};
  const dates = Object.keys(stats).sort().reverse();

  if (dates.length === 0) return { current: 0, longest: 0, lastDate: null };

  let current = 0;
  let longest = 0;
  let tempStreak = 0;
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Проверяем текущую серию
  if (dates[0] === today || dates[0] === yesterday) {
    let checkDate = new Date(dates[0]);
    current = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i]);
      const daysDiff = Math.floor((checkDate - prevDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        current++;
        checkDate = prevDate;
      } else {
        break;
      }
    }
  }

  // Вычисляем самую длинную серию
  tempStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const currDate = new Date(dates[i - 1]);
    const prevDate = new Date(dates[i]);
    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, current, tempStreak);

  return {
    current,
    longest,
    lastDate: dates[0]
  };
};

const pronounce = (text) => {
  // Произношение чистых звуков для согласных (не "эс", а "с")
  const soundMap = {
    'М': 'мммм', 'Л': 'лллл', 'Н': 'нннн', 'Р': 'рррр',
    'С': 'сссс', 'Ш': 'шшшш', 'Ж': 'жжжж', 'З': 'зззз', 'Ф': 'фффф', 'В': 'вввв', 'Щ': 'щщщ',
    'П': 'п', 'Т': 'т', 'К': 'к', 'Б': 'б', 'Д': 'д', 'Г': 'г',
    'Х': 'х', 'Ц': 'ц', 'Ч': 'ч', 'Й': 'й'
  };
  if (text.length === 1 && soundMap[text]) return soundMap[text];
  return text.toLowerCase();
};

const useSpeak = () => useCallback((text, rate = 0.75) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(pronounce(text));
    u.lang = 'ru-RU';
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }
}, []);

// ============ МЕТОД ЗАЙЦЕВА — ЦВЕТНЫЕ СКЛАДЫ ============
// Золотые кубики — гласные, деревянные (коричневые) — звонкие, железные (серые) — глухие.
const VOICED_CONSONANTS = new Set(['Б','В','Г','Д','Ж','З','Й','Л','М','Н','Р']);
const VOICELESS_CONSONANTS = new Set(['К','П','С','Т','Ф','Х','Ц','Ч','Ш','Щ']);
const ALL_VOWELS_SET = new Set([...ALL_VOWELS_HARD, ...ALL_VOWELS_SOFT]);

// Возвращает Tailwind-классы для склада (цвет фона/текста по типу согласной).
// Гласная — золотой градиент; склад со звонкой — деревянный; с глухой — железный.
const syllableClass = (syl) => {
  if (!syl) return 'bg-white/50 text-gray-500';
  const s = String(syl).toUpperCase();
  // Одиночная гласная — золотой кубик
  if (s.length === 1 && ALL_VOWELS_SET.has(s)) {
    return 'bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900 shadow-lg';
  }
  // Ищем первую согласную в складе, по ней определяем тип кубика
  for (const ch of s) {
    if (VOICED_CONSONANTS.has(ch)) {
      return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg';
    }
    if (VOICELESS_CONSONANTS.has(ch)) {
      return 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-lg';
    }
  }
  // Если согласных нет (например, только гласные) — золотой
  return 'bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-900 shadow-lg';
};

const getToday = () => new Date().toISOString().split('T')[0];

// ============ SPACED REPETITION СИСТЕМА ============

// Интервалы повторения (в днях) для каждого уровня мастерства
const REVIEW_INTERVALS = [1, 3, 7, 14, 30]; // День 1, 3, 7, 14, 30

// Вычислить следующую дату повторения на основе уровня мастерства
const calculateNextReview = (masteryLevel) => {
  const interval = REVIEW_INTERVALS[Math.min(masteryLevel, REVIEW_INTERVALS.length - 1)];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate.toISOString().split('T')[0];
};

// Проверить нужно ли повторить букву сегодня
const needsReview = (reviewData) => {
  if (!reviewData || !reviewData.nextReview) return false;
  const today = getToday();
  return reviewData.nextReview <= today;
};

// Вычислить срочность повторения (0-100, где 100 = очень срочно)
const getReviewUrgency = (reviewData) => {
  if (!reviewData || !reviewData.nextReview) return 0;
  const today = new Date(getToday());
  const nextReview = new Date(reviewData.nextReview);
  const daysDiff = Math.floor((today - nextReview) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return 0; // Еще не время
  if (daysDiff === 0) return 50; // Сегодня
  if (daysDiff <= 2) return 75; // Просрочено на 1-2 дня
  return 100; // Просрочено больше 2 дней
};

// Получить визуальное состояние "цветочка" для буквы
const getFlowerState = (urgency) => {
  if (urgency === 0) return { emoji: '🌸', text: 'Отлично!', color: '#4ade80' };
  if (urgency <= 50) return { emoji: '🌼', text: 'Пора полить', color: '#fbbf24' };
  if (urgency <= 75) return { emoji: '🥀', text: 'Нужна вода!', color: '#fb923c' };
  return { emoji: '🍂', text: 'Срочно!', color: '#ef4444' };
};

const Confetti = ({ active }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} className="absolute w-3 h-3 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: '-20px', backgroundColor: COLORS[i % COLORS.length],
            animation: `fall ${1.5 + Math.random()}s ease-out ${Math.random() * 0.5}s forwards` }} />
      ))}
      <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>
    </div>
  );
};

// ============ МИНИ-ИГРЫ ДЛЯ МАШИНОК ============

const ALL_LETTERS = [...VOWELS_HARD, ...VOWELS_SOFT, ...CONSONANTS];
const SIMPLE_WORDS = [
  { word: 'ДОМ', image: '🏠' },
  { word: 'КОТ', image: '🐱' },
  { word: 'СОН', image: '😴' },
  { word: 'ЛУК', image: '🧅' },
  { word: 'МАК', image: '🌺' },
  { word: 'СОК', image: '🧃' },
  { word: 'РАК', image: '🦀' },
  { word: 'ЛЕС', image: '🌲' },
];

// 🚗 Игра 1: Парковка - паркуйся на правильную букву
const ParkingGame = ({ car, onComplete, onBack }) => {
  const [targetLetter, setTargetLetter] = useState('');
  const [options, setOptions] = useState([]);
  const [carPosition, setCarPosition] = useState(1);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    const others = ALL_LETTERS.filter(l => l !== letter).sort(() => Math.random() - 0.5).slice(0, 2);
    const opts = [letter, ...others].sort(() => Math.random() - 0.5);
    setTargetLetter(letter);
    setOptions(opts);
    setCarPosition(1);
    setTimeout(() => speak(letter), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handlePark = () => {
    if (busyRef.current) return;
    if (options[carPosition] === targetLetter) {
      busyRef.current = true;
      setShowResult('correct');
      setScore(s => s + 1);
      if (score + 1 >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(5), 1500);
      } else {
        setTimeout(() => { setShowResult(null); generateRound(); }, 800);
      }
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 to-slate-900 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">⭐ {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🅿️ Парковка</h2>
        <p className="text-white/70">Припаркуйся на букву:</p>
        <button onClick={() => speak(targetLetter)} className="text-4xl font-bold text-yellow-400 mt-2">{targetLetter}</button>
      </div>

      {/* Parking spots */}
      <div className="flex justify-center gap-2 mb-8">
        {options.map((letter, idx) => (
          <div
            key={idx}
            className={`w-20 h-24 rounded-xl border-4 border-dashed flex flex-col items-center justify-end pb-2 ${
              showResult === 'correct' && idx === carPosition ? 'border-green-400 bg-green-400/20' :
              showResult === 'wrong' && idx === carPosition ? 'border-red-400 bg-red-400/20' :
              'border-white/30'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2">{letter}</div>
            {idx === carPosition && (
              <div className="text-3xl" style={{ animation: 'bounce 0.5s ease-in-out infinite' }}>{car.emoji}</div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCarPosition(p => Math.max(0, p - 1))}
          className="w-16 h-16 bg-blue-500 rounded-full text-3xl text-white active:scale-90"
        >←</button>
        <button
          onClick={handlePark}
          className="w-20 h-16 bg-green-500 rounded-2xl text-xl font-bold text-white active:scale-90"
        >🅿️</button>
        <button
          onClick={() => setCarPosition(p => Math.min(options.length - 1, p + 1))}
          className="w-16 h-16 bg-blue-500 rounded-full text-3xl text-white active:scale-90"
        >→</button>
      </div>

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }`}</style>
    </div>
  );
};

// 🚙 Игра 2: Заправка - заправь машину правильной буквой
const FuelGame = ({ car, onComplete, onBack }) => {
  const [targetLetter, setTargetLetter] = useState('');
  const [options, setOptions] = useState([]);
  const [fuel, setFuel] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const maxFuel = 5;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    const others = ALL_LETTERS.filter(l => l !== letter).sort(() => Math.random() - 0.5).slice(0, 3);
    setTargetLetter(letter);
    setOptions([letter, ...others].sort(() => Math.random() - 0.5));
    setTimeout(() => speak(letter), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleFuel = (letter) => {
    if (busyRef.current) return;
    if (letter === targetLetter) {
      busyRef.current = true;
      setShowResult('correct');
      const newFuel = fuel + 1;
      setFuel(newFuel);
      if (newFuel >= maxFuel) {
        setShowConfetti(true);
        setTimeout(() => onComplete(5), 1500);
      } else {
        setTimeout(() => { setShowResult(null); generateRound(); }, 800);
      }
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">⛽ {fuel}/{maxFuel}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">⛽ Заправка</h2>
        <p className="text-white/70">Заправь буквой:</p>
        <button onClick={() => speak(targetLetter)} className="text-4xl font-bold text-yellow-400 mt-2">{targetLetter}</button>
      </div>

      {/* Fuel gauge */}
      <div className="bg-white/20 rounded-full h-8 mx-8 mb-6 overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${(fuel / maxFuel) * 100}%` }}
        />
      </div>

      {/* Fuel options */}
      <div className="grid grid-cols-2 gap-3 mx-4">
        {options.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => handleFuel(letter)}
            className={`py-6 rounded-2xl text-3xl font-bold transition-all active:scale-95 ${
              showResult === 'correct' && letter === targetLetter ? 'bg-green-400 text-white' :
              showResult === 'wrong' && letter === targetLetter ? 'bg-green-400 text-white' :
              showResult === 'wrong' && letter !== targetLetter ? 'bg-red-400/50 text-white' :
              'bg-white text-gray-800'
            }`}
          >
            ⛽ {letter}
          </button>
        ))}
      </div>
    </div>
  );
};

// 🚕 Игра 3: Такси - собери пассажиров-буквы в слово
const TaxiGame = ({ car, onComplete, onBack }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [collected, setCollected] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 3;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const wordObj = SIMPLE_WORDS[Math.floor(Math.random() * SIMPLE_WORDS.length)];
    const letters = wordObj.word.split('');
    const extras = ALL_LETTERS.filter(l => !letters.includes(l)).sort(() => Math.random() - 0.5).slice(0, 2);
    setCurrentWord(wordObj);
    setCollected([]);
    setPassengers([...letters, ...extras].sort(() => Math.random() - 0.5));
    setTimeout(() => speak(wordObj.word), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handlePickup = (letter, idx) => {
    if (busyRef.current) return;
    if (!currentWord) return;
    const nextLetter = currentWord.word[collected.length];

    if (letter === nextLetter) {
      const newCollected = [...collected, letter];
      setCollected(newCollected);
      setPassengers(p => p.filter((_, i) => i !== idx));
      speak(letter);

      if (newCollected.length === currentWord.word.length) {
        busyRef.current = true;
        setShowResult('correct');
        setScore(s => s + 1);
        if (score + 1 >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(8), 1500);
        } else {
          setTimeout(() => { setShowResult(null); generateRound(); }, 1000);
        }
      }
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 500);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-500 to-orange-600 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">🏆 {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🚕 Такси</h2>
        <p className="text-white/70">Собери слово:</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-4xl">{currentWord.image}</span>
          <button onClick={() => speak(currentWord.word)} className="text-2xl font-bold text-white bg-white/20 px-4 py-2 rounded-xl">
            {currentWord.word}
          </button>
        </div>
      </div>

      {/* Collected letters */}
      <div className="flex justify-center gap-2 mb-6">
        {currentWord.word.split('').map((letter, idx) => (
          <div
            key={idx}
            className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
              collected[idx] ? 'bg-green-400 text-white' : 'bg-white/30 text-white/50'
            }`}
          >
            {collected[idx] || '?'}
          </div>
        ))}
      </div>

      {/* Passenger stops */}
      <div className="grid grid-cols-3 gap-3">
        {passengers.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => handlePickup(letter, idx)}
            className="bg-white/90 py-4 rounded-2xl flex flex-col items-center active:scale-95"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-gray-800">{letter}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 🚓 Игра 4: Полиция - поймай убегающую букву
const PoliceGame = ({ car, onComplete, onBack }) => {
  const [targetLetter, setTargetLetter] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    setTargetLetter(letter);
    setPosition({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 40 });
    setTimeout(() => speak(letter), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(p => ({
        x: Math.max(10, Math.min(80, p.x + (Math.random() - 0.5) * 30)),
        y: Math.max(10, Math.min(60, p.y + (Math.random() - 0.5) * 20)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, [targetLetter]);

  const handleCatch = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setScore(s => {
      const newScore = s + 1;
      if (newScore >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(6), 1500);
      } else {
        generateRound();
      }
      return newScore;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-950 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">🚨 {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🚓 Поймай букву!</h2>
        <p className="text-white/70">Лови:</p>
        <button onClick={() => speak(targetLetter)} className="text-3xl font-bold text-red-400">{targetLetter}</button>
      </div>

      {/* Chase area */}
      <div className="relative bg-white/10 rounded-2xl h-64 overflow-hidden">
        <button
          onClick={handleCatch}
          className="absolute text-5xl transition-all duration-300 active:scale-75"
          style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl animate-pulse">
            {targetLetter}
          </div>
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl">🚓</div>
      </div>

      <p className="text-center text-white/60 mt-4">Нажми на букву чтобы поймать!</p>
    </div>
  );
};

// 🚑 Игра 5: Скорая - вылечи слово (найди пропущенную букву)
const AmbulanceGame = ({ car, onComplete, onBack }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [missingIdx, setMissingIdx] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const wordObj = SIMPLE_WORDS[Math.floor(Math.random() * SIMPLE_WORDS.length)];
    const idx = Math.floor(Math.random() * wordObj.word.length);
    const correctLetter = wordObj.word[idx];
    const others = ALL_LETTERS.filter(l => l !== correctLetter).sort(() => Math.random() - 0.5).slice(0, 2);
    setCurrentWord(wordObj);
    setMissingIdx(idx);
    setOptions([correctLetter, ...others].sort(() => Math.random() - 0.5));
    setTimeout(() => speak(wordObj.word), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleChoice = (letter) => {
    if (busyRef.current) return;
    if (!currentWord) return;
    if (letter === currentWord.word[missingIdx]) {
      busyRef.current = true;
      setShowResult('correct');
      setScore(s => {
        const newScore = s + 1;
        if (newScore >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(6), 1500);
        } else {
          setTimeout(() => { setShowResult(null); generateRound(); }, 800);
        }
        return newScore;
      });
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 500);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-400 to-red-600 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">💊 {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🚑 Вылечи слово!</h2>
        <p className="text-white/70">Какая буква пропала?</p>
        <span className="text-4xl">{currentWord.image}</span>
      </div>

      {/* Word with missing letter */}
      <div className="flex justify-center gap-2 mb-8">
        {currentWord.word.split('').map((letter, idx) => (
          <div
            key={idx}
            className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-bold ${
              idx === missingIdx
                ? 'bg-white/30 text-red-300 border-4 border-dashed border-white'
                : 'bg-white text-gray-800'
            }`}
          >
            {idx === missingIdx ? '?' : letter}
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="flex justify-center gap-4">
        {options.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(letter)}
            className={`w-16 h-16 rounded-2xl text-2xl font-bold active:scale-95 ${
              showResult === 'correct' && letter === currentWord.word[missingIdx] ? 'bg-green-400 text-white' :
              showResult === 'wrong' ? 'bg-white/50 text-gray-600' :
              'bg-white text-gray-800'
            }`}
          >
            💊{letter}
          </button>
        ))}
      </div>
    </div>
  );
};

// 🚒 Игра 6: Пожарная - туши огонь на правильных буквах
const FireGame = ({ car, onComplete, onBack }) => {
  const [targetLetter, setTargetLetter] = useState('');
  const [fires, setFires] = useState([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 8;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const letter = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    const fireLetters = [letter, letter, ...ALL_LETTERS.filter(l => l !== letter).sort(() => Math.random() - 0.5).slice(0, 4)];
    setTargetLetter(letter);
    setFires(fireLetters.sort(() => Math.random() - 0.5).map((l, i) => ({ id: i, letter: l, active: true })));
    setTimeout(() => speak(letter), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleExtinguish = (fire) => {
    if (busyRef.current) return;
    if (!fire.active) return;
    if (fire.letter === targetLetter) {
      setFires(f => f.map(ff => ff.id === fire.id ? { ...ff, active: false } : ff));
      setScore(s => {
        const newScore = s + 1;
        if (newScore >= targetScore) {
          busyRef.current = true;
          setShowConfetti(true);
          setTimeout(() => onComplete(8), 1500);
        }
        return newScore;
      });
      // Check if all target letters extinguished
      const remaining = fires.filter(f => f.active && f.letter === targetLetter && f.id !== fire.id);
      if (remaining.length === 0) {
        busyRef.current = true;
        setTimeout(generateRound, 500);
      }
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-700 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">🔥 {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🚒 Потуши огонь!</h2>
        <p className="text-white/70">Туши только букву:</p>
        <button onClick={() => speak(targetLetter)} className="text-4xl font-bold text-yellow-300">{targetLetter}</button>
      </div>

      {/* Fires */}
      <div className="grid grid-cols-3 gap-3">
        {fires.map(fire => (
          <button
            key={fire.id}
            onClick={() => handleExtinguish(fire)}
            className={`py-6 rounded-2xl text-3xl font-bold transition-all active:scale-95 ${
              fire.active ? 'bg-orange-400 animate-pulse' : 'bg-gray-600 opacity-50'
            }`}
            disabled={!fire.active}
          >
            {fire.active ? '🔥' : '💨'}{fire.letter}
          </button>
        ))}
      </div>
    </div>
  );
};

// 🚚 Игра 7: Грузовик - развези слоги по домам
const DeliveryGame = ({ car, onComplete, onBack }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [currentSyllable, setCurrentSyllable] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  const generateRound = useCallback(() => {
    busyRef.current = false;
    const consonant = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
    const vowel = VOWELS_HARD[Math.floor(Math.random() * VOWELS_HARD.length)];
    const syllable = consonant + vowel;
    const wrongSyllables = CONSONANTS.slice(0, 3).map(c => c + VOWELS_HARD[Math.floor(Math.random() * VOWELS_HARD.length)]).filter(s => s !== syllable);
    const houses = [syllable, ...wrongSyllables.slice(0, 2)].sort(() => Math.random() - 0.5);
    setCurrentSyllable(syllable);
    setDeliveries(houses.map((s, i) => ({ id: i, syllable: s })));
    setTimeout(() => speak(syllable), 300);
  }, [speak]);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleDeliver = (house) => {
    if (busyRef.current) return;
    if (house.syllable === currentSyllable) {
      busyRef.current = true;
      setShowResult('correct');
      setScore(s => {
        const newScore = s + 1;
        if (newScore >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(7), 1500);
        } else {
          setTimeout(() => { setShowResult(null); generateRound(); }, 800);
        }
        return newScore;
      });
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-500 to-gray-700 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="text-white font-bold">📦 {score}/{targetScore}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{car.emoji}</div>
        <h2 className="text-xl font-bold text-white">🚚 Доставка</h2>
        <p className="text-white/70">Доставь посылку в дом:</p>
        <button onClick={() => speak(currentSyllable)} className="text-4xl font-bold text-yellow-400 bg-amber-800 px-6 py-2 rounded-xl mt-2">
          📦 {currentSyllable}
        </button>
      </div>

      {/* Houses */}
      <div className="space-y-3">
        {deliveries.map(house => (
          <button
            key={house.id}
            onClick={() => handleDeliver(house)}
            className={`w-full py-4 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 active:scale-98 ${
              showResult === 'correct' && house.syllable === currentSyllable ? 'bg-green-400 text-white' :
              showResult === 'wrong' && house.syllable !== currentSyllable ? 'bg-red-400/30 text-white' :
              'bg-white text-gray-800'
            }`}
          >
            🏠 {house.syllable}
          </button>
        ))}
      </div>
    </div>
  );
};

// 🏎️ Игра 8: Гонка - собирай буквы на скорость
const RaceGame = ({ car, onComplete, onBack }) => {
  const [letters, setLetters] = useState([]);
  const [carPos, setCarPos] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();

  const spawnLetters = useCallback(() => {
    const correct = ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)];
    const lanes = [0, 1, 2].map(lane => ({
      id: Date.now() + lane,
      lane,
      letter: lane === Math.floor(Math.random() * 3) ? correct : ALL_LETTERS[Math.floor(Math.random() * ALL_LETTERS.length)],
      y: -10,
      isCorrect: false,
    }));
    lanes[Math.floor(Math.random() * 3)].isCorrect = true;
    lanes[Math.floor(Math.random() * 3)].letter = correct;
    setLetters(prev => [...prev, ...lanes.map(l => ({ ...l, isCorrect: l.letter === correct }))]);
    speak(correct);
  }, [speak]);

  useEffect(() => {
    if (gameOver) return;
    const spawn = setInterval(spawnLetters, 2000);
    return () => clearInterval(spawn);
  }, [spawnLetters, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const move = setInterval(() => {
      setLetters(prev => {
        const updated = prev.map(l => ({ ...l, y: l.y + 8 })).filter(l => l.y < 100);
        // Check collision
        updated.forEach(l => {
          if (l.y > 70 && l.y < 90 && l.lane === carPos) {
            if (l.isCorrect) {
              setScore(s => s + 1);
            }
          }
        });
        return updated.filter(l => l.y < 80 || l.lane !== carPos);
      });
    }, 100);
    return () => clearInterval(move);
  }, [carPos, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          if (score >= 5 && !busyRef.current) {
            busyRef.current = true;
            setShowConfetti(true);
            setTimeout(() => onComplete(Math.min(score, 10)), 1500);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, score, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 to-purple-900 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-2">
        <button onClick={onBack} className="text-2xl text-white">←</button>
        <div className="flex gap-4 text-white font-bold">
          <span>⭐ {score}</span>
          <span>⏱️ {timeLeft}</span>
        </div>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-white">🏎️ Буквогонка!</h2>
      </div>

      {/* Race track */}
      <div className="relative bg-gray-800 rounded-2xl h-80 overflow-hidden">
        {/* Lane dividers */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map(lane => (
            <div key={lane} className="flex-1 border-x border-dashed border-white/20" />
          ))}
        </div>

        {/* Letters */}
        {letters.map(l => (
          <div
            key={l.id}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
              l.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
            style={{ left: `${15 + l.lane * 33}%`, top: `${l.y}%` }}
          >
            {l.letter}
          </div>
        ))}

        {/* Car */}
        <div
          className="absolute bottom-4 text-5xl transition-all duration-150"
          style={{ left: `${10 + carPos * 33}%` }}
        >
          {car.emoji}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-8 mt-4">
        <button
          onClick={() => setCarPos(p => Math.max(0, p - 1))}
          className="w-20 h-16 bg-blue-500 rounded-2xl text-3xl text-white active:scale-90"
        >←</button>
        <button
          onClick={() => setCarPos(p => Math.min(2, p + 1))}
          className="w-20 h-16 bg-blue-500 rounded-2xl text-3xl text-white active:scale-90"
        >→</button>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">{score >= 5 ? '🏆' : '🏁'}</div>
            <div className="text-2xl font-bold mb-2">Финиш!</div>
            <div className="text-xl text-gray-600 mb-4">Собрано: ⭐ {score}</div>
            <button onClick={onBack} className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold">
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент выбора мини-игры
const CarGameRouter = ({ car, onComplete, onBack }) => {
  switch (car.game) {
    case 'parking': return <ParkingGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'fuel': return <FuelGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'taxi': return <TaxiGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'police': return <PoliceGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'ambulance': return <AmbulanceGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'fire': return <FireGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'delivery': return <DeliveryGame car={car} onComplete={onComplete} onBack={onBack} />;
    case 'race': return <RaceGame car={car} onComplete={onComplete} onBack={onBack} />;
    default: return null;
  }
};

// ============ КОНЕЦ МИНИ-ИГР ============

// ============ TRACING GAME (Обведение букв) ============

const TracingGame = ({ letter, onComplete, onBack }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const speak = useSpeak();

  useEffect(() => {
    speak(`Обведи букву ${letter}`);
  }, [letter, speak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Установить размер canvas
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Очистить canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Нарисовать букву серым цветом с пунктиром
    ctx.font = 'bold 200px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 8;
    ctx.setLineDash([15, 10]);
    ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);

    // Нарисовать пути пользователя
    paths.forEach(path => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });
  }, [letter, paths]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Поддержка touch и mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setPaths([...paths, [coords]]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    setPaths(prev => {
      const newPaths = [...prev];
      newPaths[newPaths.length - 1] = [...newPaths[newPaths.length - 1], coords];
      return newPaths;
    });
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    // Упрощенная проверка: если нарисовано достаточно, считаем успехом
    const totalPoints = paths.reduce((sum, path) => sum + path.length, 0);
    if (totalPoints > 30) {
      setScore(1);
      setShowSuccess(true);
      setTimeout(() => onComplete(3), 1500);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-2xl text-blue-800">←</button>
        <h2 className="text-xl font-bold text-blue-800">✍️ Обведи букву</h2>
        <button onClick={clearCanvas} className="text-2xl text-blue-800">🔄</button>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-2xl p-3 mb-4 text-center">
        <p className="text-blue-800 font-semibold">
          Обведи букву <span className="text-2xl font-bold">{letter}</span> пальцем
        </p>
      </div>

      {/* Canvas для рисования */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-4 w-full max-w-md">
          <canvas
            ref={canvasRef}
            className="w-full h-80 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-2xl font-bold text-green-600">Отлично!</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <div className="flex-1 bg-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-800 mb-1">Подсказка</p>
          <p className="text-sm text-blue-900">Веди пальцем по пунктиру</p>
        </div>
      </div>
    </div>
  );
};

// ============ КОНЕЦ TRACING GAME ============

// Экран профилей
const ProfileSelect = ({ profiles, onSelect, onCreate, onDelete }) => {
  const speak = useSpeak();
  useEffect(() => { speak('Выбери игрока'); }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4 flex flex-col">
      <h1 className="text-3xl font-bold text-white text-center mb-2">Читайка</h1>
      <p className="text-white/80 text-center mb-6">Выбери игрока</p>
      
      <div className="flex-1 overflow-auto">
        <div className="grid gap-3 mb-4">
          {profiles.map(p => (
            <div key={p.id} className="bg-white/20 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-4xl">{CHARACTERS.find(c => c.id === p.character)?.emoji || '👤'}</span>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{p.name}</p>
                <p className="text-white/60 text-sm">⭐ {p.stars || 0} звёзд</p>
              </div>
              <button onClick={() => onSelect(p)} className="bg-green-400 text-white px-4 py-2 rounded-xl font-bold">
                Играть
              </button>
              <button onClick={() => onDelete(p.id)} className="text-white/50 text-xl">✕</button>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={onCreate} className="bg-yellow-400 text-gray-800 py-4 rounded-2xl font-bold text-xl">
        + Новый игрок
      </button>
    </div>
  );
};

// Создание профиля
const CreateProfile = ({ onBack, onCreate }) => {
  const [step, setStep] = useState(0);
  const [character, setCharacter] = useState(null);
  const [name, setName] = useState('');
  const speak = useSpeak();

  useEffect(() => { speak(step === 0 ? 'Выбери друга' : 'Как тебя зовут'); }, [step, speak]);

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col items-center justify-center">
        <button onClick={onBack} className="absolute top-4 left-4 text-3xl text-white">←</button>
        <p className="text-xl text-white mb-6">Выбери друга</p>
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {CHARACTERS.map(c => (
            <button key={c.id} onClick={() => { setCharacter(c); speak(c.name); }}
              className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${character?.id === c.id ? 'scale-110 ring-4 ring-white' : ''}`}
              style={{ backgroundColor: c.color }}>
              <span className="text-4xl">{c.emoji}</span>
              <span className="text-xs font-bold">{c.name}</span>
            </button>
          ))}
        </div>
        {character && (
          <button onClick={() => setStep(1)} className="bg-white text-purple-600 text-xl font-bold py-3 px-10 rounded-full">
            Дальше →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col items-center justify-center">
      <button onClick={() => setStep(0)} className="absolute top-4 left-4 text-3xl text-white">←</button>
      <span className="text-6xl mb-4">{character.emoji}</span>
      <p className="text-xl text-white mb-4">Как тебя зовут?</p>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Имя"
        className="text-2xl text-center py-3 px-6 rounded-2xl bg-white/90 mb-6 w-56 outline-none" maxLength={12} />
      {name.length > 0 && (
        <button onClick={() => onCreate({ name, character: character.id })}
          className="bg-yellow-400 text-gray-800 text-xl font-bold py-3 px-10 rounded-full">
          Поехали! 🚀
        </button>
      )}
    </div>
  );
};

// Экран эволюции персонажа
const EvolutionScreen = ({ profile, onBack }) => {
  const char = CHARACTERS.find(c => c.id === profile.character);
  const currentEvolution = getEvolutionLevel(profile.stars || 0);
  const nextEvolution = getNextEvolution(currentEvolution);
  const speak = useSpeak();

  useEffect(() => {
    speak('Эволюция');
  }, [speak]);

  const progressToNext = nextEvolution
    ? ((profile.stars - currentEvolution.stars) / (nextEvolution.stars - currentEvolution.stars)) * 100
    : 100;

  return (
    <div className="min-h-screen p-4 flex flex-col" style={{ background: `linear-gradient(to bottom, ${currentEvolution.color}, ${currentEvolution.color}dd)` }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h1 className="text-2xl font-bold text-white">🌟 Эволюция</h1>
        <div className="w-8"></div>
      </div>

      {/* Текущий персонаж */}
      <div className="bg-white/90 backdrop-blur rounded-3xl p-6 mb-4 text-center">
        <div className="text-7xl mb-3">{currentEvolution.emoji[char.id]}</div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: currentEvolution.color }}>
          {currentEvolution.name}
        </h2>
        <p className="text-gray-600 mb-2">{currentEvolution.title}</p>
        <div className="bg-yellow-100 rounded-xl p-2 inline-block">
          <p className="text-sm font-semibold text-yellow-800">✨ {currentEvolution.bonus}</p>
        </div>
      </div>

      {/* Прогресс до следующего уровня */}
      {nextEvolution ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Следующий уровень:</p>
            <p className="text-sm font-bold" style={{ color: nextEvolution.color }}>
              {nextEvolution.name}
            </p>
          </div>

          <div className="bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${Math.min(progressToNext, 100)}%`,
                backgroundColor: nextEvolution.color
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>⭐ {profile.stars || 0}</span>
            <span>⭐ {nextEvolution.stars}</span>
          </div>

          <div className="text-center mt-3">
            <div className="text-4xl mb-2">{nextEvolution.emoji[char.id]}</div>
            <p className="text-xs text-gray-600">
              Осталось: <span className="font-bold">{nextEvolution.stars - (profile.stars || 0)} ⭐</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="text-xl font-bold text-yellow-600 mb-2">Максимальный уровень!</h3>
          <p className="text-gray-600">Ты достиг вершины эволюции! 🎉</p>
        </div>
      )}

      {/* Все уровни эволюции */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 flex-1 overflow-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📖 История эволюции</h3>
        <div className="space-y-2">
          {EVOLUTION_LEVELS.map((level, idx) => {
            const isUnlocked = (profile.stars || 0) >= level.stars;
            const isCurrent = level.level === currentEvolution.level;

            return (
              <div
                key={idx}
                className={`rounded-xl p-3 flex items-center gap-3 ${
                  isCurrent ? 'bg-yellow-100 border-2 border-yellow-400' :
                  isUnlocked ? 'bg-green-50' :
                  'bg-gray-100 opacity-60'
                }`}
              >
                <div className="text-3xl">
                  {isUnlocked ? level.emoji[char.id] : '🔒'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: isUnlocked ? level.color : '#9ca3af' }}>
                    {level.name}
                  </p>
                  <p className="text-xs text-gray-600">{level.title}</p>
                  {isUnlocked && (
                    <p className="text-xs text-gray-500 mt-1">✨ {level.bonus}</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {level.stars > 0 ? `${level.stars} ⭐` : 'Старт'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Магазин
const Shop = ({ stars, ownedCars, onBuy, onBack }) => {
  const speak = useSpeak();
  useEffect(() => { speak('Магазин машинок'); }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 to-orange-500 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">Магазин</h2>
        <div className="bg-white/30 rounded-full px-4 py-2">
          <span className="text-white font-bold">⭐ {stars}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {CARS.map(car => {
          const owned = ownedCars.includes(car.id);
          const canBuy = stars >= car.price && !owned;
          return (
            <button key={car.id} onClick={() => canBuy && onBuy(car)}
              disabled={owned || !canBuy}
              className={`p-4 rounded-2xl flex flex-col items-center transition-all ${
                owned ? 'bg-green-400' : canBuy ? 'bg-white hover:scale-105' : 'bg-white/50'
              }`}>
              <span className="text-5xl mb-2">{car.emoji}</span>
              <span className="font-bold text-gray-800">{car.name}</span>
              {owned ? (
                <span className="text-green-700 text-sm">✓ Куплено</span>
              ) : (
                <span className={`text-sm ${canBuy ? 'text-orange-500' : 'text-gray-400'}`}>⭐ {car.price}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Гараж с мини-играми
const Garage = ({ ownedCars, onBack, onPlayGame }) => {
  const speak = useSpeak();
  useEffect(() => { speak('Твой гараж'); }, [speak]);
  const cars = CARS.filter(c => ownedCars.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-600 to-slate-800 p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white ml-4">🚗 Мой гараж</h2>
      </div>

      <p className="text-white/60 text-center mb-4">Нажми на машинку чтобы играть!</p>

      {cars.length === 0 ? (
        <div className="text-center text-white/60 mt-20">
          <p className="text-6xl mb-4">🅿️</p>
          <p>Пока пусто. Купи машинки в магазине!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {cars.map(car => (
            <button
              key={car.id}
              onClick={() => onPlayGame(car)}
              className="bg-white/20 hover:bg-white/30 active:scale-95 rounded-2xl p-4 flex flex-col items-center transition-all"
            >
              <span className="text-5xl mb-2" style={{ animation: 'bounce 2s ease-in-out infinite' }}>{car.emoji}</span>
              <span className="text-white font-bold">{car.name}</span>
              <span className="text-yellow-400 text-sm mt-1">🎮 {car.gameName}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }`}</style>
    </div>
  );
};

// Статистика
const Stats = ({ stats, onBack }) => {
  const days = Object.entries(stats || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-500 to-purple-600 p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white ml-4">Статистика</h2>
      </div>
      
      {days.length === 0 ? (
        <p className="text-white/60 text-center mt-20">Пока нет данных. Начни учиться!</p>
      ) : (
        <div className="space-y-3">
          {days.map(([date, data]) => (
            <div key={date} className="bg-white/20 rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">{new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <div className="flex justify-between text-white">
                <span>📚 {data.tasks || 0} заданий</span>
                <span>⭐ +{data.stars || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Экран достижений
const AchievementsScreen = ({ profile, onBack }) => {
  const speak = useSpeak();
  const { earned, unearned, total } = checkAchievements(profile);

  useEffect(() => {
    speak('Достижения');
  }, [speak]);

  const progressPercent = Math.round((earned.length / total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500 to-orange-600 p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white ml-4">🏆 Достижения</h2>
      </div>

      {/* Прогресс */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-semibold">Прогресс</span>
          <span className="text-orange-600 font-bold">{earned.length}/{total}</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">{progressPercent}% выполнено</p>
      </div>

      {/* Полученные достижения */}
      {earned.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white font-bold mb-2">✨ Получено ({earned.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {earned.map(achievement => (
              <div
                key={achievement.id}
                className="bg-white/90 backdrop-blur rounded-2xl p-4 text-center relative overflow-hidden"
                style={{
                  boxShadow: `0 4px 15px ${achievement.color}40`,
                  border: `2px solid ${achievement.color}`
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ background: `linear-gradient(135deg, ${achievement.color}00 0%, ${achievement.color} 100%)` }}
                />
                <div className="relative z-10">
                  <div className="text-5xl mb-2">{achievement.emoji}</div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{achievement.name}</h4>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  <div className="mt-2 text-2xl">✅</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ещё не полученные */}
      {unearned.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-2">🔒 Еще не получено ({unearned.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {unearned.map(achievement => (
              <div
                key={achievement.id}
                className="bg-white/30 backdrop-blur rounded-2xl p-4 text-center border-2 border-white/50"
              >
                <div className="text-5xl mb-2 opacity-50">{achievement.emoji}</div>
                <h4 className="font-bold text-white text-sm mb-1">{achievement.name}</h4>
                <p className="text-xs text-white/70">{achievement.description}</p>
                <div className="mt-2 text-2xl">🔒</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Экран ежедневных заданий и серий
const DailyChallengesScreen = ({ profile, onBack, onUpdateProfile }) => {
  const speak = useSpeak();
  const today = new Date().toISOString().split('T')[0];
  const challenges = getDailyChallenges(profile);
  const streakData = getStreak(profile);
  const difficulty = getDifficultyForProfile(profile);

  useEffect(() => {
    speak('Ежедневные задания');
  }, [speak]);

  // Проверяем и награждаем за выполненные задания
  useEffect(() => {
    const rewards = checkDailyChallengesRewards(profile);
    if (rewards.totalStars > 0) {
      const newProfile = {
        ...profile,
        stars: (profile.stars || 0) + rewards.totalStars
      };
      onUpdateProfile(newProfile);
    }
  }, []);

  const allCompleted = challenges.every(c => c.currentProgress >= c.target);
  const completedCount = challenges.filter(c => c.currentProgress >= c.target).length;
  const totalRewards = challenges.reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">📅 Задания дня</h2>
        <div className="w-8"></div>
      </div>

      {/* Серия дней */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">🔥 Серия дней</h3>
            <p className="text-xs text-gray-600">Занимайся каждый день!</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">{streakData.current}</div>
            <div className="text-xs text-gray-600">дней</div>
          </div>
        </div>

        {streakData.longest > 0 && (
          <div className="bg-orange-50 rounded-xl p-2 text-center">
            <p className="text-xs text-orange-800">
              🏆 Лучшая серия: <span className="font-bold">{streakData.longest} дней</span>
            </p>
          </div>
        )}

        {/* Календарь последних 7 дней */}
        <div className="flex gap-1 mt-3 justify-center">
          {(() => {
            const days = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const hasActivity = profile.stats && profile.stats[dateStr];
              const isToday = dateStr === today;
              days.push(
                <div
                  key={dateStr}
                  className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center text-xs ${
                    hasActivity
                      ? 'bg-orange-400 text-white'
                      : isToday
                      ? 'bg-blue-200 text-blue-700 border-2 border-blue-400'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <div className="font-bold">{d.getDate()}</div>
                  <div className="text-[10px]">{hasActivity ? '✓' : isToday ? '•' : ''}</div>
                </div>
              );
            }
            return days;
          })()}
        </div>
      </div>

      {/* Уровень сложности */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">Текущая сложность:</p>
          <p className="font-bold text-gray-800">{difficulty.emoji} {difficulty.name}</p>
        </div>
        <div className="text-2xl">{difficulty.emoji}</div>
      </div>

      {/* Прогресс по заданиям */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-semibold">Прогресс за сегодня</span>
          <span className="text-purple-600 font-bold">{completedCount}/{challenges.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
            style={{ width: `${(completedCount / challenges.length) * 100}%` }}
          />
        </div>
        {allCompleted && (
          <div className="mt-2 text-center">
            <p className="text-sm font-bold text-green-600">🎉 Все задания выполнены!</p>
            <p className="text-xs text-gray-600">Получено: {totalRewards} ⭐</p>
          </div>
        )}
      </div>

      {/* Задания */}
      <div className="space-y-3">
        {challenges.map(challenge => {
          const completed = challenge.currentProgress >= challenge.target;
          const progressPercent = Math.min((challenge.currentProgress / challenge.target) * 100, 100);

          return (
            <div
              key={challenge.id}
              className={`backdrop-blur rounded-2xl p-4 ${
                completed ? 'bg-green-400/90' : 'bg-white/90'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{challenge.emoji}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{challenge.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>

                  {/* Прогресс-бар */}
                  <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        completed ? 'bg-green-600' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={completed ? 'text-green-800 font-bold' : 'text-gray-600'}>
                      {challenge.currentProgress} / {challenge.target}
                    </span>
                    <span className={completed ? 'text-green-800 font-bold' : 'text-orange-600'}>
                      {completed ? '✓ Готово' : `+${challenge.reward} ⭐`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Мотивационное сообщение */}
      {!allCompleted && (
        <div className="mt-4 bg-white/70 backdrop-blur rounded-xl p-3 text-center">
          <p className="text-sm text-gray-700">
            💪 Продолжай заниматься, чтобы получить все награды!
          </p>
        </div>
      )}
    </div>
  );
};

// Родительская панель
const ParentDashboard = ({ profile, onBack }) => {
  const speak = useSpeak();
  const [tab, setTab] = useState('overview'); // overview, islands, review, analytics

  useEffect(() => {
    speak('Панель родителя');
  }, [speak]);

  // Подсчет общей статистики
  const totalLetters = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
    return sum + Object.keys(island.letters || {}).filter(l => island.letters[l]).length;
  }, 0);

  const totalWords = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
    return sum + (island.words || []).length;
  }, 0);

  const totalStories = Object.values(profile.progress.islands || {}).reduce((sum, island) => {
    return sum + (island.stories || []).length;
  }, 0);

  // Подсчет букв для повторения
  const lettersNeedingReview = [];
  Object.keys(profile.progress.islands || {}).forEach(islandNum => {
    const islandProg = profile.progress.islands[islandNum];
    if (!islandProg.unlocked) return;

    const island = ISLANDS[islandNum];
    const allLetters = [...island.vowels, ...island.consonants];

    allLetters.forEach(letter => {
      const reviewData = islandProg.reviewData?.[letter];
      if (reviewData && needsReview(reviewData)) {
        lettersNeedingReview.push({ letter, islandNum, reviewData, urgency: getReviewUrgency(reviewData) });
      }
    });
  });

  // Статистика активности
  const stats = Object.entries(profile.stats || {}).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
  const totalStars = profile.stars || 0;
  const currentEvolution = getEvolutionLevel(totalStars);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h1 className="text-2xl font-bold text-white">👨‍👩‍👧 Для родителей</h1>
        <div className="w-8"></div>
      </div>

      {/* Информация о ребенке */}
      <div className="bg-white/90 backdrop-blur rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="text-5xl">{currentEvolution.emoji[profile.character]}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-sm text-gray-600">{currentEvolution.name} • {currentEvolution.title}</p>
            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⭐ {totalStars}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">📝 {totalLetters} букв</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">📖 {totalWords} слов</span>
            </div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setTab('overview')}
          className={`py-2 rounded-xl font-bold transition-all text-sm ${
            tab === 'overview' ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
          }`}
        >
          📊 Обзор
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`py-2 rounded-xl font-bold transition-all text-sm ${
            tab === 'analytics' ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
          }`}
        >
          📈 Аналитика
        </button>
        <button
          onClick={() => setTab('islands')}
          className={`py-2 rounded-xl font-bold transition-all text-sm ${
            tab === 'islands' ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
          }`}
        >
          🗺️ Острова
        </button>
        <button
          onClick={() => setTab('review')}
          className={`py-2 rounded-xl font-bold transition-all text-sm ${
            tab === 'review' ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
          }`}
        >
          🌸 Повторение
        </button>
      </div>

      {/* Контент табов */}
      <div className="space-y-4">
        {tab === 'overview' && (
          <>
            {/* Активность по дням */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📅 Активность за неделю</h3>
              {stats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет данных</p>
              ) : (
                <div className="space-y-2">
                  {stats.map(([date, data]) => (
                    <div key={date} className="flex items-center gap-3">
                      <div className="text-xs text-gray-600 w-20">
                        {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center px-2"
                          style={{ width: `${Math.min((data.tasks || 0) * 20, 100)}%` }}
                        >
                          <span className="text-xs text-white font-semibold">{data.tasks || 0} заданий</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-yellow-600">+{data.stars || 0} ⭐</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Рекомендации */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Рекомендации</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {lettersNeedingReview.length > 0 && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                    <p className="font-semibold text-orange-800">🌸 Повторение букв</p>
                    <p className="text-orange-700">{lettersNeedingReview.length} букв требуют повторения</p>
                  </div>
                )}
                {stats.length === 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="font-semibold text-blue-800">🎯 Начните занятия</p>
                    <p className="text-blue-700">Ежедневные занятия по 15-20 минут дают лучший результат</p>
                  </div>
                )}
                {totalStars < 20 && totalLetters < 5 && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                    <p className="font-semibold text-green-800">📚 Изучайте по порядку</p>
                    <p className="text-green-700">Начните с Острова Гласных - это основа чтения</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'islands' && (
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🗺️ Прогресс по островам</h3>
            <div className="space-y-3">
              {Object.entries(ISLANDS).map(([islandNum, island]) => {
                const num = parseInt(islandNum);
                const progress = profile.progress.islands?.[num];
                if (!progress?.unlocked) return null;

                const totalLetters = island.vowels.length + island.consonants.length;
                const completedLetters = Object.values(progress.letters || {}).filter(Boolean).length;
                const totalWords = island.words.length;
                const completedWords = (progress.words || []).length;
                const progressPercent = totalLetters > 0 ? Math.round((completedLetters / totalLetters) * 100) : 0;

                return (
                  <div key={num} className="border-l-4 pl-3 py-2" style={{ borderColor: island.color }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{island.emoji}</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{island.name}</p>
                        <p className="text-xs text-gray-600">{island.description}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: island.color }}>{progressPercent}%</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-600 mt-2">
                      <span>📝 {completedLetters}/{totalLetters} букв</span>
                      <span>📖 {completedWords}/{totalWords} слов</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%`, backgroundColor: island.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'review' && (
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🌸 Расписание повторений</h3>
            {lettersNeedingReview.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-2">🌺</div>
                <p className="text-gray-600">Все буквы в порядке!</p>
                <p className="text-sm text-gray-500 mt-1">Повторение не требуется</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lettersNeedingReview.sort((a, b) => b.urgency - a.urgency).map(({ letter, islandNum, reviewData, urgency }) => {
                  const island = ISLANDS[islandNum];
                  const flower = getFlowerState(urgency);
                  const daysSince = Math.floor((new Date() - new Date(reviewData.lastPracticed)) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={`${islandNum}-${letter}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-3xl">{flower.emoji}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-lg">{letter}</p>
                        <p className="text-xs text-gray-600">{island.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: flower.color }}>{flower.text}</p>
                        <p className="text-xs text-gray-500">{daysSince} дней назад</p>
                        <p className="text-xs text-gray-500">💪 {reviewData.masteryLevel}/4</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          <>
            {/* График прогресса за неделю */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">📈 График прогресса</h3>
              {stats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end gap-2 h-32">
                    {stats.reverse().map(([date, data], idx) => {
                      const maxStars = Math.max(...stats.map(([_, d]) => d.stars || 0), 10);
                      const height = ((data.stars || 0) / maxStars) * 100;
                      return (
                        <div key={date} className="flex-1 flex flex-col items-center gap-1">
                          <div className="text-xs font-bold text-orange-600">{data.stars || 0}</div>
                          <div
                            className="w-full bg-gradient-to-t from-orange-400 to-orange-600 rounded-t transition-all"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          <div className="text-[10px] text-gray-600 mt-1">
                            {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 text-sm justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-gray-700">Звезды</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Проблемные буквы */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">⚠️ Требуют внимания</h3>
              {(() => {
                const problemLetters = [];
                Object.keys(profile.progress.islands || {}).forEach(islandNum => {
                  const islandProg = profile.progress.islands[islandNum];
                  if (!islandProg.unlocked) return;

                  const island = ISLANDS[islandNum];
                  const allLetters = [...island.vowels, ...island.consonants];

                  allLetters.forEach(letter => {
                    const reviewData = islandProg.reviewData?.[letter];
                    if (reviewData && reviewData.masteryLevel < 3) {
                      problemLetters.push({
                        letter,
                        islandNum,
                        island: island.name,
                        masteryLevel: reviewData.masteryLevel,
                        attempts: reviewData.attempts || 0,
                        lastPracticed: reviewData.lastPracticed
                      });
                    }
                  });
                });

                problemLetters.sort((a, b) => a.masteryLevel - b.masteryLevel);

                if (problemLetters.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <div className="text-5xl mb-2">🎯</div>
                      <p className="text-gray-600">Все буквы освоены хорошо!</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {problemLetters.slice(0, 10).map(({ letter, island, masteryLevel, attempts }) => (
                      <div key={`${island}-${letter}`} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="text-3xl font-bold text-gray-800">{letter}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{island}</p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4].map(level => (
                              <div
                                key={level}
                                className={`h-2 w-8 rounded ${
                                  level <= masteryLevel ? 'bg-orange-500' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Уровень {masteryLevel}/4</p>
                          <p className="text-xs text-gray-500">{attempts} попыток</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Рекомендации на основе анализа */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Персональные рекомендации</h3>
              <div className="space-y-2">
                {(() => {
                  const recommendations = [];
                  const streakData = getStreak(profile);
                  const successRate = calculateSuccessRate(profile);
                  const challenges = getDailyChallenges(profile);
                  const completedChallenges = challenges.filter(c => c.currentProgress >= c.target).length;

                  // Рекомендация по стрику
                  if (streakData.current === 0 && stats.length > 0) {
                    recommendations.push({
                      emoji: '🔥',
                      title: 'Восстановите серию',
                      text: 'Начните заниматься сегодня, чтобы продолжить прогресс!',
                      color: 'orange'
                    });
                  } else if (streakData.current >= 7) {
                    recommendations.push({
                      emoji: '🎖️',
                      title: 'Отличная серия!',
                      text: `${streakData.current} дней подряд - продолжайте в том же духе!`,
                      color: 'green'
                    });
                  }

                  // Рекомендация по успеваемости
                  if (successRate < 0.5 && stats.length >= 3) {
                    recommendations.push({
                      emoji: '🎯',
                      title: 'Снизьте темп',
                      text: 'Повторяйте уже изученные буквы перед новыми. Качество важнее скорости!',
                      color: 'blue'
                    });
                  } else if (successRate >= 0.85 && stats.length >= 5) {
                    recommendations.push({
                      emoji: '🚀',
                      title: 'Готовы к сложному!',
                      text: 'Отличные результаты! Пора переходить к более сложным упражнениям.',
                      color: 'purple'
                    });
                  }

                  // Рекомендация по ежедневным заданиям
                  if (completedChallenges < challenges.length) {
                    recommendations.push({
                      emoji: '📅',
                      title: 'Ежедневные задания',
                      text: `Выполнено ${completedChallenges} из ${challenges.length} заданий на сегодня.`,
                      color: 'blue'
                    });
                  }

                  // Рекомендация по времени суток
                  const lastStats = stats[0];
                  if (lastStats) {
                    recommendations.push({
                      emoji: '⏰',
                      title: 'Лучшее время для занятий',
                      text: 'Утренние занятия (после завтрака) наиболее эффективны для детей.',
                      color: 'yellow'
                    });
                  }

                  const colorMap = {
                    orange: 'bg-orange-50 border-orange-400 text-orange-800',
                    green: 'bg-green-50 border-green-400 text-green-800',
                    blue: 'bg-blue-50 border-blue-400 text-blue-800',
                    purple: 'bg-purple-50 border-purple-400 text-purple-800',
                    yellow: 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  };

                  return recommendations.map((rec, idx) => (
                    <div key={idx} className={`border-l-4 p-3 rounded ${colorMap[rec.color]}`}>
                      <p className="font-semibold flex items-center gap-2">
                        <span>{rec.emoji}</span>
                        <span>{rec.title}</span>
                      </p>
                      <p className="text-sm mt-1">{rec.text}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Игры
const FindGame = ({ target, options, onComplete, onBack, title }) => {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [streak, setStreak] = useState(0);
  const [key, setKey] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shakeItem, setShakeItem] = useState(null);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  useEffect(() => { speak(target); }, [target, speak]);

  useEffect(() => {
    busyRef.current = false;
    const pool = options.filter(o => o !== target);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const wrong = shuffled.slice(0, Math.min(difficulty - 1, shuffled.length));
    const all = [target, ...wrong].sort(() => Math.random() - 0.5);
    setItems(all.map((v, i) => ({ id: `${key}-${i}`, value: v, x: 12 + (i % 3) * 30 + Math.random() * 10, y: 15 + Math.floor(i / 3) * 28 + Math.random() * 8 })));
  }, [target, options, difficulty, key]);

  const handleTap = (item) => {
    if (busyRef.current) return;
    speak(item.value);
    if (item.value === target) {
      busyRef.current = true;
      const ns = score + 1;
      setScore(ns);
      setStreak(streak + 1);
      setWrongAttempts(0);
      setShowHint(false);
      if (streak + 1 >= 3 && difficulty < 5) setDifficulty(d => d + 1);
      if (ns >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(3), 1500);
      } else {
        setTimeout(() => setKey(k => k + 1), 300);
      }
    } else {
      setStreak(0);
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);

      // Shake animation
      setShakeItem(item.id);
      setTimeout(() => setShakeItem(null), 500);

      // Show hint after 2-3 wrong attempts
      if (newWrongAttempts >= 2) {
        setShowHint(true);
        speak(`Попробуй эту букву: ${target}`);
      } else {
        speak('Попробуй ещё раз!');
      }

      if (difficulty > 2) setDifficulty(d => d - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 to-purple-600 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-3">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <div className="bg-white/30 rounded-full px-5 py-2">
          <span className="text-white">Найди: </span>
          <span className="text-2xl font-bold text-yellow-300">{target}</span>
        </div>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>
      {title && <p className="text-white/70 text-center text-sm mb-2">{title}</p>}
      <div className="relative h-72">
        {items.map(item => {
          const isTarget = item.value === target;
          const isShaking = shakeItem === item.id;
          const shouldHighlight = showHint && isTarget;

          return (
            <button
              key={item.id}
              onClick={() => handleTap(item)}
              className={`absolute w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg transition-all ${
                shouldHighlight ? 'bg-green-400 text-white animate-pulse ring-4 ring-green-300' :
                'bg-white hover:scale-110 active:scale-95'
              } ${isShaking ? 'animate-shake' : ''}`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.value}
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const SyllableTable = ({ consonant, onComplete, onBack }) => {
  const [tapped, setTapped] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const speak = useSpeak();
  const syllables = SYLLABLES[consonant];
  const all = [...syllables.hard, ...syllables.soft];

  useEffect(() => { speak(`Склады с ${consonant}`); }, [consonant, speak]);

  const handleTap = (syl) => {
    speak(syl, 0.6);
    if (!tapped.includes(syl)) {
      const nt = [...tapped, syl];
      setTapped(nt);
      if (nt.length >= all.length) {
        setShowConfetti(true);
        setTimeout(() => onComplete(2), 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 to-cyan-600 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-3">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <span className="text-white text-lg font-bold">Склады: {consonant}</span>
        <span className="text-white bg-white/30 rounded-full px-3 py-1 text-sm">{tapped.length}/{all.length}</span>
      </div>
      <p className="text-white/70 text-center text-sm mb-3">Нажимай и читай!</p>
      <div className="bg-white/20 rounded-xl p-3 mb-3">
        <p className="text-white/60 text-xs mb-2 text-center">Твёрдые</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {syllables.hard.map(s => (
            <button key={s} onClick={() => handleTap(s)}
              className={`w-12 h-12 rounded-lg text-lg font-bold ${tapped.includes(s) ? 'bg-green-400 text-white' : 'bg-blue-500 text-white hover:scale-110'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white/20 rounded-xl p-3">
        <p className="text-white/60 text-xs mb-2 text-center">Мягкие</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {syllables.soft.map(s => (
            <button key={s} onClick={() => handleTap(s)}
              className={`w-12 h-12 rounded-lg text-lg font-bold ${tapped.includes(s) ? 'bg-green-400 text-white' : 'bg-green-500 text-white hover:scale-110'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BubbleGame = ({ target, pool, onComplete, onBack }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();
  const targetScore = 5;

  useEffect(() => { speak(target); }, [target, speak]);

  useEffect(() => {
    const i = setInterval(() => {
      if (bubbles.length < 6) {
        const v = Math.random() > 0.5 ? target : pool[Math.floor(Math.random() * pool.length)];
        setBubbles(p => [...p, { id: Date.now() + Math.random(), value: v, x: 8 + Math.random() * 78, y: 105, speed: 0.3 + Math.random() * 0.25 }]);
      }
    }, 900);
    return () => clearInterval(i);
  }, [bubbles.length, target, pool]);

  useEffect(() => {
    const i = setInterval(() => setBubbles(p => p.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -10)), 50);
    return () => clearInterval(i);
  }, []);

  const pop = (b) => {
    if (busyRef.current) return;
    speak(b.value);
    setBubbles(p => p.filter(x => x.id !== b.id));
    if (b.value === target) {
      const ns = score + 1;
      setScore(ns);
      setWrongAttempts(0);
      setShowHint(false);
      if (ns >= targetScore) {
        busyRef.current = true;
        setShowConfetti(true);
        setTimeout(() => onComplete(3), 1500);
      }
    } else {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);

      if (newWrongAttempts >= 2) {
        setShowHint(true);
        speak(`Ищи пузырь с буквой ${target}`);
      } else {
        speak('Попробуй ещё раз!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 to-blue-600 relative overflow-hidden">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center p-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <div className="bg-white/30 rounded-full px-5 py-2">
          <span className="text-white">Лопни: </span>
          <span className="text-xl font-bold text-yellow-300">{target}</span>
        </div>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>
      <div className="absolute inset-0 top-16">
        {bubbles.map(b => {
          const isTarget = b.value === target;
          const shouldHighlight = showHint && isTarget;

          return (
            <button
              key={b.id}
              onClick={() => pop(b)}
              className={`absolute w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all ${
                shouldHighlight ? 'bg-green-400 text-white animate-pulse ring-4 ring-green-300 scale-125' :
                'bg-white/90 hover:scale-110'
              }`}
              style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {b.value}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Игра "Найди пару" - карточки с буквами (Memory Game)
const MemoryCardGame = ({ letters, onComplete, onBack }) => {
  const speak = useSpeak();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const targetScore = letters.length;

  useEffect(() => {
    speak('Найди пары одинаковых букв');
    // Создаем пары карточек
    const pairs = letters.flatMap((letter, idx) => [
      { id: `${letter}-1-${idx}`, letter, pairId: letter },
      { id: `${letter}-2-${idx}`, letter, pairId: letter }
    ]);
    setCards(pairs.sort(() => Math.random() - 0.5));
  }, [letters, speak]);

  const handleCardClick = (card) => {
    if (flipped.length >= 2 || flipped.includes(card.id) || matched.includes(card.pairId)) {
      return;
    }

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    speak(card.letter);

    if (newFlipped.length === 2) {
      const card1 = cards.find(c => c.id === newFlipped[0]);
      const card2 = cards.find(c => c.id === newFlipped[1]);

      if (card1.pairId === card2.pairId) {
        // Найдена пара!
        setTimeout(() => {
          setMatched([...matched, card1.pairId]);
          setFlipped([]);
          const newScore = score + 1;
          setScore(newScore);

          if (newScore >= targetScore) {
            setShowConfetti(true);
            setTimeout(() => onComplete(3), 1500);
          }
        }, 600);
      } else {
        // Не совпали
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-400 to-rose-500 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">🎴 Найди пары</h2>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>

      <p className="text-white/80 text-center mb-4 text-sm">Найди две одинаковые буквы!</p>

      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.pairId);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched}
              className={`aspect-square rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                isMatched ? 'bg-green-400 text-white scale-95 opacity-50' :
                isFlipped ? 'bg-white text-gray-800 scale-105' :
                'bg-white/30 text-transparent hover:scale-105'
              }`}
              style={{
                transform: isFlipped || isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            >
              {(isFlipped || isMatched) ? card.letter : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Игра "Что лишнее?" - найди букву, которая не подходит к остальным
const OddOneOutGame = ({ items, onComplete, onBack }) => {
  const speak = useSpeak();
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const targetScore = 5;

  // items = [{ letters: ['А', 'О', 'У', 'М'], oddOne: 'М', hint: 'Гласные или согласная?' }]
  const [currentRound, setCurrentRound] = useState(0);
  const current = items[currentRound];

  useEffect(() => {
    speak('Найди лишнюю букву');
  }, [speak]);

  const handleSelect = (letter) => {
    speak(letter);

    if (letter === current.oddOne) {
      setShowResult('correct');
      setTimeout(() => {
        const newScore = score + 1;
        setScore(newScore);
        setShowResult(null);

        if (newScore >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(3), 1500);
        } else if (currentRound + 1 < items.length) {
          setCurrentRound(currentRound + 1);
        }
      }, 800);
    } else {
      setShowResult('wrong');
      speak('Попробуй ещё раз');
      setTimeout(() => setShowResult(null), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-400 to-blue-500 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">🔍 Что лишнее?</h2>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>

      <p className="text-white/80 text-center mb-4">{current.hint}</p>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {current.letters.map((letter, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(letter)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-6xl font-bold transition-all ${
              showResult === 'correct' && letter === current.oddOne ? 'bg-green-400 text-white animate-bounce' :
              showResult === 'wrong' && letter !== current.oddOne ? 'bg-white text-gray-800' :
              'bg-white text-gray-800 hover:scale-105 active:scale-95'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {showResult === 'wrong' && (
        <p className="text-center text-white mt-4 text-lg animate-pulse">❌ Попробуй ещё раз!</p>
      )}
    </div>
  );
};

// Игра "Различи похожие буквы" - учимся не путать визуально похожие буквы
const DistinguishGame = ({ similarPairs, onComplete, onBack }) => {
  const speak = useSpeak();
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const targetScore = 5;

  // similarPairs = [{ target: 'Б', similar: 'В', word: 'БАК', image: '🪣' }]
  const current = similarPairs[currentRound];

  useEffect(() => {
    speak(`Найди букву ${current.target}`);
  }, [current, speak]);

  const handleSelect = (letter) => {
    speak(letter);

    if (letter === current.target) {
      setShowResult('correct');
      setTimeout(() => {
        const newScore = score + 1;
        setScore(newScore);
        setShowResult(null);

        if (newScore >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(3), 1500);
        } else if (currentRound + 1 < similarPairs.length) {
          setCurrentRound(currentRound + 1);
        }
      }, 800);
    } else {
      setShowResult('wrong');
      setTimeout(() => setShowResult(null), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-400 to-purple-600 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">👀 Различи буквы</h2>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>

      <div className="text-center mb-6">
        <p className="text-white/80 mb-2">Найди букву для слова:</p>
        <div className="bg-white/20 rounded-2xl p-4 inline-block">
          <span className="text-6xl">{current.image}</span>
          <p className="text-white text-2xl font-bold mt-2">{current.word}</p>
        </div>
        <p className="text-white/60 text-sm mt-2">Слушай внимательно!</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        <button
          onClick={() => handleSelect(current.target)}
          className={`aspect-square rounded-3xl flex items-center justify-center text-8xl font-bold transition-all shadow-2xl ${
            showResult === 'correct' ? 'bg-green-400 text-white scale-110 animate-bounce' :
            showResult === 'wrong' ? 'bg-white text-gray-800' :
            'bg-white text-gray-800 hover:scale-110 active:scale-95'
          }`}
        >
          {current.target}
        </button>
        <button
          onClick={() => handleSelect(current.similar)}
          className={`aspect-square rounded-3xl flex items-center justify-center text-8xl font-bold transition-all shadow-2xl ${
            showResult === 'wrong' ? 'bg-red-400 text-white scale-90' :
            'bg-white text-gray-800 hover:scale-110 active:scale-95'
          }`}
        >
          {current.similar}
        </button>
      </div>

      {showResult === 'wrong' && (
        <p className="text-center text-white mt-6 text-xl animate-pulse">❌ Попробуй ещё раз!</p>
      )}
      {showResult === 'correct' && (
        <p className="text-center text-white mt-6 text-xl animate-bounce">✅ Правильно!</p>
      )}
    </div>
  );
};

// Игра "Где звук?" - определи позицию звука в слове (начало/середина/конец)
const SoundPositionGame = ({ words, onComplete, onBack }) => {
  const speak = useSpeak();
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const targetScore = 5;

  // words = [{ word: 'МАМА', image: '👩', target: 'М', position: 'start' }]
  const current = words[currentRound];

  useEffect(() => {
    speak(`Где звук ${current.target} в слове ${current.word}?`);
  }, [current, speak]);

  const handleSelect = (position) => {
    if (position === current.position) {
      setShowResult('correct');
      speak('Правильно');
      setTimeout(() => {
        const newScore = score + 1;
        setScore(newScore);
        setShowResult(null);

        if (newScore >= targetScore) {
          setShowConfetti(true);
          setTimeout(() => onComplete(3), 1500);
        } else if (currentRound + 1 < words.length) {
          setCurrentRound(currentRound + 1);
        }
      }, 1000);
    } else {
      setShowResult('wrong');
      speak('Попробуй ещё раз');
      setTimeout(() => setShowResult(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 to-emerald-500 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">👂 Где звук?</h2>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">⭐{score}/{targetScore}</span>
      </div>

      <div className="text-center mb-6">
        <p className="text-white/90 text-lg mb-3">Где звук <span className="text-3xl font-bold text-yellow-300">{current.target}</span> в слове?</p>
        <button
          onClick={() => speak(current.word)}
          className="bg-white/20 rounded-2xl p-4 inline-block hover:bg-white/30 transition-all"
        >
          <span className="text-7xl">{current.image}</span>
          <p className="text-white text-3xl font-bold mt-2">{current.word}</p>
        </button>
        <p className="text-white/70 text-sm mt-2">👆 Нажми, чтобы послушать еще раз</p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <button
          onClick={() => handleSelect('start')}
          className={`w-full py-6 rounded-2xl flex items-center justify-between px-6 text-xl font-bold transition-all ${
            showResult === 'correct' && current.position === 'start' ? 'bg-green-400 text-white scale-105' :
            showResult === 'wrong' && current.position !== 'start' ? 'bg-red-300 text-white' :
            'bg-white text-gray-800 hover:scale-105 active:scale-95'
          }`}
        >
          <span className="text-3xl">▶️</span>
          <span>В начале</span>
          <span className="text-2xl">{current.word[0]}<span className="text-gray-400">{current.word.slice(1)}</span></span>
        </button>

        <button
          onClick={() => handleSelect('middle')}
          className={`w-full py-6 rounded-2xl flex items-center justify-between px-6 text-xl font-bold transition-all ${
            showResult === 'correct' && current.position === 'middle' ? 'bg-green-400 text-white scale-105' :
            showResult === 'wrong' && current.position !== 'middle' ? 'bg-red-300 text-white' :
            'bg-white text-gray-800 hover:scale-105 active:scale-95'
          }`}
        >
          <span className="text-3xl">⏸️</span>
          <span>В середине</span>
          <span className="text-2xl"><span className="text-gray-400">{current.word[0]}</span>{current.word[Math.floor(current.word.length/2)]}<span className="text-gray-400">{current.word[current.word.length-1]}</span></span>
        </button>

        <button
          onClick={() => handleSelect('end')}
          className={`w-full py-6 rounded-2xl flex items-center justify-between px-6 text-xl font-bold transition-all ${
            showResult === 'correct' && current.position === 'end' ? 'bg-green-400 text-white scale-105' :
            showResult === 'wrong' && current.position !== 'end' ? 'bg-red-300 text-white' :
            'bg-white text-gray-800 hover:scale-105 active:scale-95'
          }`}
        >
          <span className="text-3xl">⏹️</span>
          <span>В конце</span>
          <span className="text-2xl"><span className="text-gray-400">{current.word.slice(0, -1)}</span>{current.word[current.word.length-1]}</span>
        </button>
      </div>

      {showResult === 'correct' && (
        <p className="text-center text-white mt-6 text-2xl animate-bounce">✅ Правильно!</p>
      )}
    </div>
  );
};

// Игра "Поиск на картинке" - найди предметы на заданную букву
const FindOnSceneGame = ({ letter, onComplete, onBack }) => {
  const speak = useSpeak();
  const [found, setFound] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Предметы для разных букв
  const ITEMS_BY_LETTER = {
    'М': [
      { name: 'МАМА', emoji: '👩', correct: true },
      { name: 'МЯЧ', emoji: '⚽', correct: true },
      { name: 'МОРЕ', emoji: '🌊', correct: true },
      { name: 'КОШКА', emoji: '🐱', correct: false },
      { name: 'ДОМ', emoji: '🏠', correct: false },
      { name: 'СОЛНЦЕ', emoji: '☀️', correct: false },
    ],
    'С': [
      { name: 'СОЛНЦЕ', emoji: '☀️', correct: true },
      { name: 'СЛОН', emoji: '🐘', correct: true },
      { name: 'СОБАКА', emoji: '🐕', correct: true },
      { name: 'КОТ', emoji: '🐱', correct: false },
      { name: 'МЯЧ', emoji: '⚽', correct: false },
      { name: 'ДОМ', emoji: '🏠', correct: false },
    ],
    'Л': [
      { name: 'ЛУНА', emoji: '🌙', correct: true },
      { name: 'ЛИСА', emoji: '🦊', correct: true },
      { name: 'ЛИСТ', emoji: '🍃', correct: true },
      { name: 'МАМА', emoji: '👩', correct: false },
      { name: 'РЫБА', emoji: '🐟', correct: false },
      { name: 'КОТ', emoji: '🐱', correct: false },
    ],
    'Р': [
      { name: 'РЫБА', emoji: '🐟', correct: true },
      { name: 'РУКА', emoji: '✋', correct: true },
      { name: 'РОЗА', emoji: '🌹', correct: true },
      { name: 'МАМА', emoji: '👩', correct: false },
      { name: 'КОТ', emoji: '🐱', correct: false },
      { name: 'СОЛНЦЕ', emoji: '☀️', correct: false },
    ],
    'К': [
      { name: 'КОШКА', emoji: '🐱', correct: true },
      { name: 'КНИГА', emoji: '📖', correct: true },
      { name: 'КОНЬ', emoji: '🐴', correct: true },
      { name: 'МЯЧ', emoji: '⚽', correct: false },
      { name: 'ДОМ', emoji: '🏠', correct: false },
      { name: 'РЫБА', emoji: '🐟', correct: false },
    ],
  };

  const items = ITEMS_BY_LETTER[letter] || [];
  const correctItems = items.filter(i => i.correct);
  const targetScore = correctItems.length;

  useEffect(() => {
    speak(`Найди все предметы на букву ${letter}`);
  }, [letter, speak]);

  const handleItemClick = (item) => {
    if (found.includes(item.name)) return;

    speak(item.name);

    if (item.correct) {
      const newFound = [...found, item.name];
      setFound(newFound);

      if (newFound.length >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(5), 1500);
      }
    } else {
      speak('Это слово начинается на другую букву');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 to-orange-500 p-4">
      <Confetti active={showConfetti} />

      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <div className="bg-white/30 rounded-2xl px-5 py-2">
          <span className="text-white text-sm">Найди на букву: </span>
          <span className="text-3xl font-bold text-white">{letter}</span>
        </div>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">
          {found.length}/{targetScore} ⭐
        </span>
      </div>

      <div className="bg-white/80 rounded-2xl p-4 mb-4">
        <p className="text-center text-gray-800 font-semibold">
          🔍 Найди все предметы на букву <span className="text-2xl text-orange-600">{letter}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const isFound = found.includes(item.name);
          const isCorrect = item.correct;

          return (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              disabled={isFound}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-5xl transition-all ${
                isFound ? 'bg-green-400 scale-95 opacity-60' :
                'bg-white hover:scale-105 active:scale-95 shadow-lg'
              }`}
            >
              <div className="mb-1">{item.emoji}</div>
              {isFound && (
                <div className="text-sm font-bold text-white">✓</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 bg-white/30 rounded-2xl p-3">
        <p className="text-white text-sm text-center">
          Подсказка: {correctItems.map(i => i.emoji).join(' ')}
        </p>
      </div>
    </div>
  );
};

// Игра "Сортировка" - распредели предметы по коробкам с буквами
const SortingGame = ({ letters, onComplete, onBack }) => {
  const speak = useSpeak();
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const targetScore = 10;

  // Предметы для сортировки
  const ALL_ITEMS = {
    'М': ['МАМА👩', 'МЯЧ⚽', 'МОРЕ🌊', 'МЫЛО🧼'],
    'С': ['СОЛНЦЕ☀️', 'СЛОН🐘', 'СОБАКА🐕', 'СОМ🐟'],
    'Л': ['ЛУНА🌙', 'ЛИСА🦊', 'ЛИСТ🍃', 'ЛАМПА💡'],
    'Р': ['РЫБА🐟', 'РУКА✋', 'РОЗА🌹', 'РАКЕТА🚀'],
    'К': ['КОШКА🐱', 'КНИГА📖', 'КОНЬ🐴', 'КАША🥣'],
    'Н': ['НЕБО☁️', 'НОРА🕳️', 'НОЖИ🔪', 'НОТЫ🎵'],
  };

  useEffect(() => {
    generateNewItem();
  }, []);

  const generateNewItem = () => {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const items = ALL_ITEMS[randomLetter] || ['МАМА👩'];
    const randomItem = items[Math.floor(Math.random() * items.length)];

    setCurrentItem({ text: randomItem, correctLetter: randomLetter });
    speak(`Куда положить ${randomItem.replace(/[^\u0400-\u04FF]/g, '')}?`);
  };

  const handleSort = (selectedLetter) => {
    if (!currentItem) return;

    speak(selectedLetter);

    if (selectedLetter === currentItem.correctLetter) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(5), 1500);
      } else {
        setTimeout(generateNewItem, 500);
      }
    } else {
      speak('Не та коробка! Попробуй ещё раз');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 to-cyan-600 p-4 flex flex-col">
      <Confetti active={showConfetti} />

      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white">📦 Сортировка</h2>
        <span className="text-white bg-white/30 rounded-full px-3 py-2 text-sm">
          ⭐ {score}/{targetScore}
        </span>
      </div>

      <div className="bg-white/80 rounded-2xl p-4 mb-4">
        <p className="text-center text-gray-800 font-semibold">
          Положи предмет в правильную коробку
        </p>
      </div>

      {/* Конвейер с предметом */}
      <div className="flex-1 flex items-center justify-center mb-6">
        {currentItem && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl animate-bounce">
            <div className="text-6xl text-center">{currentItem.text}</div>
          </div>
        )}
      </div>

      {/* Коробки для сортировки */}
      <div className="grid grid-cols-2 gap-4">
        {letters.map(letter => (
          <button
            key={letter}
            onClick={() => handleSort(letter)}
            className="bg-white rounded-2xl p-6 shadow-lg active:scale-95 transition-all hover:shadow-xl"
          >
            <div className="text-5xl font-bold text-center mb-2" style={{ color: ISLANDS[Object.keys(ISLANDS).find(k => {
              const island = ISLANDS[k];
              return island.vowels.includes(letter) || island.consonants.includes(letter);
            })]?.color || '#666' }}>
              {letter}
            </div>
            <div className="text-sm text-gray-600 text-center">Коробка {letter}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const BuildWordGame = ({ wordData, onComplete, onBack }) => {
  const [placed, setPlaced] = useState(Array(wordData.syllables.length).fill(null));
  const [available, setAvailable] = useState(() => [...wordData.syllables].sort(() => Math.random() - 0.5));
  const [showConfetti, setShowConfetti] = useState(false);
  const speak = useSpeak();

  useEffect(() => { speak('Собери слово'); }, [speak]);

  const handleClick = (syl, idx) => {
    const slot = placed.findIndex(p => p === null);
    if (slot === -1) return;
    speak(syl, 0.6);
    const np = [...placed]; np[slot] = syl;
    const na = [...available]; na[idx] = null;
    setPlaced(np); setAvailable(na);
    if (np.every(p => p !== null)) {
      setTimeout(() => {
        if (np.join('-') === wordData.syllables.join('-')) {
          speak(wordData.display, 0.7);
          setShowConfetti(true);
          setTimeout(() => onComplete(3), 1800);
        }
      }, 400);
    }
  };

  const handleSlot = (idx) => {
    if (!placed[idx]) return;
    const syl = placed[idx];
    const np = [...placed]; np[idx] = null;
    const ei = available.findIndex(a => a === null);
    if (ei !== -1) { const na = [...available]; na[ei] = syl; setAvailable(na); }
    setPlaced(np);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-pink-500 p-4">
      <Confetti active={showConfetti} />
      <div className="flex justify-between items-center mb-3">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <span className="text-5xl">{wordData.image}</span>
        <div className="w-10" />
      </div>
      <p className="text-white text-center mb-4 font-bold">{wordData.word}</p>
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {placed.map((p, i) => (
          <button key={i} onClick={() => handleSlot(i)}
            className={`w-14 h-14 rounded-lg text-lg font-bold ${p ? 'bg-white text-gray-800' : 'bg-white/30 border-2 border-dashed border-white/60'}`}>
            {p || ''}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {available.map((a, i) => a && (
          <button key={i} onClick={() => handleClick(a, i)}
            className="w-14 h-14 rounded-lg bg-yellow-400 text-gray-800 text-lg font-bold hover:scale-110 active:scale-95">
            {a}
          </button>
        ))}
      </div>
    </div>
  );
};

const ReadWordGame = ({ wordData, onComplete, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();

  useEffect(() => { speak('Читай'); }, [speak]);

  const handleTap = () => {
    if (busyRef.current) return;
    speak(wordData.syllables[idx], 0.5);
    if (idx + 1 >= wordData.syllables.length) {
      busyRef.current = true;
      setTimeout(() => { speak(wordData.display, 0.7); setShowConfetti(true); }, 600);
      setTimeout(() => onComplete(2), 2400);
    } else setIdx(idx + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 to-teal-600 p-4 flex flex-col items-center justify-center">
      <Confetti active={showConfetti} />
      <button onClick={onBack} className="absolute top-4 left-4 text-3xl text-white">←</button>
      <span className="text-6xl mb-4">{wordData.image}</span>
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {wordData.syllables.map((s, i) => {
          const base = syllableClass(s);
          const isDone = i < idx;
          const isActive = i === idx;
          // Метод Зайцева: цвет по типу склада сохраняется, активный подсвечивается ring + scale,
          // пройденные — с зелёным ring (как галочка), будущие — слегка приглушены.
          const stateCls = isActive
            ? 'ring-4 ring-pink-400 scale-110 animate-pulse'
            : isDone
              ? 'ring-4 ring-green-400'
              : 'opacity-70';
          return (
            <div key={i}
              className={`min-w-[3.5rem] h-14 px-3 rounded-lg flex items-center justify-center text-2xl font-black tracking-wide transition-transform ${base} ${stateCls}`}>
              {s}
            </div>
          );
        })}
      </div>
      <button onClick={handleTap} className="bg-white text-teal-600 text-lg font-bold py-3 px-8 rounded-full">
        Читай: <span className={`inline-block px-3 py-1 rounded-md ml-1 ${syllableClass(wordData.syllables[idx])}`}>{wordData.syllables[idx]}</span>
      </button>
    </div>
  );
};

const ReadSentenceGame = ({ sentence, onComplete, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const busyRef = useRef(false);
  const speak = useSpeak();

  useEffect(() => { speak('Читай предложение'); }, [speak]);

  const handleTap = (i) => {
    if (busyRef.current) return;
    if (i !== idx) return;
    speak(sentence.words[i], 0.6);
    if (idx + 1 >= sentence.words.length) {
      busyRef.current = true;
      setTimeout(() => { speak(sentence.text, 0.7); setShowConfetti(true); }, 600);
      setTimeout(() => onComplete(3), 2600);
    } else setIdx(idx + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 to-orange-500 p-4 flex flex-col items-center justify-center">
      <Confetti active={showConfetti} />
      <button onClick={onBack} className="absolute top-4 left-4 text-3xl text-white">←</button>
      <span className="text-6xl mb-4">{sentence.image}</span>
      <div className="flex gap-2 flex-wrap justify-center">
        {sentence.words.map((w, i) => (
          <button key={i} onClick={() => handleTap(i)}
            className={`px-4 py-2 rounded-lg text-lg font-bold ${
              i < idx ? 'bg-green-400 text-white' : i === idx ? 'bg-white text-gray-800 animate-pulse' : 'bg-white/40 text-white/60'
            }`}>{w}</button>
        ))}
      </div>
    </div>
  );
};

// Уровни
const LetterLevel = ({ letterIdx, onComplete, onBack }) => {
  const [stage, setStage] = useState(0);
  const [stars, setStars] = useState(0);
  const isVowel = letterIdx < VOWELS_HARD.length;
  const letter = isVowel ? VOWELS_HARD[letterIdx] : CONSONANTS[letterIdx - VOWELS_HARD.length];

  const stages = isVowel
    ? [{ type: 'find', target: letter, options: VOWELS_HARD }, { type: 'bubble', target: letter, pool: VOWELS_HARD.filter(v => v !== letter) }]
    : [
        { type: 'find', target: letter, options: CONSONANTS.slice(0, Math.max(3, letterIdx - VOWELS_HARD.length + 2)) },
        { type: 'table', consonant: letter },
        { type: 'find', target: SYLLABLES[letter].hard[0], options: SYLLABLES[letter].hard },
        { type: 'bubble', target: SYLLABLES[letter].hard[1], pool: SYLLABLES[letter].hard.filter((_, i) => i !== 1) },
      ];

  const next = (s) => {
    setStars(stars + s);
    if (stage + 1 >= stages.length) onComplete(stars + s);
    else setStage(stage + 1);
  };

  const c = stages[stage];
  if (c.type === 'find') return <FindGame target={c.target} options={c.options} title={isVowel ? 'Гласная' : c.target.length > 1 ? 'Склад' : 'Согласная'} onComplete={next} onBack={onBack} />;
  if (c.type === 'table') return <SyllableTable consonant={c.consonant} onComplete={next} onBack={onBack} />;
  if (c.type === 'bubble') return <BubbleGame target={c.target} pool={c.pool} onComplete={next} onBack={onBack} />;
  return null;
};

const WordsLevel = ({ level, onComplete, onBack }) => {
  const [wi, setWi] = useState(0);
  const [stage, setStage] = useState(0);
  const [stars, setStars] = useState(0);
  const words = WORDS_BY_LEVEL[level];
  const w = words[wi];

  const next = (s) => {
    setStars(stars + s);
    if (stage === 0) setStage(1);
    else if (wi + 1 >= words.length) onComplete(stars + s);
    else { setWi(wi + 1); setStage(0); }
  };

  if (stage === 0) return <BuildWordGame wordData={w} onComplete={next} onBack={onBack} />;
  return <ReadWordGame wordData={w} onComplete={next} onBack={onBack} />;
};

const SentenceLevel = ({ onComplete, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);

  const next = (s) => {
    setStars(stars + s);
    if (idx + 1 >= SENTENCES.length) onComplete(stars + s);
    else setIdx(idx + 1);
  };

  return <ReadSentenceGame sentence={SENTENCES[idx]} onComplete={next} onBack={onBack} />;
};

// Компонент для чтения историй (5-й остров)
const StoryReaderGame = ({ story, onComplete, onBack }) => {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const speak = useSpeak();
  const currentSentence = story.sentences[sentenceIdx];

  useEffect(() => {
    speak(currentSentence.text);
  }, [sentenceIdx, currentSentence, speak]);

  const handleNext = () => {
    if (sentenceIdx + 1 >= story.sentences.length) {
      setShowConfetti(true);
      setTimeout(() => onComplete(5), 1500);
    } else {
      setSentenceIdx(sentenceIdx + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 to-pink-500 p-4 flex flex-col items-center justify-center">
      <Confetti active={showConfetti} />
      <button onClick={onBack} className="absolute top-4 left-4 text-3xl text-white">←</button>

      <div className="text-center mb-6">
        <span className="text-6xl mb-4 block">{story.image}</span>
        <h2 className="text-2xl font-bold text-white mb-2">{story.title}</h2>
        <p className="text-white/70 text-sm">Страница {sentenceIdx + 1} из {story.sentences.length}</p>
      </div>

      <div className="bg-white/20 rounded-2xl p-6 mb-6 max-w-md">
        <div className="flex gap-2 flex-wrap justify-center">
          {currentSentence.words.map((word, idx) => (
            <button
              key={idx}
              onClick={() => speak(word)}
              className="px-4 py-2 bg-white rounded-xl text-gray-800 text-xl font-bold hover:scale-110 active:scale-95 transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="bg-yellow-400 text-gray-800 text-xl font-bold py-3 px-8 rounded-full"
      >
        {sentenceIdx + 1 >= story.sentences.length ? 'Готово! 🎉' : 'Дальше →'}
      </button>
    </div>
  );
};

// Детальный экран острова
// Компактная таблица складов для экрана острова (метод Зайцева — «кубики на стене»)
const IslandSyllableTable = ({ consonants }) => {
  const speak = useSpeak();
  // Фильтруем согласные — оставляем только те, что есть в SYLLABLES (без Ь/Ъ)
  const validConsonants = consonants.filter(c => SYLLABLES[c]);

  if (validConsonants.length === 0) return null;

  return (
    <section className="bg-white/20 rounded-2xl p-3">
      <h3 className="text-white font-bold mb-2 text-center text-sm">🧱 Склады — читай и запоминай</h3>
      {/* Шапка таблицы — гласные */}
      <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `minmax(28px,36px) repeat(${ALL_VOWELS_HARD.length + ALL_VOWELS_SOFT.length}, minmax(0,1fr))` }}>
        <div />
        {ALL_VOWELS_HARD.map(v => (
          <button
            key={`h-${v}`}
            onClick={() => speak(v, 0.7)}
            className="h-8 rounded-md text-sm font-bold bg-gradient-to-br from-sky-300 to-blue-500 text-white shadow hover:scale-110 active:scale-95 transition-transform"
          >
            {v}
          </button>
        ))}
        {ALL_VOWELS_SOFT.map(v => (
          <button
            key={`s-${v}`}
            onClick={() => speak(v, 0.7)}
            className="h-8 rounded-md text-sm font-bold bg-gradient-to-br from-emerald-300 to-green-500 text-white shadow hover:scale-110 active:scale-95 transition-transform"
          >
            {v}
          </button>
        ))}
      </div>
      {/* Строки — согласная + её склады */}
      {validConsonants.map(c => (
        <div
          key={c}
          className="grid gap-1 mb-1"
          style={{ gridTemplateColumns: `minmax(28px,36px) repeat(${ALL_VOWELS_HARD.length + ALL_VOWELS_SOFT.length}, minmax(0,1fr))` }}
        >
          <button
            onClick={() => speak(c, 0.7)}
            className="h-8 rounded-md text-sm font-bold bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow hover:scale-110 active:scale-95 transition-transform"
          >
            {c}
          </button>
          {SYLLABLES[c].hard.map(syl => (
            <button
              key={syl}
              onClick={() => speak(syl, 0.6)}
              className="h-8 rounded-md text-[11px] sm:text-xs font-bold bg-gradient-to-br from-blue-100 to-blue-300 text-blue-900 shadow-sm hover:from-blue-200 hover:to-blue-400 hover:scale-110 active:scale-95 transition-transform"
            >
              {syl}
            </button>
          ))}
          {SYLLABLES[c].soft.map(syl => (
            <button
              key={syl}
              onClick={() => speak(syl, 0.6)}
              className="h-8 rounded-md text-[11px] sm:text-xs font-bold bg-gradient-to-br from-green-100 to-green-300 text-green-900 shadow-sm hover:from-green-200 hover:to-green-400 hover:scale-110 active:scale-95 transition-transform"
            >
              {syl}
            </button>
          ))}
        </div>
      ))}
      <p className="text-white/60 text-[10px] text-center mt-1">Тапни по складу — услышишь его</p>
    </section>
  );
};

const IslandDetailScreen = ({ islandNum, profile, onSelectActivity, onBack }) => {
  const island = ISLANDS[islandNum];
  const progress = profile.progress.islands?.[islandNum] || { letters: {}, words: [], stories: [] };
  const speak = useSpeak();

  useEffect(() => {
    speak(island.name);
  }, [island, speak]);

  return (
    <div className="min-h-screen p-4 flex flex-col" style={{ background: `linear-gradient(to bottom, ${island.color}, ${island.color}dd)` }}>
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <div className="flex-1 text-center">
          <span className="text-4xl">{island.emoji}</span>
          <h2 className="text-white font-bold text-xl">{island.name}</h2>
          <p className="text-white/70 text-sm">{island.description}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-auto space-y-4 pb-4">
        {/* Таблица складов острова (метод Зайцева — всегда перед глазами) */}
        {island.consonants.filter(c => SYLLABLES[c]).length > 0 && (
          <IslandSyllableTable consonants={island.consonants} />
        )}

        {/* Буквы острова */}
        {(island.vowels.length > 0 || island.consonants.length > 0) && (
          <section className="bg-white/20 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-2">📝 Буквы и склады</h3>
            <div className="flex gap-2 flex-wrap">
              {[...island.vowels, ...island.consonants].map((letter, idx) => {
                const isCompleted = progress.letters[letter];
                const isUnlocked = idx === 0 || progress.letters[[...island.vowels, ...island.consonants][idx - 1]];
                return (
                  <button
                    key={letter}
                    onClick={() => isUnlocked && onSelectActivity('letter', letter)}
                    disabled={!isUnlocked}
                    className={`w-20 h-20 rounded-xl text-2xl font-bold transition-all ${
                      isCompleted ? 'bg-green-400 text-white' :
                      isUnlocked ? 'bg-white text-gray-800 hover:scale-110' :
                      'bg-gray-600/50 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : letter}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Обведение букв */}
        {(island.vowels.length > 0 || island.consonants.length > 0) && (
          <section className="bg-white/30 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-2">✍️ Обведи буквы</h3>
            <p className="text-white/70 text-xs mb-2">Обведи пальцем для лучшего запоминания</p>
            <div className="flex gap-2 flex-wrap">
              {[...island.vowels, ...island.consonants].map((letter) => {
                const isCompleted = progress.letters[letter];
                return (
                  <button
                    key={`trace-${letter}`}
                    onClick={() => onSelectActivity('trace', letter)}
                    className={`px-4 py-2 rounded-xl text-lg font-bold transition-all ${
                      isCompleted ? 'bg-blue-400 text-white hover:scale-105' :
                      'bg-white/50 text-gray-700 hover:scale-105'
                    }`}
                  >
                    ✍️ {letter}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Слова острова */}
        {island.words.length > 0 && (
          <section className="bg-white/20 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-2">📖 Слова</h3>
            <div className="grid grid-cols-2 gap-2">
              {island.words.map((wordData, idx) => {
                const isCompleted = progress.words.includes(wordData.display);
                const allLettersLearned = [...island.vowels, ...island.consonants].length > 0 &&
                  [...island.vowels, ...island.consonants].every(l => progress.letters[l]);
                const isUnlocked = allLettersLearned || idx === 0;

                return (
                  <button
                    key={idx}
                    onClick={() => isUnlocked && onSelectActivity('word', idx)}
                    disabled={!isUnlocked}
                    className={`py-3 rounded-xl flex flex-col items-center transition-all ${
                      isCompleted ? 'bg-green-400 text-white' :
                      isUnlocked ? 'bg-white text-gray-800 hover:scale-105' :
                      'bg-gray-600/50 text-gray-400'
                    }`}
                  >
                    <span className="text-3xl">{wordData.image}</span>
                    <span className="text-sm font-bold">{isCompleted ? '✓' : wordData.display}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Истории (только для 5-го острова) */}
        {island.stories && island.stories.length > 0 && (
          <section className="bg-white/20 rounded-2xl p-4">
            <h3 className="text-white font-bold mb-2">📚 Первые тексты</h3>
            <div className="space-y-2">
              {island.stories.map((story, idx) => {
                const isCompleted = progress.stories && progress.stories.includes(story.title);
                const allWordsLearned = island.words.every(w => progress.words.includes(w.display));
                const isUnlocked = allWordsLearned || idx === 0;

                return (
                  <button
                    key={idx}
                    onClick={() => isUnlocked && onSelectActivity('story', idx)}
                    disabled={!isUnlocked}
                    className={`w-full py-4 rounded-xl flex items-center gap-3 transition-all ${
                      isCompleted ? 'bg-green-400 text-white' :
                      isUnlocked ? 'bg-white text-gray-800 hover:scale-102' :
                      'bg-gray-600/50 text-gray-400'
                    }`}
                  >
                    <span className="text-4xl ml-3">{story.image}</span>
                    <div className="flex-1 text-left">
                      <span className="font-bold">{story.title}</span>
                      <span className="block text-xs opacity-70">{story.sentences.length} предложений</span>
                    </div>
                    {isCompleted && <span className="text-2xl mr-3">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Экран повторения букв (Spaced Repetition)
const ReviewScreen = ({ profile, onReviewLetter, onBack }) => {
  const speak = useSpeak();

  useEffect(() => {
    speak('Сад букв');
  }, [speak]);

  // Собираем все буквы для повторения из всех островов
  const lettersToReview = [];
  Object.keys(profile.progress.islands || {}).forEach(islandNum => {
    const islandProgress = profile.progress.islands[islandNum];
    if (!islandProgress.unlocked) return;

    const island = ISLANDS[islandNum];
    const allLetters = [...island.vowels, ...island.consonants];

    allLetters.forEach(letter => {
      const reviewData = islandProgress.reviewData?.[letter];
      if (reviewData && needsReview(reviewData)) {
        const urgency = getReviewUrgency(reviewData);
        const flower = getFlowerState(urgency);
        lettersToReview.push({
          letter,
          islandNum,
          urgency,
          flower,
          reviewData,
        });
      }
    });
  });

  // Сортируем по срочности (самые срочные первые)
  lettersToReview.sort((a, b) => b.urgency - a.urgency);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-300 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-3xl">←</button>
        <h1 className="text-2xl font-bold text-green-800">🌸 Сад букв</h1>
        <div className="w-8"></div>
      </div>

      <div className="bg-white/60 backdrop-blur rounded-2xl p-4 mb-4">
        <p className="text-center text-green-800 text-lg">
          Буквам нужна твоя помощь! 💧<br />
          Повтори их, чтобы не забыть
        </p>
      </div>

      {lettersToReview.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="text-7xl mb-4">🌺</div>
          <p className="text-xl text-green-800 font-bold text-center">
            Все буквы в порядке!<br />
            Отличная работа! 🎉
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {lettersToReview.map(({ letter, islandNum, flower, urgency, reviewData }, idx) => {
            const island = ISLANDS[islandNum];
            return (
              <button
                key={idx}
                onClick={() => onReviewLetter(islandNum, letter)}
                className="bg-white rounded-2xl p-4 shadow-lg active:scale-95 transition-all flex flex-col items-center"
              >
                {/* Flower status */}
                <div className="text-4xl mb-2">{flower.emoji}</div>

                {/* Letter */}
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: island.color }}
                >
                  {letter}
                </div>

                {/* Status text */}
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: flower.color }}
                >
                  {flower.text}
                </div>

                {/* Days info */}
                <div className="text-xs text-gray-500">
                  {reviewData.masteryLevel > 0 ? `💪 ${reviewData.masteryLevel}` : '🆕'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-white/60 backdrop-blur rounded-2xl p-4">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-2xl">🌸</div>
            <div className="text-xs text-green-800">Отлично</div>
          </div>
          <div>
            <div className="text-2xl">🌼</div>
            <div className="text-xs text-yellow-700">Пора полить</div>
          </div>
          <div>
            <div className="text-2xl">🥀</div>
            <div className="text-xs text-orange-700">Нужна вода</div>
          </div>
          <div>
            <div className="text-2xl">🍂</div>
            <div className="text-xs text-red-700">Срочно!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Карта
const MapScreen = ({ profile, onSelect, onEvolution, onStats, onReview, onParent, onShop, onGarage, onAchievements, onDailyChallenges }) => {
  const char = CHARACTERS.find(c => c.id === profile.character);
  const speak = useSpeak();

  // Инициализация прогресса островов если нет
  const islandProgress = profile.progress.islands || {
    1: { unlocked: true, completed: false, letters: {}, words: [] },
    2: { unlocked: false, completed: false, letters: {}, words: [] },
    3: { unlocked: false, completed: false, letters: {}, words: [] },
    4: { unlocked: false, completed: false, letters: {}, words: [] },
    5: { unlocked: false, completed: false, letters: {}, stories: [] },
  };

  // Вычисляем количество букв для повторения
  let reviewCount = 0;
  Object.keys(profile.progress.islands || {}).forEach(islandNum => {
    const islandProg = profile.progress.islands[islandNum];
    if (!islandProg.unlocked) return;

    const island = ISLANDS[islandNum];
    const allLetters = [...island.vowels, ...island.consonants];

    allLetters.forEach(letter => {
      const reviewData = islandProg.reviewData?.[letter];
      if (reviewData && needsReview(reviewData)) {
        reviewCount++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-indigo-500 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 bg-white/20 rounded-full py-1 px-3">
          <span className="text-xl">{char?.emoji}</span>
          <span className="text-white font-bold text-sm">{profile.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onParent}
            className="bg-white/20 rounded-full p-2 text-white text-xs hover:bg-white/30 transition-all"
            title="Панель родителя"
          >
            👨‍👩‍👧
          </button>
          <div className="bg-yellow-400 rounded-full py-1 px-3">
            <span className="font-bold text-gray-800">⭐ {profile.stars || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={onDailyChallenges} className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-bold text-sm">📅 Задания</button>
        <button onClick={onReview} className="relative flex-1 bg-green-500 text-white py-2 rounded-xl font-bold text-sm">
          🌸 Сад
          {reviewCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {reviewCount}
            </span>
          )}
        </button>
        <button onClick={onAchievements} className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-bold text-sm">🏆 Награды</button>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={onEvolution} className="flex-1 bg-purple-500 text-white py-2 rounded-xl font-bold text-sm">✨ Эволюция</button>
        <button onClick={onStats} className="flex-1 bg-violet-500 text-white py-2 rounded-xl font-bold text-sm">📊 Стат</button>
        <button onClick={onShop} className="flex-1 bg-amber-500 text-white py-2 rounded-xl font-bold text-sm">🛒 Магазин</button>
        <button onClick={onGarage} className="flex-1 bg-slate-600 text-white py-2 rounded-xl font-bold text-sm">🚗 Гараж</button>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-white/90 font-bold text-sm">🗺️ Карта островов</h2>
      </div>

      <div className="flex-1 overflow-auto space-y-3 pb-4">
        {Object.entries(ISLANDS).map(([islandNum, island]) => {
          const num = parseInt(islandNum);
          const progress = islandProgress[num];
          const isUnlocked = progress?.unlocked || false;
          const isCompleted = progress?.completed || false;

          // Подсчет прогресса
          const totalLetters = island.vowels.length + island.consonants.length;
          const completedLetters = Object.values(progress?.letters || {}).filter(Boolean).length;
          const totalWords = island.words.length;
          const completedWords = (progress?.words || []).length;
          const totalStories = island.stories?.length || 0;
          const completedStories = (progress?.stories || []).length;

          const progressPercent = totalLetters > 0
            ? Math.round((completedLetters / totalLetters) * 100)
            : (totalWords > 0 ? Math.round((completedWords / totalWords) * 100) : 0);

          return (
            <button
              key={num}
              onClick={() => {
                if (isUnlocked) {
                  speak(island.name);
                  onSelect('island', num);
                }
              }}
              disabled={!isUnlocked}
              className={`w-full rounded-2xl p-4 transition-all ${
                !isUnlocked ? 'bg-gray-600/50 opacity-60' :
                isCompleted ? 'bg-green-500/80' :
                'bg-white/20 hover:bg-white/30 active:scale-98'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-5xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {island.emoji}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-bold text-lg">{island.name}</h3>
                  <p className="text-white/70 text-xs">{island.description}</p>
                  {isUnlocked && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-white/80 text-xs">{progressPercent}%</span>
                    </div>
                  )}
                </div>
                <div className="text-2xl">
                  {!isUnlocked ? '🔒' : isCompleted ? '✅' : '▶️'}
                </div>
              </div>

              {isUnlocked && !isCompleted && (
                <div className="mt-2 flex gap-2 text-xs text-white/60">
                  {totalLetters > 0 && <span>📝 {completedLetters}/{totalLetters} букв</span>}
                  {totalWords > 0 && <span>📖 {completedWords}/{totalWords} слов</span>}
                  {totalStories > 0 && <span>📚 {completedStories}/{totalStories} историй</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Главный компонент
function ReadingGame() {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [screen, setScreen] = useState('loading');
  const [currentLevel, setCurrentLevel] = useState({ type: null, idx: 0 });
  const [loaded, setLoaded] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSessionEnd, setShowSessionEnd] = useState(false);

  // Загрузка профилей из API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfiles();
        if (Array.isArray(data)) {
          // Добавляем progress если его нет (для совместимости с маркетплейсом)
          const profilesWithProgress = data.map(p => ({
            ...p,
            progress: p.progress || {
              letters: Array(VOWELS_HARD.length + CONSONANTS.length).fill(false),
              words: [false, false, false, false],
              sentences: false,
            }
          }));
          setProfiles(profilesWithProgress);

          // Проверяем URL параметр для автовыбора профиля
          const urlParams = new URLSearchParams(window.location.search);
          const profileId = urlParams.get('profile');
          if (profileId) {
            const profile = profilesWithProgress.find(p => String(p.id) === String(profileId));
            if (profile) {
              setCurrentProfile(profile);
              setLoaded(true);
              setScreen('map');
              return;
            }
          }
        }
      } catch (e) {
        console.error('Error loading profiles:', e);
      }
      setLoaded(true);
      setScreen('profiles');
    };
    load();
  }, []);

  // Debounced persistence прогресса (страховка + localStorage fallback)
  useEffect(() => {
    if (!currentProfile?.id) return;
    const t = setTimeout(() => {
      fetch(`/api/profiles/${currentProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile),
      }).catch(() => {
        try { localStorage.setItem(`chitayka-profile-${currentProfile.id}`, JSON.stringify(currentProfile)); } catch {}
      });
    }, 500);
    return () => clearTimeout(t);
  }, [currentProfile]);

  // Таймер сессии (20 минут)
  useEffect(() => {
    if (!currentProfile || screen === 'profiles' || screen === 'loading') return;

    const timer = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        // 20 минут = 1200 секунд
        if (newTime >= 1200) {
          setShowSessionEnd(true);
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentProfile, screen]);

  // Обновление профиля через API
  const updateProfile = async (updated) => {
    try {
      await updateProfileAPI(updated.id, updated);
      const np = profiles.map(p => p.id === updated.id ? updated : p);
      setProfiles(np);
      setCurrentProfile(updated);
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const handleCreateProfile = async ({ name, character }) => {
    const newProfile = {
      id: Date.now().toString(),
      name,
      character,
      stars: 0,
      cars: [],
      stats: {},
      progress: {
        islands: {
          1: { unlocked: true, completed: false, letters: {}, words: [], reviewData: {} },
          2: { unlocked: false, completed: false, letters: {}, words: [], reviewData: {} },
          3: { unlocked: false, completed: false, letters: {}, words: [], reviewData: {} },
          4: { unlocked: false, completed: false, letters: {}, words: [], reviewData: {} },
          5: { unlocked: false, completed: false, letters: {}, stories: [], reviewData: {} },
        },
        // Обратная совместимость
        letters: Array(VOWELS_HARD.length + CONSONANTS.length).fill(false),
        words: [false, false, false, false],
        sentences: false,
      },
    };
    try {
      const created = await createProfile(newProfile);
      setProfiles([...profiles, created]);
      setCurrentProfile(created);
      setScreen('map');
    } catch (e) {
      console.error('Error creating profile:', e);
    }
  };

  const handleDeleteProfile = async (id) => {
    try {
      await deleteProfileAPI(id);
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (e) {
      console.error('Error deleting profile:', e);
    }
  };

  const handleSelect = (type, idx) => {
    if (type === 'island') {
      setCurrentLevel({ type: 'island', islandNum: idx });
      setScreen('island');
    } else {
      setCurrentLevel({ type, idx });
      setScreen('level');
    }
  };

  const handleIslandActivity = (activityType, data) => {
    setCurrentLevel({
      type: 'islandActivity',
      islandNum: currentLevel.islandNum,
      activityType,
      data
    });
    setScreen('islandActivity');
  };

  const handleActivityComplete = async (earnedStars) => {
    const today = getToday();
    const updated = { ...currentProfile };
    updated.stars = (updated.stars || 0) + earnedStars;
    updated.stats = { ...updated.stats };
    updated.stats[today] = {
      tasks: (updated.stats[today]?.tasks || 0) + 1,
      stars: (updated.stats[today]?.stars || 0) + earnedStars,
    };

    // Инициализация islands если нет
    if (!updated.progress.islands) {
      updated.progress.islands = {
        1: { unlocked: true, completed: false, letters: {}, words: [] },
        2: { unlocked: false, completed: false, letters: {}, words: [] },
        3: { unlocked: false, completed: false, letters: {}, words: [] },
        4: { unlocked: false, completed: false, letters: {}, words: [] },
        5: { unlocked: false, completed: false, letters: {}, stories: [] },
      };
    }

    const { islandNum, activityType, data } = currentLevel;
    const island = ISLANDS[islandNum];
    const islandProgress = updated.progress.islands[islandNum];

    // Инициализация reviewData если нет
    if (!islandProgress.reviewData) {
      islandProgress.reviewData = {};
    }

    if (activityType === 'letter') {
      islandProgress.letters[data] = true;

      // Обновление данных для spaced repetition
      if (!islandProgress.reviewData[data]) {
        islandProgress.reviewData[data] = {
          masteryLevel: 0,
          reviewCount: 0,
          successCount: 0,
          totalAttempts: 0,
          lastPracticed: today,
          nextReview: calculateNextReview(0),
        };
      } else {
        const reviewData = islandProgress.reviewData[data];
        reviewData.reviewCount += 1;
        reviewData.successCount += 1; // Считаем что завершили успешно
        reviewData.totalAttempts += 1;
        reviewData.lastPracticed = today;
        reviewData.masteryLevel = Math.min(reviewData.masteryLevel + 1, REVIEW_INTERVALS.length - 1);
        reviewData.nextReview = calculateNextReview(reviewData.masteryLevel);
      }
    } else if (activityType === 'word') {
      const wordData = island.words[data];
      if (!islandProgress.words.includes(wordData.display)) {
        islandProgress.words.push(wordData.display);
      }
    } else if (activityType === 'story') {
      const story = island.stories[data];
      if (!islandProgress.stories) islandProgress.stories = [];
      if (!islandProgress.stories.includes(story.title)) {
        islandProgress.stories.push(story.title);
      }
    }

    // Проверка на завершение острова
    const allLettersCompleted = [...island.vowels, ...island.consonants].every(l => islandProgress.letters[l]);
    const allWordsCompleted = island.words.every(w => islandProgress.words.includes(w.display));
    const allStoriesCompleted = island.stories
      ? island.stories.every(s => islandProgress.stories && islandProgress.stories.includes(s.title))
      : true;

    if (allLettersCompleted && allWordsCompleted && allStoriesCompleted) {
      islandProgress.completed = true;
      // Открыть следующий остров
      if (islandNum < 5) {
        updated.progress.islands[islandNum + 1].unlocked = true;
      }
    }

    await updateProfile(updated);
    setScreen('island');
  };

  const handleComplete = async (earnedStars) => {
    const today = getToday();
    const updated = { ...currentProfile };
    updated.stars = (updated.stars || 0) + earnedStars;
    updated.stats = { ...updated.stats };
    updated.stats[today] = {
      tasks: (updated.stats[today]?.tasks || 0) + 1,
      stars: (updated.stats[today]?.stars || 0) + earnedStars,
    };

    if (currentLevel.type === 'letter') {
      updated.progress.letters = [...updated.progress.letters];
      updated.progress.letters[currentLevel.idx] = true;
    } else if (currentLevel.type === 'words') {
      updated.progress.words = [...updated.progress.words];
      updated.progress.words[currentLevel.idx - 1] = true;
    } else if (currentLevel.type === 'sentences') {
      updated.progress.sentences = true;
    }

    await updateProfile(updated);
    setScreen('map');
  };

  const handleBuyCar = async (car) => {
    if (currentProfile.stars < car.price) return;
    const updated = {
      ...currentProfile,
      stars: currentProfile.stars - car.price,
      cars: [...(currentProfile.cars || []), car.id],
    };
    await updateProfile(updated);
  };

  const handleCarGameComplete = async (starsEarned) => {
    const updated = {
      ...currentProfile,
      stars: currentProfile.stars + starsEarned,
    };
    await updateProfile(updated);
    setScreen('garage');
  };

  const handlePlayCarGame = (car) => {
    setSelectedCar(car);
    setScreen('carGame');
  };

  if (!loaded) return <div className="min-h-screen bg-indigo-600 flex items-center justify-center text-white text-xl">Загрузка...</div>;

  if (screen === 'profiles') {
    return <ProfileSelect profiles={profiles} onSelect={p => { setCurrentProfile(p); setScreen('map'); }} onCreate={() => setScreen('create')} onDelete={handleDeleteProfile} />;
  }
  if (screen === 'create') return <CreateProfile onBack={() => setScreen('profiles')} onCreate={handleCreateProfile} />;
  if (screen === 'evolution') return <EvolutionScreen profile={currentProfile} onBack={() => setScreen('map')} />;
  if (screen === 'shop') return <Shop stars={currentProfile.stars} ownedCars={currentProfile.cars || []} onBuy={handleBuyCar} onBack={() => setScreen('map')} />;
  if (screen === 'garage') return <Garage ownedCars={currentProfile.cars || []} onBack={() => setScreen('map')} onPlayGame={handlePlayCarGame} />;
  if (screen === 'carGame' && selectedCar) return <CarGameRouter car={selectedCar} onComplete={handleCarGameComplete} onBack={() => setScreen('garage')} />;
  if (screen === 'stats') return <Stats stats={currentProfile.stats} onBack={() => setScreen('map')} />;
  if (screen === 'achievements') return <AchievementsScreen profile={currentProfile} onBack={() => setScreen('map')} />;
  if (screen === 'dailyChallenges') return <DailyChallengesScreen profile={currentProfile} onBack={() => setScreen('map')} onUpdateProfile={updateProfile} />;
  if (screen === 'parent') return <ParentDashboard profile={currentProfile} onBack={() => setScreen('map')} />;

  // Экран острова (детальный просмотр)
  if (screen === 'island') {
    return (
      <IslandDetailScreen
        islandNum={currentLevel.islandNum}
        profile={currentProfile}
        onSelectActivity={handleIslandActivity}
        onBack={() => setScreen('map')}
      />
    );
  }

  // Активность внутри острова
  if (screen === 'islandActivity') {
    const { islandNum, activityType, data } = currentLevel;
    const island = ISLANDS[islandNum];

    if (activityType === 'letter') {
      // Учим букву - используем FindGame и BubbleGame
      const letter = data;
      const isVowel = [...ALL_VOWELS_HARD, ...ALL_VOWELS_SOFT].includes(letter);
      const pool = isVowel
        ? [...ALL_VOWELS_HARD, ...ALL_VOWELS_SOFT].filter(v => v !== letter)
        : ALL_CONSONANTS.filter(c => c !== letter);

      return <BubbleGame target={letter} pool={pool} onComplete={handleActivityComplete} onBack={() => setScreen('island')} />;
    }

    if (activityType === 'word') {
      const wordData = island.words[data];
      return <BuildWordGame wordData={wordData} onComplete={handleActivityComplete} onBack={() => setScreen('island')} />;
    }

    if (activityType === 'story') {
      const story = island.stories[data];
      return <StoryReaderGame story={story} onComplete={handleActivityComplete} onBack={() => setScreen('island')} />;
    }

    if (activityType === 'trace') {
      const letter = data;
      return <TracingGame letter={letter} onComplete={handleActivityComplete} onBack={() => setScreen('island')} />;
    }
  }

  if (screen === 'level') {
    if (currentLevel.type === 'letter') return <LetterLevel letterIdx={currentLevel.idx} onComplete={handleComplete} onBack={() => setScreen('map')} />;
    if (currentLevel.type === 'words') return <WordsLevel level={currentLevel.idx} onComplete={handleComplete} onBack={() => setScreen('map')} />;
    if (currentLevel.type === 'sentences') return <SentenceLevel onComplete={handleComplete} onBack={() => setScreen('map')} />;
  }

  const handleReviewLetter = (islandNum, letter) => {
    setCurrentLevel({
      type: 'review',
      islandNum,
      letter,
    });
    setScreen('review');
  };

  const handleReviewComplete = async (earnedStars) => {
    const today = getToday();
    const updated = { ...currentProfile };
    updated.stars = (updated.stars || 0) + earnedStars;
    updated.stats = { ...updated.stats };
    updated.stats[today] = {
      tasks: (updated.stats[today]?.tasks || 0) + 1,
      stars: (updated.stats[today]?.stars || 0) + earnedStars,
    };

    const { islandNum, letter } = currentLevel;
    const islandProgress = updated.progress.islands[islandNum];

    // Обновление reviewData
    if (islandProgress.reviewData && islandProgress.reviewData[letter]) {
      const reviewData = islandProgress.reviewData[letter];
      reviewData.reviewCount += 1;
      reviewData.successCount += 1;
      reviewData.totalAttempts += 1;
      reviewData.lastPracticed = today;
      reviewData.masteryLevel = Math.min(reviewData.masteryLevel + 1, REVIEW_INTERVALS.length - 1);
      reviewData.nextReview = calculateNextReview(reviewData.masteryLevel);
    }

    await updateProfile(updated);
    setScreen('reviewScreen');
  };

  if (screen === 'reviewScreen') {
    return <ReviewScreen profile={currentProfile} onReviewLetter={handleReviewLetter} onBack={() => setScreen('map')} />;
  }

  if (screen === 'review') {
    const { letter } = currentLevel;
    const isVowel = [...ALL_VOWELS_HARD, ...ALL_VOWELS_SOFT].includes(letter);
    const pool = isVowel
      ? [...ALL_VOWELS_HARD, ...ALL_VOWELS_SOFT].filter(v => v !== letter)
      : ALL_CONSONANTS.filter(c => c !== letter);

    return <BubbleGame target={letter} pool={pool} onComplete={handleReviewComplete} onBack={() => setScreen('reviewScreen')} />;
  }

  if (screen === 'map') {
    return (
      <>
        <MapScreen profile={currentProfile} onSelect={handleSelect} onEvolution={() => setScreen('evolution')} onStats={() => setScreen('stats')} onReview={() => setScreen('reviewScreen')} onParent={() => setScreen('parent')} onShop={() => setScreen('shop')} onGarage={() => setScreen('garage')} onAchievements={() => setScreen('achievements')} onDailyChallenges={() => setScreen('dailyChallenges')} />

        {/* Session End Modal */}
        {showSessionEnd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md text-center animate-bounce">
              <div className="text-7xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Время занятий закончилось!</h2>
              <p className="text-gray-600 mb-2">Ты занимался 20 минут - это отлично! 🎉</p>
              <p className="text-sm text-gray-500 mb-6">Отдохни немного и возвращайся завтра</p>
              <button
                onClick={() => {
                  setShowSessionEnd(false);
                  setSessionTime(0);
                  setScreen('profiles');
                }}
                className="bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-600 transition-all"
              >
                Закончить
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

// Render the component when loaded
function GameWrapper() {
  return (
    <>
      <button
        onClick={() => window.location.href = '/'}
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all shadow-lg"
      >
        ← Назад
      </button>
      <ReadingGame />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<GameWrapper />);
