import { useState, useEffect, useCallback } from 'react';

// Данные
const VOWELS_HARD = ['А', 'О', 'У', 'Ы', 'Э'];
const VOWELS_SOFT = ['Я', 'Ё', 'Ю', 'И', 'Е'];
const CONSONANTS = ['М', 'Л', 'Н', 'Р', 'С', 'К', 'П', 'Т'];

const SYLLABLES = {};
CONSONANTS.forEach(c => {
  SYLLABLES[c] = {
    hard: VOWELS_HARD.map(v => c + v),
    soft: VOWELS_SOFT.map(v => c + v),
  };
});

const WORDS_BY_LEVEL = {
  1: [
    { word: 'МА-МА', display: 'МАМА', image: '👩', syllables: ['МА', 'МА'] },
    { word: 'ПА-ПА', display: 'ПАПА', image: '👨', syllables: ['ПА', 'ПА'] },
  ],
  2: [
    { word: 'ЛУ-НА', display: 'ЛУНА', image: '🌙', syllables: ['ЛУ', 'НА'] },
    { word: 'РУ-КА', display: 'РУКА', image: '✋', syllables: ['РУ', 'КА'] },
  ],
  3: [
    { word: 'МО-ЛО-КО', display: 'МОЛОКО', image: '🥛', syllables: ['МО', 'ЛО', 'КО'] },
    { word: 'СО-РО-КА', display: 'СОРОКА', image: '🐦', syllables: ['СО', 'РО', 'КА'] },
  ],
  4: [
    { word: 'КО-РО-НА', display: 'КОРОНА', image: '👑', syllables: ['КО', 'РО', 'НА'] },
    { word: 'РА-КЕ-ТА', display: 'РАКЕТА', image: '🚀', syllables: ['РА', 'КЕ', 'ТА'] },
  ],
};

const SENTENCES = [
  { text: 'МАМА МЫЛА РАМУ', words: ['МАМА', 'МЫЛА', 'РАМУ'], image: '🪟' },
  { text: 'ЛУНА НА НЕБЕ', words: ['ЛУНА', 'НА', 'НЕБЕ'], image: '🌙' },
];

const CHARACTERS = [
  { id: 'fox', name: 'Лисёнок', emoji: '🦊', color: '#FF9F43' },
  { id: 'bunny', name: 'Зайка', emoji: '🐰', color: '#A8E6CF' },
  { id: 'bear', name: 'Мишка', emoji: '🐻', color: '#FFEAA7' },
];

