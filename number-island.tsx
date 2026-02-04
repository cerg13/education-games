// React hooks from global React (loaded via CDN)
const { useState, useEffect, useCallback, useRef, useMemo } = React;

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
const updateProfileAPI = (id, profile) => fetchAPI(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(profile) });

// ============ GAME DATA ============

// Numlings - цифрята
const NUMLINGS = [
  { id: 1, name: 'Уно', emoji: '🔵', color: '#3B82F6', trait: 'Любопытный', unlocked: true },
  { id: 2, name: 'Двушка', emoji: '🐰', color: '#EC4899', trait: 'Дружелюбный', unlocked: false },
  { id: 3, name: 'Трио', emoji: '🔺', color: '#F59E0B', trait: 'Весёлый', unlocked: false },
  { id: 4, name: 'Квадрик', emoji: '🟧', color: '#10B981', trait: 'Надёжный', unlocked: false },
  { id: 5, name: 'Пятнышко', emoji: '🐞', color: '#EF4444', trait: 'Активный', unlocked: false },
  { id: 6, name: 'Шестик', emoji: '🐛', color: '#8B5CF6', trait: 'Трудолюбивый', unlocked: false },
  { id: 7, name: 'Семицветик', emoji: '🌈', color: '#06B6D4', trait: 'Мечтательный', unlocked: false },
  { id: 8, name: 'Осьминожка', emoji: '🐙', color: '#F472B6', trait: 'Добрый', unlocked: false },
  { id: 9, name: 'Девятка', emoji: '🎈', color: '#A855F7', trait: 'Лёгкий', unlocked: false },
  { id: 10, name: 'Десяточка', emoji: '👑', color: '#FBBF24', trait: 'Мудрый', unlocked: false },
];

// Biomes - биомы острова
const BIOMES = [
  { id: 'beach', name: 'Пляж Ракушек', emoji: '🏖️', color: '#FDE68A', numbers: [1, 2, 3], skill: 'Счёт до 3', unlocked: true, requiredShells: 0 },
  { id: 'jungle', name: 'Фруктовые Джунгли', emoji: '🌴', color: '#4ADE80', numbers: [1, 2, 3, 4, 5], skill: 'Счёт до 5', unlocked: false, requiredShells: 10 },
  { id: 'mushroom', name: 'Грибная Поляна', emoji: '🍄', color: '#C084FC', numbers: [1, 2, 3, 4, 5, 6, 7], skill: 'Сложение', unlocked: false, requiredShells: 25 },
  { id: 'crystal', name: 'Кристальные Пещеры', emoji: '💎', color: '#38BDF8', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], skill: 'Декомпозиция', unlocked: false, requiredShells: 50 },
  { id: 'rainbow', name: 'Вершина Радуги', emoji: '🌈', color: '#FB7185', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], skill: 'Все навыки', unlocked: false, requiredShells: 100 },
];

// Activity types
const ACTIVITY_TYPES = {
  collect: { name: 'Сбор', emoji: '🧺', instruction: 'Собери нужное количество!' },
  feed: { name: 'Кормление', emoji: '🍎', instruction: 'Покорми Цифрёнка!' },
  build: { name: 'Строительство', emoji: '🌉', instruction: 'Построй мост!' },
  compare: { name: 'Сравнение', emoji: '⚖️', instruction: 'Кто больше?' },
  find: { name: 'Поиск', emoji: '🔍', instruction: 'Найди всех!' },
  sum: { name: 'Сложение', emoji: '➕', instruction: 'Собери сумму!' },
};

// Default game state
const defaultGameState = {
  shells: 0,
  crystals: 0,
  unlockedNumlings: [1],
  unlockedBiomes: ['beach'],
  completedTasks: [],
  stickers: [],
  currentBiome: 'beach',
  totalTasks: 0,
};

// ============ SOUND SYSTEM ============
const useSound = () => {
  const audioCtx = useRef(null);

  const getCtx = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  };

  const playNote = (freq, duration, type = 'sine', vol = 0.2) => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + duration);
    } catch(e) {}
  };

  return {
    playCollect: () => { playNote(523, 0.1); playNote(659, 0.1); },
    playSuccess: () => { playNote(523, 0.15); setTimeout(() => playNote(659, 0.15), 100); setTimeout(() => playNote(784, 0.2), 200); },
    playClick: () => playNote(440, 0.05),
    playError: () => playNote(200, 0.2, 'sawtooth', 0.1),
    playUnlock: () => { [523, 587, 659, 784, 880].forEach((f, i) => setTimeout(() => playNote(f, 0.15), i * 80)); },
  };
};

