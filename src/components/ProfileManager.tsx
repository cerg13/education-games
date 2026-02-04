import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, storage } from '../utils/storage';

const CHARACTERS = [
  { id: 'fox', name: 'Лисёнок', emoji: '🦊', color: '#FF9F43' },
  { id: 'bunny', name: 'Зайка', emoji: '🐰', color: '#A8E6CF' },
  { id: 'bear', name: 'Мишка', emoji: '🐻', color: '#FFEAA7' },
  { id: 'cat', name: 'Котик', emoji: '🐱', color: '#FFB6C1' },
  { id: 'dog', name: 'Щенок', emoji: '🐶', color: '#DEB887' },
  { id: 'panda', name: 'Панда', emoji: '🐼', color: '#E0E0E0' },
];

const useSpeak = () => useCallback((text: string, rate = 0.75) => {
  if (typeof window !== 'undefined' && (window as any).speechSynthesis) {
    (window as any).speechSynthesis.cancel();
    const u = new (window as any).SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    u.rate = rate;
    (window as any).speechSynthesis.speak(u);
  }
}, []);

interface ProfileSelectProps {
  profiles: PlayerProfile[];
  onSelect: (profile: PlayerProfile) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({ profiles, onSelect, onCreate, onDelete }) => {
  const speak = useSpeak();

  useEffect(() => {
    speak('Выбери игрока');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4 flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">🎮 Обучающие Игры</h1>
        <p className="text-white/80">Выбери игрока</p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid gap-3 mb-4">
          {profiles.map(p => {
            const char = CHARACTERS.find(c => c.id === p.character);
            return (
              <div key={p.id} className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4 hover:bg-white/30 transition-all">
                <span className="text-5xl">{char?.emoji || '👤'}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-xl">{p.name}</p>
                  <p className="text-white/70 text-sm">⭐ {p.totalStars || 0} звёзд</p>
                </div>
                <button
                  onClick={() => onSelect(p)}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Играть
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Удалить игрока ${p.name}?`)) {
                      onDelete(p.id);
                    }
                  }}
                  className="text-white/50 hover:text-white text-2xl transition-all"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onCreate}
        className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 py-4 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        ➕ Новый игрок
      </button>
    </div>
  );
};

interface CreateProfileProps {
  onBack: () => void;
  onCreate: (name: string, character: string) => void;
}

export const CreateProfile: React.FC<CreateProfileProps> = ({ onBack, onCreate }) => {
  const [step, setStep] = useState(0);
  const [character, setCharacter] = useState<any>(null);
  const [name, setName] = useState('');
  const speak = useSpeak();

  useEffect(() => {
    speak(step === 0 ? 'Выбери друга' : 'Как тебя зовут');
  }, [step, speak]);

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col items-center justify-center">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-4xl text-white hover:scale-110 transition-all"
        >
          ←
        </button>
        <p className="text-2xl text-white mb-8 font-bold">Выбери друга</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {CHARACTERS.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setCharacter(c);
                speak(c.name);
              }}
              className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg hover:scale-105 ${
                character?.id === c.id ? 'scale-110 ring-4 ring-white' : ''
              }`}
              style={{ backgroundColor: c.color }}
            >
              <span className="text-5xl mb-1">{c.emoji}</span>
              <span className="text-sm font-bold text-gray-800">{c.name}</span>
            </button>
          ))}
        </div>
        {character && (
          <button
            onClick={() => setStep(1)}
            className="bg-white text-purple-600 text-xl font-bold py-4 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Дальше →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col items-center justify-center">
      <button
        onClick={() => setStep(0)}
        className="absolute top-4 left-4 text-4xl text-white hover:scale-110 transition-all"
      >
        ←
      </button>
      <span className="text-7xl mb-6">{character.emoji}</span>
      <p className="text-2xl text-white mb-6 font-bold">Как тебя зовут?</p>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Введи имя"
        className="text-2xl text-center py-4 px-8 rounded-2xl bg-white/90 mb-8 w-64 outline-none shadow-lg font-bold"
        maxLength={12}
        autoFocus
      />
      {name.length > 0 && (
        <button
          onClick={() => onCreate(name, character.id)}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 text-xl font-bold py-4 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Поехали! 🚀
        </button>
      )}
    </div>
  );
};