const CARS = [
  { id: 'car1', name: 'Красная', emoji: '🚗', price: 10, color: '#e74c3c' },
  { id: 'car2', name: 'Синяя', emoji: '🚙', price: 15, color: '#3498db' },
  { id: 'car3', name: 'Такси', emoji: '🚕', price: 20, color: '#f1c40f' },
  { id: 'car4', name: 'Полиция', emoji: '🚓', price: 30, color: '#2c3e50' },
  { id: 'car5', name: 'Скорая', emoji: '🚑', price: 35, color: '#ecf0f1' },
  { id: 'car6', name: 'Пожарная', emoji: '🚒', price: 40, color: '#c0392b' },
  { id: 'car7', name: 'Грузовик', emoji: '🚚', price: 50, color: '#95a5a6' },
  { id: 'car8', name: 'Гонка', emoji: '🏎️', price: 100, color: '#9b59b6' },
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#74b9ff', '#fd79a8'];

const pronounce = (text) => {
  const soundMap = { 'М': 'мм', 'Л': 'лл', 'Н': 'нн', 'Р': 'рр', 'С': 'сс', 'К': 'кк', 'П': 'пп', 'Т': 'тт' };
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

const getToday = () => new Date().toISOString().split('T')[0];

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

// Гараж
const Garage = ({ ownedCars, onBack }) => {
  const speak = useSpeak();
  useEffect(() => { speak('Твой гараж'); }, [speak]);
  const cars = CARS.filter(c => ownedCars.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-600 to-slate-800 p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-3xl text-white">←</button>
        <h2 className="text-xl font-bold text-white ml-4">Мой гараж</h2>
      </div>
      
      {cars.length === 0 ? (
        <div className="text-center text-white/60 mt-20">
          <p className="text-6xl mb-4">🅿️</p>
          <p>Пока пусто. Купи машинки в магазине!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {cars.map(car => (
            <div key={car.id} className="bg-white/20 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-5xl mb-2">{car.emoji}</span>
              <span className="text-white text-sm">{car.name}</span>
            </div>
          ))}
        </div>
      )}
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

// Игры
const FindGame = ({ target, options, onComplete, onBack, title }) => {
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState(3);
  const [streak, setStreak] = useState(0);
  const [key, setKey] = useState(0);
  const speak = useSpeak();
  const targetScore = 5;

  useEffect(() => { speak(target); }, [target, speak]);

  useEffect(() => {
    const pool = options.filter(o => o !== target);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const wrong = shuffled.slice(0, Math.min(difficulty - 1, shuffled.length));
    const all = [target, ...wrong].sort(() => Math.random() - 0.5);
    setItems(all.map((v, i) => ({ id: `${key}-${i}`, value: v, x: 12 + (i % 3) * 30 + Math.random() * 10, y: 15 + Math.floor(i / 3) * 28 + Math.random() * 8 })));
  }, [target, options, difficulty, key]);

  const handleTap = (item) => {
    speak(item.value);
    if (item.value === target) {
      const ns = score + 1;
      setScore(ns);
      setStreak(streak + 1);
      if (streak + 1 >= 3 && difficulty < 5) setDifficulty(d => d + 1);
      if (ns >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(3), 1500);
      } else {
        setTimeout(() => setKey(k => k + 1), 300);
      }
    } else {
      setStreak(0);
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
        {items.map(item => (
          <button key={item.id} onClick={() => handleTap(item)}
            className="absolute w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold bg-white shadow-lg hover:scale-110 active:scale-95"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            {item.value}
          </button>
        ))}
      </div>
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
    speak(b.value);
    setBubbles(p => p.filter(x => x.id !== b.id));
    if (b.value === target) {
      const ns = score + 1;
      setScore(ns);
      if (ns >= targetScore) {
        setShowConfetti(true);
        setTimeout(() => onComplete(3), 1500);
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
        {bubbles.map(b => (
          <button key={b.id} onClick={() => pop(b)}
            className="absolute w-14 h-14 rounded-full flex items-center justify-center text-base font-bold bg-white/90 shadow-lg hover:scale-110"
            style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}>
            {b.value}
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
  const speak = useSpeak();

  useEffect(() => { speak('Читай'); }, [speak]);

  const handleTap = () => {
    speak(wordData.syllables[idx], 0.5);
    if (idx + 1 >= wordData.syllables.length) {
      setTimeout(() => { speak(wordData.display, 0.7); setShowConfetti(true); setTimeout(() => onComplete(2), 1800); }, 600);
    } else setIdx(idx + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-400 to-teal-600 p-4 flex flex-col items-center justify-center">
      <Confetti active={showConfetti} />
      <button onClick={onBack} className="absolute top-4 left-4 text-3xl text-white">←</button>
      <span className="text-6xl mb-4">{wordData.image}</span>
      <div className="flex gap-2 mb-6">
        {wordData.syllables.map((s, i) => (
          <div key={i} className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold ${
            i < idx ? 'bg-green-400 text-white' : i === idx ? 'bg-yellow-400 text-gray-800 scale-110 animate-pulse' : 'bg-white/50 text-gray-500'
          }`}>{s}</div>
        ))}
      </div>
      <button onClick={handleTap} className="bg-white text-teal-600 text-lg font-bold py-3 px-8 rounded-full">
        Читай: {wordData.syllables[idx]}
      </button>
    </div>
  );
};

const ReadSentenceGame = ({ sentence, onComplete, onBack }) => {
  const [idx, setIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const speak = useSpeak();

  useEffect(() => { speak('Читай предложение'); }, [speak]);

  const handleTap = (i) => {
    if (i !== idx) return;
    speak(sentence.words[i], 0.6);
    if (idx + 1 >= sentence.words.length) {
      setTimeout(() => { speak(sentence.text, 0.7); setShowConfetti(true); setTimeout(() => onComplete(3), 2000); }, 600);
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

// Карта
const MapScreen = ({ profile, onSelect, onShop, onGarage, onStats }) => {
  const total = VOWELS_HARD.length + CONSONANTS.length;
  const done = profile.progress.letters.filter(p => p).length;
  const wu = [done >= 4, done >= 6, done >= 8, done >= 10];
  const su = profile.progress.words[3];
  const char = CHARACTERS.find(c => c.id === profile.character);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-indigo-500 p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 bg-white/20 rounded-full py-1 px-3">
          <span className="text-xl">{char?.emoji}</span>
          <span className="text-white font-bold text-sm">{profile.name}</span>
        </div>
        <div className="bg-yellow-400 rounded-full py-1 px-3">
          <span className="font-bold text-gray-800">⭐ {profile.stars || 0}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={onShop} className="flex-1 bg-orange-400 text-white py-2 rounded-xl font-bold text-sm">🏪 Магазин</button>
        <button onClick={onGarage} className="flex-1 bg-slate-600 text-white py-2 rounded-xl font-bold text-sm">🚗 Гараж ({profile.cars?.length || 0})</button>
        <button onClick={onStats} className="flex-1 bg-violet-500 text-white py-2 rounded-xl font-bold text-sm">📊 Стат</button>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        <section>
          <p className="text-white/70 text-xs mb-1">Гласные</p>
          <div className="flex gap-1 flex-wrap">
            {VOWELS_HARD.map((v, i) => {
              const ul = i === 0 || profile.progress.letters[i - 1];
              const dn = profile.progress.letters[i];
              return (
                <button key={v} onClick={() => ul && onSelect('letter', i)} disabled={!ul}
                  className={`w-10 h-10 rounded-lg text-lg font-bold ${dn ? 'bg-green-400 text-white' : ul ? 'bg-pink-400 text-white' : 'bg-gray-400/50 text-gray-300'}`}>
                  {dn ? '✓' : v}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-white/70 text-xs mb-1">Согласные + склады</p>
          <div className="flex gap-1 flex-wrap">
            {CONSONANTS.map((c, i) => {
              const gi = VOWELS_HARD.length + i;
              const ul = profile.progress.letters[gi - 1];
              const dn = profile.progress.letters[gi];
              return (
                <button key={c} onClick={() => ul && onSelect('letter', gi)} disabled={!ul}
                  className={`w-10 h-10 rounded-lg text-lg font-bold ${dn ? 'bg-green-400 text-white' : ul ? 'bg-indigo-400 text-white' : 'bg-gray-400/50 text-gray-300'}`}>
                  {dn ? '✓' : c}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-white/70 text-xs mb-1">Слова</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(l => (
              <button key={l} onClick={() => wu[l - 1] && onSelect('words', l)} disabled={!wu[l - 1]}
                className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center ${
                  wu[l - 1] ? (profile.progress.words[l - 1] ? 'bg-green-400' : 'bg-gradient-to-br from-yellow-400 to-orange-500') : 'bg-gray-400/50'
                } text-white`}>
                <span>{profile.progress.words[l - 1] ? '✓' : '📖'}</span>
                <span className="text-xs">{l}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <button onClick={() => su && onSelect('sentences', 0)} disabled={!su}
            className={`w-full py-3 rounded-lg font-bold ${su ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-400/50 text-gray-300'}`}>
            {profile.progress.sentences ? '✓ Предложения' : '📚 Предложения'}
          </button>
        </section>
      </div>
    </div>
  );
};

// Главный компонент
export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [screen, setScreen] = useState('loading');
  const [currentLevel, setCurrentLevel] = useState({ type: null, idx: 0 });
  const [loaded, setLoaded] = useState(false);

  // Загрузка
  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get('profiles');
        if (res?.value) setProfiles(JSON.parse(res.value));
      } catch (e) {}
      setLoaded(true);
      setScreen('profiles');
    };
    load();
  }, []);

  // Сохранение
  const save = async (newProfiles) => {
    setProfiles(newProfiles);
    try { await window.storage.set('profiles', JSON.stringify(newProfiles)); } catch (e) {}
  };

  const updateProfile = async (updated) => {
    const np = profiles.map(p => p.id === updated.id ? updated : p);
    setCurrentProfile(updated);
    await save(np);
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
        letters: Array(VOWELS_HARD.length + CONSONANTS.length).fill(false),
        words: [false, false, false, false],
        sentences: false,
      },
    };
    await save([...profiles, newProfile]);
    setCurrentProfile(newProfile);
    setScreen('map');
  };

  const handleDeleteProfile = async (id) => {
    await save(profiles.filter(p => p.id !== id));
  };

  const handleSelect = (type, idx) => {
    setCurrentLevel({ type, idx });
    setScreen('level');
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

  if (!loaded) return <div className="min-h-screen bg-indigo-600 flex items-center justify-center text-white text-xl">Загрузка...</div>;

  if (screen === 'profiles') {
    return <ProfileSelect profiles={profiles} onSelect={p => { setCurrentProfile(p); setScreen('map'); }} onCreate={() => setScreen('create')} onDelete={handleDeleteProfile} />;
  }
  if (screen === 'create') return <CreateProfile onBack={() => setScreen('profiles')} onCreate={handleCreateProfile} />;
  if (screen === 'shop') return <Shop stars={currentProfile.stars} ownedCars={currentProfile.cars || []} onBuy={handleBuyCar} onBack={() => setScreen('map')} />;
  if (screen === 'garage') return <Garage ownedCars={currentProfile.cars || []} onBack={() => setScreen('map')} />;
  if (screen === 'stats') return <Stats stats={currentProfile.stats} onBack={() => setScreen('map')} />;

  if (screen === 'level') {
    if (currentLevel.type === 'letter') return <LetterLevel letterIdx={currentLevel.idx} onComplete={handleComplete} onBack={() => setScreen('map')} />;
    if (currentLevel.type === 'words') return <WordsLevel level={currentLevel.idx} onComplete={handleComplete} onBack={() => setScreen('map')} />;
    if (currentLevel.type === 'sentences') return <SentenceLevel onComplete={handleComplete} onBack={() => setScreen('map')} />;
  }

  if (screen === 'map') {
    return <MapScreen profile={currentProfile} onSelect={handleSelect} onShop={() => setScreen('shop')} onGarage={() => setScreen('garage')} onStats={() => setScreen('stats')} />;
  }

  return null;
}