// ============ COMPONENTS ============

// Particles background
const Particles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-30"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: 'white',
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Numling character display
const NumlingAvatar = ({ numling, size = 'md', showName = true, onClick, isSelected }) => {
  const sizes = { sm: 'w-12 h-12 text-2xl', md: 'w-20 h-20 text-4xl', lg: 'w-28 h-28 text-6xl' };

  return (
    <div
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      onClick={onClick}
    >
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center shadow-lg ${isSelected ? 'ring-4 ring-white' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${numling.color}, ${numling.color}99)`,
          animation: 'bounce 2s ease-in-out infinite',
        }}
      >
        <span>{numling.emoji}</span>
      </div>
      {showName && (
        <div className="mt-1 text-center">
          <div className="text-white font-bold text-sm">{numling.name}</div>
          <div className="text-white/70 text-xs">{numling.id}</div>
        </div>
      )}
    </div>
  );
};

// Island Map
const IslandMap = ({ gameState, onSelectBiome, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-500 to-blue-600 p-4">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all"
        >
          ← Домой
        </button>
        <div className="flex gap-3">
          <div className="bg-yellow-400/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="text-xl">🐚</span>
            <span className="font-bold text-yellow-900">{gameState.shells}</span>
          </div>
          <div className="bg-purple-400/90 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="text-xl">💎</span>
            <span className="font-bold text-purple-900">{gameState.crystals}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-white drop-shadow-lg">🏝️ Остров Цифр</h1>
        <p className="text-white/80 mt-1">Выбери место для приключения!</p>
      </div>

      {/* Biomes Grid */}
      <div className="grid gap-4 max-w-lg mx-auto">
        {BIOMES.map((biome, idx) => {
          const isUnlocked = gameState.unlockedBiomes.includes(biome.id);
          const canUnlock = gameState.shells >= biome.requiredShells;

          return (
            <button
              key={biome.id}
              onClick={() => isUnlocked && onSelectBiome(biome.id)}
              disabled={!isUnlocked}
              className={`
                relative p-4 rounded-2xl transition-all
                ${isUnlocked
                  ? 'bg-white/20 backdrop-blur hover:bg-white/30 hover:scale-102 active:scale-98'
                  : 'bg-black/20 backdrop-blur opacity-60'}
              `}
              style={isUnlocked ? { borderLeft: `4px solid ${biome.color}` } : {}}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ background: isUnlocked ? biome.color : '#666' }}
                >
                  {isUnlocked ? biome.emoji : '🔒'}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold text-lg">{biome.name}</div>
                  <div className="text-white/70 text-sm">
                    {isUnlocked ? (
                      <>Числа: {biome.numbers.join(', ')}</>
                    ) : (
                      <>Нужно: {biome.requiredShells} 🐚</>
                    )}
                  </div>
                  <div className="text-white/50 text-xs mt-1">{biome.skill}</div>
                </div>
                {isUnlocked && (
                  <div className="text-2xl">▶️</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Collected Numlings */}
      <div className="mt-8 text-center">
        <h2 className="text-white font-bold mb-3">Мои друзья-Цифрята</h2>
        <div className="flex justify-center gap-2 flex-wrap">
          {NUMLINGS.map(n => (
            <div
              key={n.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                gameState.unlockedNumlings.includes(n.id)
                  ? ''
                  : 'grayscale opacity-40'
              }`}
              style={{ background: n.color }}
            >
              {gameState.unlockedNumlings.includes(n.id) ? n.emoji : '?'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Activity: Collect items
const CollectActivity = ({ biome, targetNumber, onComplete, onBack, sound }) => {
  const [collected, setCollected] = useState(0);
  const [items, setItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const biomeData = BIOMES.find(b => b.id === biome);
  const itemEmoji = biome === 'beach' ? '🐚' : biome === 'jungle' ? '🍎' : biome === 'mushroom' ? '🍄' : '💎';

  useEffect(() => {
    // Generate random items
    const newItems = Array.from({ length: targetNumber + 3 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 30 + Math.random() * 50,
      collected: false,
    }));
    setItems(newItems);
  }, [targetNumber]);

  const handleCollect = (id) => {
    if (collected >= targetNumber) return;

    sound.playCollect();
    setItems(prev => prev.map(item => item.id === id ? { ...item, collected: true } : item));
    setCollected(prev => {
      const next = prev + 1;
      if (next === targetNumber) {
        setTimeout(() => {
          sound.playSuccess();
          setShowSuccess(true);
          setTimeout(() => onComplete(targetNumber), 1500);
        }, 300);
      }
      return next;
    });
  };

  const numling = NUMLINGS[targetNumber - 1];

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ background: `linear-gradient(to bottom, ${biomeData.color}99, ${biomeData.color}44)` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="bg-white/20 text-white px-4 py-2 rounded-xl">
          ← Назад
        </button>
        <div className="bg-white/90 px-6 py-2 rounded-full shadow-lg">
          <span className="text-2xl font-bold">{collected} / {targetNumber}</span>
        </div>
      </div>

      {/* Task description */}
      <div className="bg-white/90 rounded-2xl p-4 mb-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl" style={{ background: numling.color, borderRadius: '50%', padding: '8px' }}>
            {numling.emoji}
          </div>
          <div>
            <div className="font-bold text-lg">Помоги {numling.name}!</div>
            <div className="text-gray-600">Собери {targetNumber} {itemEmoji}</div>
          </div>
        </div>
      </div>

      {/* Game area with items */}
      <div className="relative h-96 bg-white/10 rounded-2xl">
        {items.map(item => !item.collected && (
          <button
            key={item.id}
            onClick={() => handleCollect(item.id)}
            className="absolute text-4xl hover:scale-125 active:scale-90 transition-transform cursor-pointer"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              animation: 'float 2s ease-in-out infinite',
              animationDelay: `${item.id * 0.2}s`,
            }}
          >
            {itemEmoji}
          </button>
        ))}

        {/* Progress basket */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-100 rounded-2xl p-3 flex gap-1">
          {Array.from({ length: targetNumber }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl ${
                i < collected ? 'bg-amber-400' : 'bg-amber-200'
              }`}
            >
              {i < collected ? itemEmoji : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600">Отлично!</div>
            <div className="text-gray-600">+{targetNumber} 🐚</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Activity: Compare numbers
const CompareActivity = ({ biome, num1, num2, onComplete, onBack, sound }) => {
  const [result, setResult] = useState(null);

  const numling1 = NUMLINGS[num1 - 1];
  const numling2 = NUMLINGS[num2 - 1];
  const biomeData = BIOMES.find(b => b.id === biome);

  const handleChoice = (chosen) => {
    const correct = chosen === Math.max(num1, num2);
    if (correct) {
      sound.playSuccess();
      setResult('correct');
      setTimeout(() => onComplete(2), 1500);
    } else {
      sound.playError();
      setResult('wrong');
      setTimeout(() => setResult(null), 1000);
    }
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: `linear-gradient(to bottom, ${biomeData.color}99, ${biomeData.color}44)` }}
    >
      <button onClick={onBack} className="bg-white/20 text-white px-4 py-2 rounded-xl mb-4">
        ← Назад
      </button>

      <div className="bg-white/90 rounded-2xl p-4 mb-6 text-center shadow-lg">
        <div className="text-xl font-bold">⚖️ Кто больше?</div>
        <div className="text-gray-600">Нажми на большее число!</div>
      </div>

      <div className="flex justify-center items-center gap-8 mt-12">
        {/* First numling */}
        <button
          onClick={() => handleChoice(num1)}
          className={`p-6 rounded-3xl transition-all hover:scale-110 active:scale-95 ${
            result === 'correct' && num1 > num2 ? 'ring-4 ring-green-400' :
            result === 'wrong' && num1 < num2 ? 'ring-4 ring-red-400' : ''
          }`}
          style={{ background: numling1.color }}
        >
          <div className="text-6xl mb-2">{numling1.emoji}</div>
          <div className="text-white font-bold text-3xl">{num1}</div>
          <div className="text-white/80">{numling1.name}</div>
          {/* Visual dots */}
          <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-20">
            {Array.from({ length: num1 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full" />
            ))}
          </div>
        </button>

        <div className="text-4xl text-white font-bold">VS</div>

        {/* Second numling */}
        <button
          onClick={() => handleChoice(num2)}
          className={`p-6 rounded-3xl transition-all hover:scale-110 active:scale-95 ${
            result === 'correct' && num2 > num1 ? 'ring-4 ring-green-400' :
            result === 'wrong' && num2 < num1 ? 'ring-4 ring-red-400' : ''
          }`}
          style={{ background: numling2.color }}
        >
          <div className="text-6xl mb-2">{numling2.emoji}</div>
          <div className="text-white font-bold text-3xl">{num2}</div>
          <div className="text-white/80">{numling2.name}</div>
          <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-20">
            {Array.from({ length: num2 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full" />
            ))}
          </div>
        </button>
      </div>

      {result === 'correct' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600">Правильно!</div>
            <div className="text-gray-600">+2 🐚</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Activity: Sum (find combination)
const SumActivity = ({ biome, targetSum, onComplete, onBack, sound }) => {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  const biomeData = BIOMES.find(b => b.id === biome);
  const currentSum = selected.reduce((a, b) => a + b, 0);

  const options = useMemo(() => {
    // Generate options that can form the target sum
    const opts = [];
    for (let i = 1; i <= Math.min(targetSum - 1, 5); i++) {
      opts.push(i);
    }
    // Add some extra numbers
    opts.push(Math.ceil(targetSum / 2));
    return [...new Set(opts)].sort(() => Math.random() - 0.5).slice(0, 6);
  }, [targetSum]);

  const handleSelect = (num) => {
    sound.playClick();
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else {
      const newSelected = [...selected, num];
      const newSum = newSelected.reduce((a, b) => a + b, 0);

      if (newSum === targetSum) {
        sound.playSuccess();
        setResult('correct');
        setTimeout(() => onComplete(3), 1500);
      } else if (newSum > targetSum) {
        sound.playError();
        setResult('over');
        setTimeout(() => {
          setResult(null);
          setSelected([]);
        }, 1000);
      } else {
        setSelected(newSelected);
      }
    }
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: `linear-gradient(to bottom, ${biomeData.color}99, ${biomeData.color}44)` }}
    >
      <button onClick={onBack} className="bg-white/20 text-white px-4 py-2 rounded-xl mb-4">
        ← Назад
      </button>

      <div className="bg-white/90 rounded-2xl p-4 mb-6 text-center shadow-lg">
        <div className="text-xl font-bold">➕ Собери сумму!</div>
        <div className="text-gray-600">Выбери числа, чтобы получить <span className="font-bold text-2xl">{targetSum}</span></div>
      </div>

      {/* Current sum display */}
      <div className="bg-white/90 rounded-2xl p-4 mb-6 text-center">
        <div className="text-4xl font-bold" style={{ color: currentSum === targetSum ? '#22C55E' : currentSum > targetSum ? '#EF4444' : '#3B82F6' }}>
          {selected.length > 0 ? selected.join(' + ') + ' = ' + currentSum : '?'}
        </div>
      </div>

      {/* Number options */}
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {options.map((num, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(num)}
            className={`
              p-4 rounded-2xl text-3xl font-bold transition-all
              ${selected.includes(num)
                ? 'bg-blue-500 text-white scale-95'
                : 'bg-white hover:scale-105 active:scale-95'}
            `}
          >
            {num}
            <div className="flex justify-center gap-0.5 mt-1">
              {Array.from({ length: num }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${selected.includes(num) ? 'bg-white' : 'bg-blue-400'}`} />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Reset button */}
      <div className="text-center mt-6">
        <button
          onClick={() => setSelected([])}
          className="bg-white/50 text-gray-700 px-6 py-2 rounded-xl"
        >
          🔄 Начать заново
        </button>
      </div>

      {result === 'correct' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-2xl font-bold text-green-600">{selected.join(' + ')} = {targetSum}!</div>
            <div className="text-gray-600">+3 🐚</div>
          </div>
        </div>
      )}

      {result === 'over' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">😅</div>
            <div className="text-xl font-bold text-orange-600">Слишком много!</div>
            <div className="text-gray-600">Попробуй ещё раз</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Biome Scene with activities
const BiomeScene = ({ biome, gameState, onComplete, onBack, sound }) => {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [activityData, setActivityData] = useState(null);

  const biomeData = BIOMES.find(b => b.id === biome);

  const generateActivity = () => {
    const maxNum = Math.max(...biomeData.numbers);
    const types = ['collect', 'compare'];
    if (biome === 'mushroom' || biome === 'crystal' || biome === 'rainbow') {
      types.push('sum');
    }

    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case 'collect':
        const target = biomeData.numbers[Math.floor(Math.random() * biomeData.numbers.length)];
        setActivityData({ targetNumber: target });
        break;
      case 'compare':
        const n1 = biomeData.numbers[Math.floor(Math.random() * biomeData.numbers.length)];
        let n2 = biomeData.numbers[Math.floor(Math.random() * biomeData.numbers.length)];
        while (n2 === n1) {
          n2 = biomeData.numbers[Math.floor(Math.random() * biomeData.numbers.length)];
        }
        setActivityData({ num1: n1, num2: n2 });
        break;
      case 'sum':
        const sum = 3 + Math.floor(Math.random() * (maxNum - 2));
        setActivityData({ targetSum: sum });
        break;
    }
    setCurrentActivity(type);
  };

  const handleActivityComplete = (shells) => {
    setCurrentActivity(null);
    onComplete(shells, biome);
  };

  if (currentActivity === 'collect' && activityData) {
    return (
      <CollectActivity
        biome={biome}
        targetNumber={activityData.targetNumber}
        onComplete={handleActivityComplete}
        onBack={() => setCurrentActivity(null)}
        sound={sound}
      />
    );
  }

  if (currentActivity === 'compare' && activityData) {
    return (
      <CompareActivity
        biome={biome}
        num1={activityData.num1}
        num2={activityData.num2}
        onComplete={handleActivityComplete}
        onBack={() => setCurrentActivity(null)}
        sound={sound}
      />
    );
  }

  if (currentActivity === 'sum' && activityData) {
    return (
      <SumActivity
        biome={biome}
        targetSum={activityData.targetSum}
        onComplete={handleActivityComplete}
        onBack={() => setCurrentActivity(null)}
        sound={sound}
      />
    );
  }

  // Biome hub screen
  return (
    <div
      className="min-h-screen p-4"
      style={{ background: `linear-gradient(135deg, ${biomeData.color}, ${biomeData.color}99)` }}
    >
      <Particles />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="bg-white/20 text-white px-4 py-2 rounded-xl">
          ← Карта
        </button>
        <div className="flex gap-2">
          <div className="bg-yellow-400/90 px-3 py-1 rounded-full flex items-center gap-1">
            <span>🐚</span>
            <span className="font-bold text-yellow-900">{gameState.shells}</span>
          </div>
        </div>
      </div>

      {/* Biome title */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-2">{biomeData.emoji}</div>
        <h1 className="text-3xl font-black text-white drop-shadow-lg">{biomeData.name}</h1>
        <p className="text-white/80 mt-1">{biomeData.skill}</p>
      </div>

      {/* Numlings in this biome */}
      <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6">
        <h2 className="text-white font-bold mb-3 text-center">Цифрята здесь:</h2>
        <div className="flex justify-center gap-3 flex-wrap">
          {biomeData.numbers.map(num => {
            const numling = NUMLINGS[num - 1];
            const isUnlocked = gameState.unlockedNumlings.includes(num);
            return (
              <div
                key={num}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${!isUnlocked && 'grayscale opacity-50'}`}
                style={{ background: numling.color }}
              >
                {numling.emoji}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity buttons */}
      <div className="space-y-3 max-w-sm mx-auto">
        <button
          onClick={generateActivity}
          className="w-full bg-white/90 text-gray-800 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:scale-102 active:scale-98 transition-all shadow-lg"
        >
          <span className="text-2xl">🎮</span>
          Начать задание!
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-10 text-6xl opacity-30" style={{ animation: 'float 3s ease-in-out infinite' }}>
        {biomeData.emoji}
      </div>
      <div className="absolute bottom-20 right-10 text-4xl opacity-20" style={{ animation: 'float 4s ease-in-out infinite' }}>
        {biomeData.emoji}
      </div>
    </div>
  );
};

// Home Hub
const HomeHub = ({ profile, gameState, onExplore, onCollection, sound }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-200 via-amber-100 to-sky-200 p-4 relative overflow-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wave { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes sparkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>

      <Particles />

      {/* Stats bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-lg">
          <span className="font-bold text-gray-800">{profile?.name || 'Исследователь'}</span>
        </div>
        <div className="flex gap-2">
          <div className="bg-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="text-xl">🐚</span>
            <span className="font-bold text-yellow-900">{gameState.shells}</span>
          </div>
          <div className="bg-purple-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <span className="text-xl">💎</span>
            <span className="font-bold text-purple-900">{gameState.crystals}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-amber-800 drop-shadow">🏝️ Остров Цифр</h1>
        <p className="text-amber-700 mt-2">Добро пожаловать, исследователь!</p>
      </div>

      {/* House illustration */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="text-8xl" style={{ animation: 'wave 3s ease-in-out infinite' }}>🏠</div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-4xl">🌴</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-4 max-w-sm mx-auto">
        <button
          onClick={onExplore}
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:scale-102 active:scale-98 transition-all shadow-xl"
        >
          <span className="text-3xl">🗺️</span>
          Исследовать остров
        </button>

        <button
          onClick={onCollection}
          className="w-full bg-gradient-to-r from-purple-400 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-102 active:scale-98 transition-all shadow-lg"
        >
          <span className="text-2xl">👥</span>
          Мои Цифрята ({gameState.unlockedNumlings.length}/10)
        </button>
      </div>

      {/* Progress info */}
      <div className="mt-8 bg-white/60 backdrop-blur rounded-2xl p-4 max-w-sm mx-auto">
        <div className="text-center text-gray-700">
          <div className="font-bold">Прогресс</div>
          <div className="flex justify-center gap-4 mt-2">
            <div>
              <div className="text-2xl">🏝️</div>
              <div className="text-sm">{gameState.unlockedBiomes.length}/5</div>
            </div>
            <div>
              <div className="text-2xl">🎮</div>
              <div className="text-sm">{gameState.totalTasks}</div>
            </div>
            <div>
              <div className="text-2xl">⭐</div>
              <div className="text-sm">{gameState.shells + gameState.crystals}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorations */}
      <div className="absolute bottom-4 left-4 text-4xl" style={{ animation: 'float 2s ease-in-out infinite' }}>🦀</div>
      <div className="absolute bottom-4 right-4 text-4xl" style={{ animation: 'float 2.5s ease-in-out infinite' }}>🐚</div>
    </div>
  );
};

// Numling Collection screen
const NumlingCollection = ({ gameState, onBack }) => {
  const [selectedNumling, setSelectedNumling] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 via-purple-600 to-indigo-700 p-4">
      <button onClick={onBack} className="bg-white/20 text-white px-4 py-2 rounded-xl mb-6">
        ← Назад
      </button>

      <h1 className="text-3xl font-black text-white text-center mb-6">👥 Мои Цифрята</h1>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {NUMLINGS.map(numling => {
          const isUnlocked = gameState.unlockedNumlings.includes(numling.id);

          return (
            <button
              key={numling.id}
              onClick={() => isUnlocked && setSelectedNumling(numling)}
              className={`
                p-4 rounded-2xl transition-all
                ${isUnlocked
                  ? 'bg-white/20 hover:bg-white/30'
                  : 'bg-black/20 opacity-50'}
              `}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2 ${!isUnlocked && 'grayscale'}`}
                style={{ background: numling.color }}
              >
                {isUnlocked ? numling.emoji : '🔒'}
              </div>
              <div className="text-white font-bold">{isUnlocked ? numling.name : '???'}</div>
              <div className="text-white/60 text-sm">{isUnlocked ? numling.trait : 'Найди меня!'}</div>
            </button>
          );
        })}
      </div>

      {/* Selected numling details */}
      {selectedNumling && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNumling(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-4"
              style={{ background: selectedNumling.color }}
            >
              {selectedNumling.emoji}
            </div>
            <h2 className="text-2xl font-bold text-center">{selectedNumling.name}</h2>
            <div className="text-center text-gray-500 mb-4">Число {selectedNumling.id}</div>
            <div className="text-center text-gray-700">
              <span className="font-bold">Характер:</span> {selectedNumling.trait}
            </div>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: selectedNumling.id }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{ background: selectedNumling.color }}
                />
              ))}
            </div>
            <button
              onClick={() => setSelectedNumling(null)}
              className="w-full mt-6 bg-gray-200 py-3 rounded-xl font-bold"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ MAIN COMPONENT ============

