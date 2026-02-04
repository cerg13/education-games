// React hooks from global React (loaded via CDN)
const { useState, useCallback, useEffect, useRef } = React;

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

// Enhanced Sound System
const useSound = () => {
  const audioCtx = useRef(null);
  const musicOsc = useRef(null);
  const musicGain = useRef(null);
  
  const getCtx = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  };

  const playNote = (freq, duration, delay = 0, type = 'sine', vol = 0.2) => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(vol, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.01, ctx.currentTime + delay + duration);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + duration);
    } catch(e) {}
  };

  const playCorrect = () => {
    playNote(523, 0.15, 0, 'sine', 0.3);
    playNote(659, 0.15, 0.1, 'sine', 0.3);
    playNote(784, 0.2, 0.2, 'sine', 0.3);
  };

  const playWrong = () => {
    playNote(200, 0.15, 0, 'sawtooth', 0.2);
    playNote(150, 0.2, 0.15, 'sawtooth', 0.2);
  };

  const playClick = () => playNote(800, 0.05, 0, 'sine', 0.15);

  const playWin = () => {
    const notes = [523, 659, 784, 880, 1047];
    notes.forEach((n, i) => playNote(n, 0.2, i * 0.12, 'sine', 0.25));
  };

  const playUnlock = () => {
    playNote(400, 0.1, 0, 'triangle', 0.3);
    playNote(600, 0.1, 0.1, 'triangle', 0.3);
    playNote(800, 0.2, 0.2, 'triangle', 0.3);
  };

  const playStart = () => {
    playNote(440, 0.25, 0, 'square', 0.2);
    playNote(440, 0.25, 0.4, 'square', 0.2);
    playNote(880, 0.4, 0.8, 'square', 0.25);
  };

  const playEngine = () => {
    try {
      const ctx = getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(80, ctx.currentTime);
      o.frequency.setValueAtTime(120, ctx.currentTime + 0.05);
      o.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.setValueAtTime(0.01, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  const speakNumber = (num) => {
    if ('speechSynthesis' in window) {
      const words = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять'];
      const utterance = new SpeechSynthesisUtterance(words[num] || String(num));
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const startMusic = () => {
    try {
      const ctx = getCtx();
      if (musicOsc.current) return;
      
      const melody = [262, 294, 330, 294, 262, 330, 392, 330];
      let noteIndex = 0;
      
      const playMelody = () => {
        if (!musicOsc.current) return;
        playNote(melody[noteIndex], 0.3, 0, 'sine', 0.08);
        noteIndex = (noteIndex + 1) % melody.length;
      };
      
      musicOsc.current = setInterval(playMelody, 400);
      playMelody();
    } catch(e) {}
  };

  const stopMusic = () => {
    if (musicOsc.current) {
      clearInterval(musicOsc.current);
      musicOsc.current = null;
    }
  };

  return { playCorrect, playWrong, playClick, playWin, playUnlock, playStart, playEngine, speakNumber, startMusic, stopMusic };
};

// Task Icons
const TaskIcons = {
  compare: <svg viewBox="0 0 100 60" className="w-20 h-12"><rect x="5" y="10" width="35" height="40" rx="8" fill="#EC4899"/><rect x="60" y="10" width="35" height="40" rx="8" fill="#3B82F6"/><path d="M42 25 L50 30 L42 35" fill="none" stroke="#FCD34D" strokeWidth="3"/><path d="M58 25 L50 30 L58 35" fill="none" stroke="#FCD34D" strokeWidth="3"/></svg>,
  bigger: <svg viewBox="0 0 100 60" className="w-20 h-12"><circle cx="20" cy="40" r="12" fill="#8B5CF6"/><circle cx="50" cy="35" r="16" fill="#A78BFA"/><circle cx="80" cy="28" r="22" fill="#7C3AED"/><path d="M50 8 L58 20 L42 20 Z" fill="#FCD34D"/></svg>,
  smaller: <svg viewBox="0 0 100 60" className="w-20 h-12"><circle cx="80" cy="25" r="15" fill="#F97316"/><circle cx="50" cy="32" r="12" fill="#FB923C"/><circle cx="20" cy="40" r="8" fill="#FDBA74"/><path d="M50 55 L58 45 L42 45 Z" fill="#FCD34D"/></svg>,
  sequence: <svg viewBox="0 0 100 60" className="w-20 h-12"><rect x="5" y="15" width="18" height="30" rx="5" fill="#10B981"/><rect x="28" y="15" width="18" height="30" rx="5" fill="#34D399"/><rect x="51" y="15" width="18" height="30" rx="5" fill="#6EE7B7" stroke="#FCD34D" strokeWidth="2" strokeDasharray="4"/><rect x="74" y="15" width="18" height="30" rx="5" fill="#A7F3D0"/><text x="60" y="36" textAnchor="middle" fill="#FCD34D" fontSize="16" fontWeight="bold">?</text></svg>,
  count: <svg viewBox="0 0 100 60" className="w-20 h-12">{[0,1,2,3,4].map(i => <polygon key={i} points="12,8 14,14 20,14 15,18 17,24 12,20 7,24 9,18 4,14 10,14" fill="#FBBF24" transform={`translate(${i*16}, ${i%2*10})`}/>)}<circle cx="85" cy="45" r="10" fill="#3B82F6"/><text x="85" y="49" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">?</text></svg>,
  addSub: <svg viewBox="0 0 100 60" className="w-20 h-12"><circle cx="22" cy="30" r="18" fill="#EC4899"/><text x="50" y="36" textAnchor="middle" fill="#FCD34D" fontSize="20" fontWeight="bold">+</text><circle cx="78" cy="30" r="18" fill="#8B5CF6"/></svg>
};

// Enhanced Cars with smoke animation
const cars = {
  starter: { stars: 0, svg: (s=1, moving=false) => <svg viewBox="0 0 80 40" style={{width:80*s,height:40*s}}><defs><linearGradient id="r1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FF8A8A"/><stop offset="100%" stopColor="#E53935"/></linearGradient></defs>{moving && <><circle cx="-5" cy="34" r="4" fill="#9CA3AF" opacity="0.6"><animate attributeName="cx" values="-5;-20" dur="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="0.3s" repeatCount="indefinite"/></circle><circle cx="-8" cy="30" r="3" fill="#9CA3AF" opacity="0.4"><animate attributeName="cx" values="-8;-25" dur="0.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0" dur="0.4s" repeatCount="indefinite"/></circle></>}<rect x="5" y="18" width="70" height="16" rx="8" fill="url(#r1)"/><rect x="20" y="10" width="35" height="14" rx="5" fill="url(#r1)"/><rect x="24" y="12" width="12" height="10" rx="3" fill="#81D4FA"/><rect x="38" y="12" width="14" height="10" rx="3" fill="#81D4FA"/><circle cx="18" cy="34" r="7" fill="#37474F"><animate attributeName="r" values="7;6.5;7" dur="0.1s" repeatCount="indefinite"/></circle><circle cx="18" cy="34" r="4" fill="#78909C"/><circle cx="62" cy="34" r="7" fill="#37474F"><animate attributeName="r" values="7;6.5;7" dur="0.1s" repeatCount="indefinite"/></circle><circle cx="62" cy="34" r="4" fill="#78909C"/><rect x="68" y="22" width="8" height="4" rx="2" fill="#FFEB3B"/></svg> },
  
  blue: { stars: 10, svg: (s=1, moving=false) => <svg viewBox="0 0 80 40" style={{width:80*s,height:40*s}}><defs><linearGradient id="b1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4FC3F7"/><stop offset="100%" stopColor="#0288D1"/></linearGradient></defs>{moving && <><circle cx="-5" cy="34" r="4" fill="#9CA3AF" opacity="0.6"><animate attributeName="cx" values="-5;-20" dur="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="0.3s" repeatCount="indefinite"/></circle></>}<path d="M8 28 Q8 18 20 18 L60 18 Q72 18 72 28 L72 30 Q72 34 68 34 L12 34 Q8 34 8 30 Z" fill="url(#b1)"/><path d="M18 18 L25 8 L55 8 L62 18 Z" fill="url(#b1)"/><path d="M22 16 L27 10 L38 10 L38 16 Z" fill="#B3E5FC"/><path d="M42 16 L42 10 L53 10 L58 16 Z" fill="#B3E5FC"/><circle cx="18" cy="34" r="7" fill="#263238"/><circle cx="18" cy="34" r="4" fill="#546E7A"/><circle cx="62" cy="34" r="7" fill="#263238"/><circle cx="62" cy="34" r="4" fill="#546E7A"/></svg> },
  
  gold: { stars: 25, svg: (s=1, moving=false) => <svg viewBox="0 0 80 40" style={{width:80*s,height:40*s}}><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFF176"/><stop offset="50%" stopColor="#FFD700"/><stop offset="100%" stopColor="#FFA000"/></linearGradient></defs>{moving && <><circle cx="-5" cy="34" r="5" fill="#FFD700" opacity="0.5"><animate attributeName="cx" values="-5;-25" dur="0.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0" dur="0.4s" repeatCount="indefinite"/></circle></>}<path d="M2 26 L15 26 L20 20 L60 20 L68 26 L78 26 L78 30 Q78 34 74 34 L6 34 Q2 34 2 30 Z" fill="url(#g1)"/><path d="M22 20 L28 10 L52 10 L58 20 Z" fill="url(#g1)"/><rect x="26" y="12" width="10" height="7" rx="2" fill="#E3F2FD"/><rect x="44" y="12" width="10" height="7" rx="2" fill="#E3F2FD"/><circle cx="16" cy="34" r="7" fill="#37474F"/><circle cx="16" cy="34" r="5" fill="#FFC107"/><circle cx="64" cy="34" r="7" fill="#37474F"/><circle cx="64" cy="34" r="5" fill="#FFC107"/><polygon points="40,4 42,9 38,9" fill="#FFD700"/></svg> },
  
  monster: { stars: 40, svg: (s=1, moving=false) => <svg viewBox="0 0 80 45" style={{width:80*s,height:45*s}}><defs><linearGradient id="p1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#9575CD"/><stop offset="100%" stopColor="#5E35B1"/></linearGradient></defs>{moving && <><circle cx="-3" cy="40" r="6" fill="#8B5CF6" opacity="0.4"><animate attributeName="cx" values="-3;-20" dur="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0" dur="0.3s" repeatCount="indefinite"/></circle><circle cx="-6" cy="35" r="4" fill="#A78BFA" opacity="0.3"><animate attributeName="cx" values="-6;-22" dur="0.35s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0" dur="0.35s" repeatCount="indefinite"/></circle></>}<circle cx="16" cy="36" r="11" fill="#424242"/><circle cx="16" cy="36" r="7" fill="#616161"/><circle cx="64" cy="36" r="11" fill="#424242"/><circle cx="64" cy="36" r="7" fill="#616161"/><rect x="10" y="14" width="60" height="18" rx="5" fill="url(#p1)"/><rect x="22" y="6" width="36" height="12" rx="4" fill="url(#p1)"/><rect x="26" y="8" width="11" height="8" rx="2" fill="#CE93D8"/><rect x="43" y="8" width="11" height="8" rx="2" fill="#CE93D8"/></svg> },
  
  rocket: { stars: 60, svg: (s=1, moving=false) => <svg viewBox="0 0 80 40" style={{width:80*s,height:40*s}}><defs><linearGradient id="gr1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#69F0AE"/><stop offset="100%" stopColor="#00C853"/></linearGradient><linearGradient id="fl1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6D00"/><stop offset="100%" stopColor="#FFD600"/></linearGradient></defs><path d="M-4 22 L8 23 L6 29 L-4 28 Z" fill="url(#fl1)"><animate attributeName="d" values="M-4 22 L8 23 L6 29 L-4 28 Z;M-12 20 L8 23 L6 29 L-12 31 Z;M-4 22 L8 23 L6 29 L-4 28 Z" dur="0.15s" repeatCount="indefinite"/></path>{moving && <><circle cx="-15" cy="26" r="5" fill="#FF6D00" opacity="0.6"><animate attributeName="cx" values="-15;-35" dur="0.25s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="0.25s" repeatCount="indefinite"/></circle><circle cx="-20" cy="24" r="3" fill="#FFD600" opacity="0.4"><animate attributeName="cx" values="-20;-40" dur="0.3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0" dur="0.3s" repeatCount="indefinite"/></circle></>}<path d="M10 16 L70 16 Q80 16 80 26 L80 28 Q80 34 70 34 L20 34 Q10 34 10 26 Z" fill="url(#gr1)"/><path d="M25 16 L35 6 L55 6 L60 16 Z" fill="url(#gr1)"/><polygon points="35,6 40,0 45,6" fill="#00E676"/><rect x="30" y="8" width="10" height="7" rx="2" fill="#E0F7FA"/><rect x="44" y="8" width="10" height="7" rx="2" fill="#E0F7FA"/><circle cx="22" cy="34" r="6" fill="#37474F"/><circle cx="22" cy="34" r="3" fill="#00E676"/><circle cx="58" cy="34" r="6" fill="#37474F"/><circle cx="58" cy="34" r="3" fill="#00E676"/></svg> },
  
  rainbow: { stars: 100, svg: (s=1, moving=false) => <svg viewBox="0 0 80 40" style={{width:80*s,height:40*s}}><defs><linearGradient id="rw1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B6B"><animate attributeName="stopColor" values="#FF6B6B;#4FC3F7;#FF6B6B" dur="2s" repeatCount="indefinite"/></stop><stop offset="50%" stopColor="#4ECB71"><animate attributeName="stopColor" values="#4ECB71;#FF6B6B;#4ECB71" dur="2s" repeatCount="indefinite"/></stop><stop offset="100%" stopColor="#7E57C2"><animate attributeName="stopColor" values="#7E57C2;#4ECB71;#7E57C2" dur="2s" repeatCount="indefinite"/></stop></linearGradient></defs>{moving && <><circle cx="-5" cy="34" r="5" fill="#FF6B6B" opacity="0.5"><animate attributeName="cx" values="-5;-25" dur="0.3s" repeatCount="indefinite"/><animate attributeName="fill" values="#FF6B6B;#4FC3F7;#7E57C2" dur="0.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0" dur="0.3s" repeatCount="indefinite"/></circle><circle cx="-10" cy="30" r="4" fill="#4ECB71" opacity="0.4"><animate attributeName="cx" values="-10;-30" dur="0.35s" repeatCount="indefinite"/><animate attributeName="fill" values="#4ECB71;#FF6B6B;#4FC3F7" dur="0.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0" dur="0.35s" repeatCount="indefinite"/></circle></>}<polygon points="40,0 44,7 48,3 46,9 52,7 47,11 40,9 33,11 28,7 34,9 32,3 36,7" fill="#FFD700"/><rect x="5" y="16" width="70" height="18" rx="9" fill="url(#rw1)"/><rect x="18" y="8" width="44" height="14" rx="6" fill="url(#rw1)"/><rect x="23" y="10" width="14" height="10" rx="3" fill="rgba(255,255,255,0.8)"/><rect x="43" y="10" width="14" height="10" rx="3" fill="rgba(255,255,255,0.8)"/><circle cx="18" cy="34" r="7" fill="#37474F"/><circle cx="18" cy="34" r="4" fill="url(#rw1)"/><circle cx="62" cy="34" r="7" fill="#37474F"/><circle cx="62" cy="34" r="4" fill="url(#rw1)"/></svg> }
};
const carKeys = ['starter','blue','gold','monster','rocket','rainbow'];

// Animated particles
const Particles = ({ theme = 'default' }) => {
  const colors = theme === 'race' ? ['#FCD34D', '#60A5FA', '#F472B6'] : ['rgba(255,255,255,0.6)'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_,i) => <div key={i} className="absolute rounded-full" style={{width:Math.random()*8+4,height:Math.random()*8+4,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,background:colors[i % colors.length],animation:`float ${2+Math.random()*3}s ease-in-out infinite`,animationDelay:`${Math.random()*2}s`,opacity:0.6}}/>)}
    </div>
  );
};

// Finish line ribbon
const FinishRibbon = ({ show }) => show ? (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
    <div className="w-full h-20 flex">
      {[...Array(20)].map((_,i) => <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`} style={{animation:'pulse 0.5s infinite'}}/>)}
    </div>
  </div>
) : null;

const StarBurst = ({ show }) => show ? (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    {[...Array(12)].map((_,i) => <div key={i} className="absolute text-2xl" style={{animation:'starBurst 0.6s ease-out forwards',transform:`rotate(${i*30}deg) translateY(-50px)`}}>⭐</div>)}
  </div>
) : null;

// Speed lines effect
const SpeedLines = ({ active }) => active ? (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_,i) => <div key={i} className="absolute h-0.5 bg-white/30" style={{width:'60px',left:'-60px',top:`${10+i*12}%`,animation:`speedLine 0.3s linear infinite`,animationDelay:`${i*0.05}s`}}/>)}
  </div>
) : null;

// Number line visualization
const NumberLine = ({ numbers = [], highlight = null, max = 10 }) => (
  <div className="flex items-center justify-center gap-1 bg-white/30 rounded-full p-2 mb-2">
    {[...Array(max + 1)].map((_, i) => {
      const isHighlight = highlight === i;
      const isInSet = numbers.includes(i);
      return (
        <div
          key={i}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            isHighlight ? 'bg-yellow-400 text-white scale-125 shadow-lg' :
            isInSet ? 'bg-green-400 text-white' :
            'bg-white/50 text-gray-600'
          }`}
          style={isHighlight ? {animation:'pulse 1s infinite'} : {}}
        >
          {i}
        </div>
      );
    })}
  </div>
);

// Learning sequence stages for pedagogical progression
const LEARNING_STAGES = {
  1: { range: [1, 3], tasks: ['count'], name: 'Считаем до 3' },
  2: { range: [1, 5], tasks: ['count', 'compare', 'bigger', 'smaller'], name: 'Сравниваем числа' },
  3: { range: [1, 10], tasks: ['count', 'compare', 'bigger', 'smaller', 'sequence'], name: 'Последовательности' },
  4: { range: [1, 10], tasks: ['count', 'compare', 'sequence', 'addSub'], name: 'Сложение и вычитание' },
};

// Achievements system
const ACHIEVEMENTS = [
  // Beginner achievements
  { id: 'first_win', title: 'Первая Победа', description: 'Выиграй свою первую гонку', icon: '🎉', check: (s) => s.wins >= 1 },
  { id: 'first_steps', title: 'Первые Шаги', description: 'Ответь правильно на 10 вопросов', icon: '👣', check: (s) => s.totalCorrect >= 10 },
  { id: 'star_collector', title: 'Собиратель Звёзд', description: 'Собери 50 звёзд', icon: '⭐', check: (s) => s.totalStarsEarned >= 50 },

  // Speed achievements
  { id: 'speed_demon', title: 'Демон Скорости', description: 'Ответь правильно за 2 секунды', icon: '⚡', check: (s) => s.fastestAnswer > 0 && s.fastestAnswer < 2000 },
  { id: 'lightning_fast', title: 'Молниеносный', description: 'Ответь правильно за 1 секунду', icon: '⚡⚡', check: (s) => s.fastestAnswer > 0 && s.fastestAnswer < 1000 },

  // Accuracy achievements
  { id: 'perfectionist', title: 'Перфекционист', description: 'Выиграй гонку без ошибок', icon: '💯', check: (s) => s.perfectRaces >= 1 },
  { id: 'master', title: 'Мастер', description: 'Выиграй 5 гонок без ошибок', icon: '🎯', check: (s) => s.perfectRaces >= 5 },
  { id: 'accuracy_king', title: 'Король Точности', description: 'Точность 90%+ за 20 ответов', icon: '👑', check: (s) => s.totalCorrect + s.totalWrong >= 20 && (s.totalCorrect / (s.totalCorrect + s.totalWrong)) >= 0.9 },

  // Streak achievements
  { id: 'hot_streak', title: 'Горячая Серия', description: '5 правильных ответов подряд', icon: '🔥', check: (s) => s.bestStreak >= 5 },
  { id: 'unstoppable', title: 'Неостановимый', description: '10 правильных ответов подряд', icon: '🔥🔥', check: (s) => s.bestStreak >= 10 },
  { id: 'legendary', title: 'Легендарный', description: '15 правильных ответов подряд', icon: '🔥🔥🔥', check: (s) => s.bestStreak >= 15 },

  // Practice achievements
  { id: 'dedicated', title: 'Целеустремлённый', description: 'Сыграй 10 гонок', icon: '🎮', check: (s) => s.totalRaces >= 10 },
  { id: 'veteran', title: 'Ветеран', description: 'Сыграй 50 гонок', icon: '🎖️', check: (s) => s.totalRaces >= 50 },
  { id: 'math_ninja', title: 'Ниндзя Математики', description: 'Ответь правильно на 100 вопросов', icon: '🥷', check: (s) => s.totalCorrect >= 100 },
  { id: 'math_master', title: 'Мастер Математики', description: 'Ответь правильно на 500 вопросов', icon: '🧙', check: (s) => s.totalCorrect >= 500 },

  // Collector achievements
  { id: 'car_collector', title: 'Коллекционер', description: 'Разблокируй все машинки', icon: '🚗', check: (s) => s.unlockedCars >= 6 },
  { id: 'rich', title: 'Богач', description: 'Накопи 100 звёзд', icon: '💰', check: (s) => s.stars >= 100 },
  { id: 'millionaire', title: 'Миллионер', description: 'Накопи 200 звёзд', icon: '💎', check: (s) => s.stars >= 200 },

  // Special achievements
  { id: 'comeback', title: 'Возвращение', description: 'Выиграй гонку с 1 сердцем', icon: '❤️‍🔥', check: (s) => s.comebackWins >= 1 },
  { id: 'explorer', title: 'Исследователь', description: 'Попробуй все типы заданий', icon: '🔍', check: (s) => s.taskTypesTried >= 6 },
  { id: 'night_owl', title: 'Ночная Сова', description: 'Сыграй после 22:00', icon: '🦉', check: (s) => s.nightGames >= 1 },
  { id: 'early_bird', title: 'Ранняя Птичка', description: 'Сыграй до 7:00 утра', icon: '🐦', check: (s) => s.morningGames >= 1 },
  { id: 'persistent', title: 'Настойчивый', description: 'Продолжи сохранённую гонку', icon: '💪', check: (s) => s.continuedRaces >= 1 },
];

const defaultState = {
  stars: 0,
  unlockedCars: ['starter'],
  selectedCar: 'starter',
  stats: {
    totalRaces: 0,
    totalCorrect: 0,
    totalWrong: 0,
    bestStreak: 0,
    wins: 0,
    perfectRaces: 0,
    fastestAnswer: 0,
    totalStarsEarned: 0,
    comebackWins: 0,
    taskTypesTried: 0,
    nightGames: 0,
    morningGames: 0,
    continuedRaces: 0,
  },
  achievements: {},
  difficulty: 1,
  learningStage: 1,
  weakTopics: { numbers: {}, operations: {} },
  musicOn: true,
  soundOn: true
};
const MAX_ERRORS = 5;

function NumberRacing({ screenProp, setScreenProp }) {
  const [screen, setScreen] = useState(screenProp || 'menu');
  const [gameState, setGameState] = useState(defaultState);

  // Sync internal screen state with prop
  useEffect(() => {
    if (screenProp) setScreen(screenProp);
  }, [screenProp]);

  // Notify parent of screen changes
  useEffect(() => {
    if (setScreenProp) setScreenProp(screen);
  }, [screen, setScreenProp]);
  const [task, setTask] = useState(null);
  const [raceProgress, setRaceProgress] = useState(0);
  const [raceStars, setRaceStars] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [carBounce, setCarBounce] = useState(false);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [raceCorrect, setRaceCorrect] = useState(0);
  const [raceWrong, setRaceWrong] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0); // Track wrong attempts for current task
  const [showHint, setShowHint] = useState(false); // Show visual hint after multiple errors
  const [isPaused, setIsPaused] = useState(false); // Pause state for race
  const [newAchievement, setNewAchievement] = useState(null); // New achievement notification
  const [answerStartTime, setAnswerStartTime] = useState(0); // Track answer time
  const taskQueueRef = useRef([]);
  const engineInterval = useRef(null);
  const autoSaveInterval = useRef(null);

  const sound = useSound();

  // Check for new achievements
  const checkAchievements = useCallback((updatedStats) => {
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
      const isUnlocked = gameState.achievements[achievement.id];
      const meetsCondition = achievement.check({
        ...updatedStats,
        stars: gameState.stars,
        unlockedCars: gameState.unlockedCars.length
      });

      if (!isUnlocked && meetsCondition) {
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      // Show first achievement
      setNewAchievement(newlyUnlocked[0]);

      // Update achievements state
      const newAchievements = { ...gameState.achievements };
      newlyUnlocked.forEach(ach => {
        newAchievements[ach.id] = true;
      });

      setGameState(prev => ({
        ...prev,
        achievements: newAchievements
      }));

      // Play unlock sound
      if (gameState.soundOn) sound.playUnlock();

      // Hide notification after 3 seconds
      setTimeout(() => setNewAchievement(null), 3000);
    }
  }, [gameState.achievements, gameState.stars, gameState.unlockedCars, gameState.soundOn, sound]);

  // Local task generator with learning stages
  const generateLocalTask = useCallback((diff) => {
    // Ensure stage is valid (1-4)
    let stage = gameState.learningStage || 1;
    if (stage < 1 || stage > 4) {
      console.warn(`Invalid learning stage ${stage}, defaulting to 1`);
      stage = 1;
    }

    const stageConfig = LEARNING_STAGES[stage];
    const types = stageConfig.tasks;
    const [minNum, maxNum] = stageConfig.range;

    // 30% chance to repeat weak topics if any exist
    const hasWeakTopics = Object.keys(gameState.weakTopics?.numbers || {}).length > 0;
    const shouldPrioritizeWeak = hasWeakTopics && Math.random() < 0.3;

    const type = types[Math.floor(Math.random() * types.length)];
    
    let visual, options, correct;
    
    switch(type) {
      case 'compare': {
        const n1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        let n2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        while (n2 === n1) n2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        visual = { type: 'compare', left: n1, right: n2 };
        options = [{ value: 'left', display: '👈' }, { value: 'right', display: '👉' }];
        correct = n1 > n2 ? 'left' : 'right';
        break;
      }
      case 'bigger': {
        const nums = [];
        while (nums.length < 3) {
          const n = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
          if (!nums.includes(n)) nums.push(n);
        }
        visual = { type: 'bigger', nums };
        options = nums.map(n => ({ value: n, display: n }));
        correct = Math.max(...nums);
        break;
      }
      case 'smaller': {
        const nums = [];
        while (nums.length < 3) {
          const n = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
          if (!nums.includes(n)) nums.push(n);
        }
        visual = { type: 'smaller', nums };
        options = nums.map(n => ({ value: n, display: n }));
        correct = Math.min(...nums);
        break;
      }
      case 'sequence': {
        const maxStart = Math.max(minNum, maxNum - 3);
        const start = Math.floor(Math.random() * (maxStart - minNum + 1)) + minNum;
        const seq = [start, start + 1, start + 2, start + 3];
        const missingIdx = Math.floor(Math.random() * 4);
        const answer = seq[missingIdx];
        const displaySeq = seq.map((n, i) => i === missingIdx ? '?' : n);
        visual = { type: 'sequence', seq: displaySeq };
        const seqOpts = [answer];
        if (answer > minNum) seqOpts.push(answer - 1);
        if (answer <= maxNum) seqOpts.push(answer + 1);
        options = [...new Set(seqOpts)].slice(0, 3).sort(() => Math.random() - 0.5).map(n => ({ value: n, display: n }));
        correct = answer;
        break;
      }
      case 'count': {
        const count = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
        const emojis = ['⭐', '🍎', '🚗', '🐸', '🌸', '⚽', '🍕', '🎈'];
        visual = { type: 'count', count, emoji: emojis[Math.floor(Math.random() * emojis.length)] };
        const countOpts = [count];
        if (count > minNum) countOpts.push(count - 1);
        if (count < maxNum) countOpts.push(count + 1);
        options = [...new Set(countOpts)].slice(0, 3).sort(() => Math.random() - 0.5).map(n => ({ value: n, display: n }));
        correct = count;
        break;
      }
      case 'addSub': {
        const isAdd = Math.random() > 0.5;
        let a, b, result, left, right;

        if (isAdd) {
          // For addition: ensure a + b <= maxNum
          result = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
          a = Math.floor(Math.random() * Math.min(result - minNum + 1, maxNum - minNum + 1)) + minNum;
          b = result - a;
          // Ensure b is in valid range
          if (b < minNum || b > maxNum) {
            b = Math.floor(Math.random() * (result - minNum + 1)) + minNum;
            a = result - b;
          }
          left = a;
          right = b;
        } else {
          // For subtraction: ensure a - b >= minNum and a <= maxNum
          a = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
          b = Math.floor(Math.random() * (a - minNum + 1)) + minNum;
          result = a - b;
          left = a;
          right = b;
        }

        visual = { type: 'addSub', left, right, op: isAdd ? '+' : '-' };
        const addOpts = [result];
        // For options, allow 0 for subtraction (minNum might be 1, but 0 is valid answer)
        const minAllowed = 0; // Allow 0 as answer for subtraction
        if (result > minAllowed) addOpts.push(result - 1);
        if (result < maxNum) addOpts.push(result + 1);
        options = [...new Set(addOpts)].filter(n => n >= minAllowed && n <= maxNum).slice(0, 3).sort(() => Math.random() - 0.5).map(n => ({ value: n, display: n }));
        correct = result;

        // Create dynamic icon based on operation
        const icon = (
          <svg viewBox="0 0 100 60" className="w-20 h-12">
            <circle cx="22" cy="30" r="18" fill="#EC4899"/>
            <text x="50" y="36" textAnchor="middle" fill="#FCD34D" fontSize="20" fontWeight="bold">{isAdd ? '+' : '-'}</text>
            <circle cx="78" cy="30" r="18" fill="#8B5CF6"/>
          </svg>
        );

        return { visual, options, correct, icon };
      }
    }

    return { visual, options, correct, icon: TaskIcons[type] };
  }, [gameState.learningStage, gameState.weakTopics]);

  const fillQueue = useCallback((diff) => {
    while (taskQueueRef.current.length < 10) {
      taskQueueRef.current.push(generateLocalTask(diff));
    }
  }, [generateLocalTask]);

  const getNextTask = useCallback(() => {
    if (taskQueueRef.current.length > 0) {
      setTask(taskQueueRef.current.shift());
    } else {
      setTask(generateLocalTask(gameState.difficulty));
    }
    fillQueue(gameState.difficulty);
    setWrongAttempts(0); // Reset wrong attempts for new task
    setShowHint(false); // Reset hint
    setAnswerStartTime(Date.now()); // Start timer for answer speed
  }, [generateLocalTask, fillQueue, gameState.difficulty]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Проверяем URL параметр для профиля
        const urlParams = new URLSearchParams(window.location.search);
        const profileId = urlParams.get('profile');

        if (profileId) {
          // Загружаем профиль из API
          const profiles = await getProfiles();
          const profile = profiles.find(p => String(p.id) === String(profileId));
          if (profile) {
            setCurrentProfile(profile);
            // Загружаем данные игры из профиля с валидацией
            if (profile.numberRacingData) {
              const data = profile.numberRacingData;
              // Validate and sanitize loaded data
              const sanitizedData = {
                ...defaultState,
                ...data,
                // ALWAYS start from learning stage 1 (session-specific progression)
                learningStage: 1,
                // Load difficulty but ensure it's valid
                difficulty: (data.difficulty >= 1 && data.difficulty <= 5) ? data.difficulty : 1,
                // Reset weak topics for fresh session
                weakTopics: { numbers: {}, operations: {} },
                // Load persistent data (cars, stars, stats)
                unlockedCars: Array.isArray(data.unlockedCars) ? data.unlockedCars : ['starter'],
                stats: (data.stats && typeof data.stats === 'object') ? data.stats : defaultState.stats,
              };
              console.log('Loading profile data (fresh session):', sanitizedData);
              setGameState(sanitizedData);
            } else {
              // Используем звёзды из профиля
              setGameState({...defaultState, stars: profile.stars || 0});
            }
          } else {
            console.warn(`Profile ${profileId} not found, using defaults`);
            setGameState(defaultState);
          }
        } else {
          // Fallback на localStorage
          const result = await window.storage.get('numberRacingData');
          if (result?.value) {
            const data = JSON.parse(result.value);
            // Same validation for localStorage data
            const sanitizedData = {
              ...defaultState,
              ...data,
              learningStage: (data.learningStage >= 1 && data.learningStage <= 4) ? data.learningStage : 1,
              difficulty: (data.difficulty >= 1 && data.difficulty <= 5) ? data.difficulty : 1,
              weakTopics: (data.weakTopics && typeof data.weakTopics === 'object')
                ? { numbers: data.weakTopics.numbers || {}, operations: data.weakTopics.operations || {} }
                : { numbers: {}, operations: {} },
            };
            setGameState(sanitizedData);
          }
        }
      } catch(e) {
        console.error('Error loading data:', e);
      }
      setDataLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded) fillQueue(gameState.difficulty);
  }, [dataLoaded, fillQueue, gameState.difficulty]);

  // Engine sound effect during race
  useEffect(() => {
    if (screen === 'race' && gameState.soundOn && isMoving && !isPaused) {
      engineInterval.current = setInterval(() => sound.playEngine(), 200);
    }
    return () => { if (engineInterval.current) clearInterval(engineInterval.current); };
  }, [screen, gameState.soundOn, isMoving, isPaused, sound]);

  // Music control
  useEffect(() => {
    if (screen === 'race' && gameState.musicOn && !isPaused) {
      sound.startMusic();
    } else {
      sound.stopMusic();
    }
    return () => sound.stopMusic();
  }, [screen, gameState.musicOn, isPaused]);

  // Auto-save race progress every 5 seconds
  useEffect(() => {
    if (screen === 'race' && !isPaused) {
      autoSaveInterval.current = setInterval(() => {
        const raceData = {
          progress: raceProgress,
          stars: raceStars,
          correct: raceCorrect,
          wrong: raceWrong,
          errors: totalErrors,
          streak: streak,
          timestamp: Date.now(),
          learningStage: gameState.learningStage,
        };
        localStorage.setItem('raceInProgress', JSON.stringify(raceData));
      }, 5000);
    }
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    };
  }, [screen, isPaused, raceProgress, raceStars, raceCorrect, raceWrong, totalErrors, streak, gameState.learningStage]);

  const saveData = async (data) => {
    try {
      // Don't save session-specific data (learningStage, weakTopics)
      const persistentData = {
        ...data,
        learningStage: 1, // Always reset to 1 (session-specific)
        weakTopics: { numbers: {}, operations: {} }, // Reset (session-specific)
      };

      if (currentProfile) {
        // Сохраняем в профиль через API
        const updatedProfile = {
          ...currentProfile,
          stars: persistentData.stars,
          numberRacingData: persistentData
        };
        await updateProfileAPI(currentProfile.id, updatedProfile);
        setCurrentProfile(updatedProfile);
      } else {
        // Fallback на localStorage
        await window.storage.set('numberRacingData', JSON.stringify(persistentData));
      }
    } catch(e) {
      console.error('Error saving data:', e);
    }
  };

  const updateGameState = (updates) => {
    setGameState(prev => {
      const newState = {...prev, ...updates};
      saveData(newState);
      return newState;
    });
  };

  const startRace = () => {
    if (gameState.soundOn) sound.playStart();

    // Clear any saved race progress when starting fresh
    localStorage.removeItem('raceInProgress');

    setScreen('race');
    setRaceProgress(0);
    setRaceStars(0);
    setStreak(0);
    setRaceCorrect(0);
    setRaceWrong(0);
    setTotalErrors(0);
    setShowFinish(false);
    setIsMoving(true);
    setIsPaused(false);
    fillQueue(gameState.difficulty);
    getNextTask();
  };

  const continueRace = (savedRace) => {
    if (gameState.soundOn) sound.playStart();

    setScreen('race');
    setRaceProgress(savedRace.progress);
    setRaceStars(savedRace.stars);
    setStreak(savedRace.streak);
    setRaceCorrect(savedRace.correct);
    setRaceWrong(savedRace.wrong);
    setTotalErrors(savedRace.errors);
    setShowFinish(false);
    setIsMoving(true);
    setIsPaused(false);

    // Restore learning stage if it was saved
    if (savedRace.learningStage) {
      updateGameState({ learningStage: savedRace.learningStage });
    }

    fillQueue(gameState.difficulty);
    getNextTask();

    // Clear the saved race
    localStorage.removeItem('raceInProgress');
  };

  const handleAnswer = (answer) => {
    // Block answers when paused
    if (isPaused) return;

    const isCorrect = answer === task.correct;
    setShowResult(isCorrect ? 'correct' : 'wrong');
    setCarBounce(true);
    setIsMoving(false);

    // Speak the correct answer
    if (gameState.soundOn && task.visual.type === 'count') {
      sound.speakNumber(task.correct);
    }

    if(isCorrect) {
      if (gameState.soundOn) sound.playCorrect();
      setRaceStars(s => s + 1);
      setRaceCorrect(c => c + 1);
      setShowStarBurst(true);
      setStreak(s => s + 1);

      // Progress to next learning stage after consistent success
      if(streak >= 4 && gameState.learningStage < 4) {
        updateGameState({ learningStage: gameState.learningStage + 1 });
      }

      setTimeout(() => setShowStarBurst(false), 500);
    } else {
      if (gameState.soundOn) sound.playWrong();
      setRaceWrong(w => w + 1);
      setTotalErrors(e => e + 1);
      setStreak(s => Math.max(s - 1, -3));

      // Increment wrong attempts for this task
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);

      // Show hint after 2 wrong attempts
      if (newWrongAttempts >= 2) {
        setShowHint(true);
        // Speak hint
        if (gameState.soundOn && typeof task.correct === 'number') {
          setTimeout(() => sound.speakNumber(task.correct), 400);
        }
      }

      // Track weak topics for spaced repetition
      const weakTopics = { ...gameState.weakTopics };

      // Track problematic numbers
      if (typeof task.correct === 'number') {
        weakTopics.numbers[task.correct] = (weakTopics.numbers[task.correct] || 0) + 1;
      }

      // Track problematic operation types
      weakTopics.operations[task.visual.type] = (weakTopics.operations[task.visual.type] || 0) + 1;

      updateGameState({ weakTopics });

      // Regress learning stage if too many errors
      if(streak <= -3 && gameState.learningStage > 1) {
        updateGameState({ learningStage: gameState.learningStage - 1 });
      }

      // Don't continue to next task - let them try again
      setTimeout(() => {
        setShowResult(null);
        setCarBounce(false);
        setIsMoving(true);
      }, 900);
      return; // Exit early to not proceed to next task
    }

    setTimeout(() => {
      setShowResult(null);
      setCarBounce(false);
      setIsMoving(true);
      
      const newErrors = totalErrors + (isCorrect ? 0 : 1);
      if(newErrors >= MAX_ERRORS) {
        sound.stopMusic();
        const newStats = { ...gameState.stats, totalRaces: gameState.stats.totalRaces + 1, totalCorrect: gameState.stats.totalCorrect + raceCorrect, totalWrong: gameState.stats.totalWrong + raceWrong + 1 };
        updateGameState({ stats: newStats });
        setScreen('failed');
        return;
      }
      
      if(isCorrect) {
        const newProgress = raceProgress + 18;
        setRaceProgress(newProgress);
        if(newProgress >= 100) {
          setShowFinish(true);
          if (gameState.soundOn) sound.playWin();
          sound.stopMusic();
          setTimeout(() => {
            const earned = raceStars + 1;
            const newStats = { totalRaces: gameState.stats.totalRaces + 1, totalCorrect: gameState.stats.totalCorrect + raceCorrect + 1, totalWrong: gameState.stats.totalWrong + raceWrong, bestStreak: Math.max(gameState.stats.bestStreak, streak + 1) };
            updateGameState({ stars: gameState.stars + earned, stats: newStats });
            setScreen('finish');
          }, 1500);
          return;
        }
      }
      getNextTask();
    }, 900);
  };

  const unlockCar = async (key) => {
    const car = cars[key];
    if (gameState.unlockedCars.includes(key)) return;
    if (gameState.stars < car.stars) return;
    
    if (gameState.soundOn) sound.playUnlock();
    
    const newState = {
      ...gameState,
      stars: gameState.stars - car.stars,
      unlockedCars: [...gameState.unlockedCars, key]
    };
    
    setGameState(newState);
    await saveData(newState);
    
    setShowStarBurst(true);
    setTimeout(() => setShowStarBurst(false), 500);
  };

  const selectCar = (key) => {
    if (!gameState.unlockedCars.includes(key)) return;
    if (gameState.soundOn) sound.playClick();
    updateGameState({ selectedCar: key });
  };

  const toggleMusic = () => updateGameState({ musicOn: !gameState.musicOn });
  const toggleSound = () => updateGameState({ soundOn: !gameState.soundOn });
  
  const resetData = async () => {
    if (gameState.soundOn) sound.playClick();
    setGameState(defaultState);
    taskQueueRef.current = [];
    try { await window.storage.delete('numberRacingData'); } catch(e) {}
  };

  if (!dataLoaded) return <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center"><div className="text-6xl animate-bounce">🏎️</div></div>;

  const styles = `
    @keyframes float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
    @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
    @keyframes starBurst { 0% { opacity:1; transform: rotate(inherit) translateY(0) scale(1); } 100% { opacity:0; transform: rotate(inherit) translateY(-70px) scale(0); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(255,255,255,0.4); } 50% { box-shadow: 0 0 40px rgba(255,255,255,0.8); } }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes pop { 0% { transform: scale(0.8); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
    @keyframes roadMove { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
    @keyframes confetti { 0% { transform: translateY(-100vh) rotate(0); } 100% { transform: translateY(100vh) rotate(720deg); } }
    @keyframes pulse { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
    @keyframes speedLine { 0% { left: 100%; opacity: 0; } 50% { opacity: 0.5; } 100% { left: -60px; opacity: 0; } }
    @keyframes carBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes wheelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes finishPulse { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(1.02); } }
  `;

  // MENU
  if(screen === 'menu') {
    // Check for saved race
    let savedRace = null;
    try {
      const saved = localStorage.getItem('raceInProgress');
      if (saved) {
        const data = JSON.parse(saved);
        // Only show if race was saved less than 1 hour ago
        if (Date.now() - data.timestamp < 3600000) {
          savedRace = data;
        } else {
          localStorage.removeItem('raceInProgress');
        }
      }
    } catch(e) {}

    return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-4 flex flex-col items-center relative overflow-hidden">
      <style>{styles}</style>
      <Particles />

      {/* Sound toggles */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={toggleSound} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${gameState.soundOn ? 'bg-white/30' : 'bg-white/10'}`}>
          {gameState.soundOn ? '🔊' : '🔇'}
        </button>
        <button onClick={toggleMusic} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${gameState.musicOn ? 'bg-white/30' : 'bg-white/10'}`}>
          {gameState.musicOn ? '🎵' : '🎵'}
          {!gameState.musicOn && <span className="absolute text-xs">❌</span>}
        </button>
      </div>

      {/* Continue race notification */}
      {savedRace && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-5xl text-center mb-4">🏁</div>
            <div className="text-2xl font-bold text-gray-800 text-center mb-2">
              Продолжить гонку?
            </div>
            <div className="text-gray-600 text-center mb-4">
              У тебя есть незавершенная гонка
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Прогресс:</span>
                <span className="font-bold text-gray-800">{Math.round(savedRace.progress)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Звёзды:</span>
                <span className="font-bold text-yellow-500">⭐ {savedRace.stars}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => continueRace(savedRace)}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                ✅ Продолжить
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('raceInProgress');
                  startRace();
                }}
                className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
              >
                🔄 Начать заново
              </button>
              <button
                onClick={() => localStorage.removeItem('raceInProgress')}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-2xl hover:bg-gray-400 active:scale-95 transition-all font-bold"
              >
                ❌ Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-6xl mb-2" style={{animation:'bounce 1s infinite'}}>🏎️</div>
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-5 py-2 rounded-full shadow-xl mb-4" style={{animation:'glow 2s infinite'}}>
        <span className="text-3xl">⭐</span>
        <span className="text-3xl font-black text-white">{gameState.stars}</span>
      </div>
      <div className="w-40 h-20 mb-2" style={{animation:'float 3s ease-in-out infinite'}}>{cars[gameState.selectedCar].svg(2, false)}</div>

      {/* Learning Stage Indicator */}
      <div className="bg-white/20 backdrop-blur rounded-2xl p-3 mb-4 w-full max-w-xs">
        <div className="text-center text-white font-bold mb-2 text-sm">
          {LEARNING_STAGES[gameState.learningStage || 1].name}
        </div>
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4].map(stage => (
            <div
              key={stage}
              className={`flex-1 h-2 rounded-full transition-all ${
                stage <= (gameState.learningStage || 1)
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-white/30'
              }`}
              style={stage === (gameState.learningStage || 1) ? {animation:'pulse 2s infinite'} : {}}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <button onClick={startRace} className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3" style={{animation:'glow 2s infinite'}}>
          <span className="text-4xl">🚦</span><span className="text-4xl">▶️</span>
        </button>
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('garage'); }} className="w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-white py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <span className="text-4xl">🏠</span><span className="text-4xl">🚗</span>
        </button>
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('stats'); }} className="w-full bg-gradient-to-r from-pink-400 via-rose-500 to-red-500 text-white py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <span className="text-4xl">📊</span><span className="text-4xl">🏆</span>
        </button>
      </div>
    </div>
    );
  }

  // STATS
  if(screen === 'stats') {
    const { stats } = gameState;
    const accuracy = stats.totalCorrect + stats.totalWrong > 0 ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-4 relative overflow-hidden">
        <style>{styles}</style>
        <Particles />
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('menu'); }} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl hover:bg-white/30 active:scale-90 transition-all">◀️</button>
          <div className="text-3xl">📊</div>
        </div>
        <div className="space-y-4">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4"><span className="text-5xl">🏁</span><div className="flex-1"><div className="text-3xl font-black text-white">{stats.totalRaces}</div></div></div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4"><span className="text-5xl">✅</span><div className="flex-1"><div className="text-3xl font-black text-white">{stats.totalCorrect}</div></div></div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4"><span className="text-5xl">🎯</span><div className="flex-1"><div className="w-full bg-white/30 rounded-full h-6 overflow-hidden"><div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500" style={{width:`${accuracy}%`}}/></div><div className="text-xl font-black text-white mt-1">{accuracy}%</div></div></div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4"><span className="text-5xl">🔥</span><div className="flex-1"><div className="text-3xl font-black text-white">{stats.bestStreak}</div></div></div>
          <button onClick={resetData} className="w-full bg-white/20 text-white py-3 rounded-2xl hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"><span className="text-2xl">🗑️</span><span className="text-2xl">🔄</span></button>
        </div>
      </div>
    );
  }

  // GARAGE
  if(screen === 'garage') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 p-3 relative overflow-hidden">
      <style>{styles}</style>
      <Particles />
      <StarBurst show={showStarBurst} />
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('menu'); }} className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-xl hover:bg-white/30 active:scale-90 transition-all">◀️</button>
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-full shadow-lg"><span className="text-xl">⭐</span><span className="text-xl font-black text-white">{gameState.stars}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {carKeys.map((key) => {
          const car = cars[key];
          const isUnlocked = gameState.unlockedCars.includes(key);
          const isSelected = gameState.selectedCar === key;
          const canBuy = gameState.stars >= car.stars;
          
          return (
            <div key={key} className={`relative p-3 rounded-2xl border-4 transition-all overflow-hidden ${isSelected ? 'border-yellow-400 bg-yellow-400/20' : isUnlocked ? 'border-white/30 bg-white/10' : 'border-white/10 bg-black/30'}`} style={isSelected ? {animation:'glow 2s infinite'} : {}}>
              {isSelected && <div className="absolute top-1 right-1 text-lg">✅</div>}
              <div className={`flex justify-center mb-2 ${!isUnlocked ? 'opacity-30 grayscale blur-sm' : ''}`} style={isUnlocked ? {animation:'float 3s ease-in-out infinite'} : {}}>{car.svg(1.2, false)}</div>
              
              {isUnlocked ? (
                <button onClick={() => selectCar(key)} className={`w-full py-2 rounded-xl font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-white/20 text-white hover:bg-white/30 active:scale-95'}`}>{isSelected ? '⭐' : '👆'}</button>
              ) : (
                <button onClick={() => unlockCar(key)} className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${canBuy ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-105 active:scale-95 shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                  <span>⭐</span><span>{car.stars}</span>{canBuy && <span>🔓</span>}
                </button>
              )}
              
              {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-4xl">🔒</span></div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  // RACE
  if(screen === 'race') return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-cyan-400 to-emerald-400 p-3 flex flex-col relative overflow-hidden">
      <style>{styles}</style>
      <StarBurst show={showStarBurst} />
      <SpeedLines active={isMoving && !showResult && !isPaused} />
      <FinishRibbon show={showFinish} />

      {/* Pause button */}
      <button
        onClick={() => {
          setIsPaused(!isPaused);
          if (gameState.soundOn) sound.playClick();
        }}
        className="absolute top-4 right-4 z-30 w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-2xl hover:bg-white/40 active:scale-95 transition-all shadow-lg"
      >
        {isPaused ? '▶️' : '⏸️'}
      </button>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-6xl text-center mb-4">⏸️</div>
            <div className="text-3xl font-bold text-gray-800 text-center mb-6">Пауза</div>

            {/* Race stats */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Прогресс:</span>
                <span className="font-bold text-gray-800">{Math.round(raceProgress)}%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Звёзды:</span>
                <span className="font-bold text-yellow-500">⭐ {raceStars}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Сердца:</span>
                <span className="font-bold text-red-500">❤️ {MAX_ERRORS - totalErrors}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsPaused(false);
                  if (gameState.soundOn) sound.playClick();
                }}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xl"
              >
                ▶️ Продолжить
              </button>
              <button
                onClick={() => {
                  if (gameState.soundOn) sound.playClick();
                  setIsPaused(false);
                  setScreen('menu');
                  // Save race progress when exiting
                  const raceData = {
                    progress: raceProgress,
                    stars: raceStars,
                    correct: raceCorrect,
                    wrong: raceWrong,
                    errors: totalErrors,
                    streak: streak,
                    timestamp: Date.now(),
                    learningStage: gameState.learningStage,
                  };
                  localStorage.setItem('raceInProgress', JSON.stringify(raceData));
                }}
                className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xl"
              >
                🏠 Выйти в меню
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Animated road */}
      <div className="absolute inset-0 opacity-20" style={{background:'repeating-linear-gradient(0deg,transparent,transparent 25px,white 25px,white 30px)',animation: (isMoving && !isPaused) ? 'roadMove 0.4s linear infinite' : 'none'}}/>

      {/* Trees/scenery passing by */}
      <div className="absolute left-2 top-0 bottom-0 w-8 overflow-hidden opacity-40">
        {[...Array(5)].map((_,i) => <div key={i} className="absolute text-2xl" style={{top:`${i*25}%`,animation: (isMoving && !isPaused) ? `roadMove ${0.8+i*0.1}s linear infinite` : 'none'}}>🌲</div>)}
      </div>
      <div className="absolute right-2 top-0 bottom-0 w-8 overflow-hidden opacity-40">
        {[...Array(5)].map((_,i) => <div key={i} className="absolute text-2xl" style={{top:`${i*25+10}%`,animation: (isMoving && !isPaused) ? `roadMove ${0.9+i*0.1}s linear infinite` : 'none'}}>🌳</div>)}
      </div>

      {/* Progress bar */}
      <div className="relative bg-gray-800/50 rounded-full h-14 mb-2 overflow-hidden border-4 border-white/30">
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl">🏁</div>
        <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 transition-all duration-500 rounded-full flex items-center" style={{width:`${Math.min(raceProgress,100)}%`}}>
          <div className="ml-auto -mr-2" style={{animation: carBounce ? 'bounce 0.3s' : isMoving ? 'carBounce 0.2s infinite' : 'none'}}>
            {cars[gameState.selectedCar].svg(0.6, isMoving)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-2 mb-2">
        <div className="bg-white/30 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1"><span className="text-xl">⭐</span><span className="text-lg font-black text-white">{raceStars}</span></div>
        <div className="bg-white/30 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">{[...Array(MAX_ERRORS)].map((_,i) => <span key={i} className={`text-lg transition-all ${i < totalErrors ? 'grayscale opacity-40 scale-75' : ''}`} style={i < totalErrors ? {} : {animation:'pulse 1s infinite',animationDelay:`${i*0.1}s`}}>❤️</span>)}</div>
      </div>

      {/* Number Line Visualization */}
      {task && !showResult && (
        <NumberLine
          numbers={task.visual.type === 'compare' ? [task.visual.left, task.visual.right] :
                   task.visual.type === 'bigger' || task.visual.type === 'smaller' ? task.visual.nums :
                   task.visual.type === 'count' ? [task.visual.count] :
                   task.visual.type === 'addSub' ? [task.visual.left, task.visual.right] : []}
          highlight={typeof task.correct === 'number' ? task.correct : null}
          max={LEARNING_STAGES[gameState.learningStage || 1].range[1]}
        />
      )}

      {/* Task card */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`bg-white/95 backdrop-blur rounded-3xl p-4 shadow-2xl w-full max-w-sm transition-all ${showResult === 'correct' ? 'ring-8 ring-green-400' : showResult === 'wrong' ? 'ring-8 ring-red-400' : ''}`} style={{animation: showResult === 'correct' ? 'pop 0.3s' : showResult === 'wrong' ? 'shake 0.4s' : 'none'}}>
          {showResult ? (
            <div className="text-center py-6"><div className="text-8xl" style={{animation: showResult === 'correct' ? 'bounce 0.5s infinite' : 'shake 0.3s infinite'}}>{showResult === 'correct' ? '🎉' : '🙈'}</div></div>
          ) : task && (
            <>
              <div className="flex justify-center mb-2">{task.icon}</div>
              <div className="text-center mb-4">
                {task.visual.type === 'compare' && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-lg" style={{animation:'pulse 1s infinite'}}>{task.visual.left}</div>
                    <div className="text-3xl">⚖️</div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-lg" style={{animation:'pulse 1s infinite',animationDelay:'0.2s'}}>{task.visual.right}</div>
                  </div>
                )}
                {task.visual.type === 'bigger' && <div className="flex justify-center gap-2">{task.visual.nums.map((n,i) => <div key={i} className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg" style={{animation:'pulse 1s infinite',animationDelay:`${i*0.15}s`}}>{n}</div>)}</div>}
                {task.visual.type === 'smaller' && <div className="flex justify-center gap-2">{task.visual.nums.map((n,i) => <div key={i} className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg" style={{animation:'pulse 1s infinite',animationDelay:`${i*0.15}s`}}>{n}</div>)}</div>}
                {task.visual.type === 'sequence' && <div className="flex justify-center gap-1">{task.visual.seq.map((n,i) => <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black shadow-lg ${n === '?' ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-white' : 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'}`} style={{animation:'pulse 0.8s infinite',animationDelay:`${i*0.1}s`}}>{n}</div>)}</div>}
                {task.visual.type === 'count' && <div className="flex flex-wrap justify-center gap-2 max-w-[220px] mx-auto">{[...Array(task.visual.count)].map((_,i) => <span key={i} className="text-3xl" style={{animation:'bounce 0.6s ease-in-out infinite',animationDelay:`${i*0.08}s`}}>{task.visual.emoji}</span>)}</div>}
                {task.visual.type === 'addSub' && (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg">{task.visual.left}</div>
                    <span className="text-3xl font-black text-yellow-500">{task.visual.op}</span>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg">{task.visual.right}</div>
                    <span className="text-2xl text-gray-400">=</span>
                    <span className="text-3xl">❓</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">{task.options.map((opt,i) => {
                const isCorrectAnswer = opt.value === task.correct;
                const showGlow = showHint && isCorrectAnswer;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.value)}
                    className={`${showGlow ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 ring-4 ring-yellow-300' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'} text-white text-2xl font-black py-4 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all`}
                    style={{animation: showGlow ? 'glow 1s infinite' : `pulse 2s infinite ${i*0.2}s`}}
                  >
                    {opt.display}
                  </button>
                );
              })}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // FINISH (победа!)
  if(screen === 'finish') return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <style>{styles}</style>
      <Particles />
      <StarBurst show={true} />
      <div className="text-7xl mb-4" style={{animation:'bounce 0.6s infinite'}}>🏆</div>
      <div className="text-5xl font-black text-white mb-2" style={{textShadow:'0 4px 8px rgba(0,0,0,0.3)'}}>ПОБЕДА!</div>
      <div className="bg-white/20 backdrop-blur rounded-2xl p-5 text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2"><span className="text-5xl">⭐</span><span className="text-5xl font-black text-white">+{raceStars}</span></div>
        <div className="text-white/80 text-lg">Звёзды заработаны!</div>
      </div>
      <div className="w-40 h-20 mb-4" style={{animation:'float 3s ease-in-out infinite'}}>{cars[gameState.selectedCar].svg(2, false)}</div>
      <div className="space-y-3 w-full max-w-xs">
        <button onClick={startRace} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-3xl font-black"><span>🔄</span><span>▶️</span></button>
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('menu'); }} className="w-full bg-white/20 text-white py-4 rounded-2xl hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-xl font-bold">🏠 Меню</button>
      </div>
    </div>
  );

  // FAILED
  if(screen === 'failed') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <style>{styles}</style>
      <Particles />
      <div className="text-7xl mb-4" style={{animation:'shake 0.5s infinite'}}>😢</div>
      <div className="bg-white/20 backdrop-blur rounded-2xl p-5 text-center mb-4">
        <div className="text-4xl mb-2">💔 × {MAX_ERRORS}</div>
        <div className="flex items-center justify-center gap-2 opacity-50"><span className="text-3xl">⭐</span><span className="text-3xl font-black text-white line-through">+{raceStars}</span></div>
      </div>
      <div className="w-36 h-18 mb-4 opacity-50" style={{animation:'float 2s ease-in-out infinite'}}>{cars[gameState.selectedCar].svg(1.8, false)}</div>
      <div className="space-y-3 w-full max-w-xs">
        <button onClick={startRace} className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-3xl font-black"><span>🔄</span><span>▶️</span></button>
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('menu'); }} className="w-full bg-white/20 text-white py-4 rounded-2xl hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-xl font-bold">🏠 Меню</button>
      </div>
    </div>
  );

  return null;
}

// Render the component when loaded
function GameWrapper() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  const handleBackClick = () => {
    if (currentScreen === 'menu') {
      // From menu, go back to marketplace
      window.location.href = '/';
    } else {
      // From any other screen, go back to menu
      setCurrentScreen('menu');
    }
  };

  return (
    <>
      <button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all shadow-lg"
      >
        ← Назад
      </button>
      <NumberRacing screenProp={currentScreen} setScreenProp={setCurrentScreen} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<GameWrapper />);