function NumberIsland() {
  const [screen, setScreen] = useState('loading');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [gameState, setGameState] = useState(defaultGameState);
  const [currentBiome, setCurrentBiome] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const sound = useSound();

  // Load profile and game state
  useEffect(() => {
    const load = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const profileId = urlParams.get('profile');

        if (profileId) {
          const profiles = await getProfiles();
          const profile = profiles.find(p => String(p.id) === String(profileId));
          if (profile) {
            setCurrentProfile(profile);
            if (profile.numberIslandData) {
              setGameState({ ...defaultGameState, ...profile.numberIslandData });
            }
          }
        }
      } catch (e) {
        console.error('Error loading:', e);
      }
      setLoaded(true);
      setScreen('home');
    };
    load();
  }, []);

  // Save game state
  const saveGameState = async (newState) => {
    setGameState(newState);
    if (currentProfile) {
      try {
        const updatedProfile = {
          ...currentProfile,
          numberIslandData: newState,
          stars: (currentProfile.stars || 0) + (newState.shells - gameState.shells),
        };
        await updateProfileAPI(currentProfile.id, updatedProfile);
        setCurrentProfile(updatedProfile);
      } catch (e) {
        console.error('Error saving:', e);
      }
    }
  };

  // Handle activity completion
  const handleActivityComplete = (shells, biomeId) => {
    const newState = {
      ...gameState,
      shells: gameState.shells + shells,
      totalTasks: gameState.totalTasks + 1,
    };

    // Check for new numling unlock
    const biome = BIOMES.find(b => b.id === biomeId);
    if (biome) {
      biome.numbers.forEach(num => {
        if (!newState.unlockedNumlings.includes(num) && Math.random() < 0.3) {
          newState.unlockedNumlings = [...newState.unlockedNumlings, num];
          sound.playUnlock();
        }
      });
    }

    // Check for biome unlocks
    BIOMES.forEach(b => {
      if (!newState.unlockedBiomes.includes(b.id) && newState.shells >= b.requiredShells) {
        newState.unlockedBiomes = [...newState.unlockedBiomes, b.id];
        sound.playUnlock();
      }
    });

    saveGameState(newState);
    setCurrentBiome(biomeId);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-sky-500 flex items-center justify-center">
        <div className="text-white text-xl">🏝️ Загрузка острова...</div>
      </div>
    );
  }

  // Render screens
  if (screen === 'home') {
    return (
      <HomeHub
        profile={currentProfile}
        gameState={gameState}
        onExplore={() => setScreen('map')}
        onCollection={() => setScreen('collection')}
        sound={sound}
      />
    );
  }

  if (screen === 'map') {
    return (
      <IslandMap
        gameState={gameState}
        onSelectBiome={(biomeId) => {
          setCurrentBiome(biomeId);
          setScreen('biome');
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'biome' && currentBiome) {
    return (
      <BiomeScene
        biome={currentBiome}
        gameState={gameState}
        onComplete={handleActivityComplete}
        onBack={() => setScreen('map')}
        sound={sound}
      />
    );
  }

  if (screen === 'collection') {
    return (
      <NumlingCollection
        gameState={gameState}
        onBack={() => setScreen('home')}
      />
    );
  }

  return null;
}

// Render wrapper
function GameWrapper() {
  return (
    <>
      <button
        onClick={() => window.location.href = '/'}
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all shadow-lg"
      >
        ← Меню
      </button>
      <NumberIsland />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<GameWrapper />);
