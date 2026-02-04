import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, storage } from './utils/storage';
import { ProfileSelect, CreateProfile } from './components/ProfileManager';

// Импортируем игры (они будут загружаться динамически)
const GAMES = [
  {
    id: 'number-racing',
    name: 'Гонки с Числами',
    description: 'Учись считать и решать примеры',
    icon: '🏎️',
    color: 'from-violet-600 to-purple-600',
    minAge: 4,
    skills: ['Математика', 'Счёт', 'Логика'],
  },
  {
    id: 'reading-game',
    name: 'Читайка',
    description: 'Учись читать слоги и слова',
    icon: '📚',
    color: 'from-indigo-500 to-purple-600',
    minAge: 4,
    skills: ['Чтение', 'Буквы', 'Слоги'],
  },
];

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

// Главное меню маркетплейса
interface GameMenuProps {
  profile: PlayerProfile;
  onSelectGame: (gameId: string) => void;
  onProfile: () => void;
  onStats: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ profile, onSelectGame, onProfile, onStats }) => {
  const speak = useSpeak();
  const char = CHARACTERS.find(c => c.id === profile.character);

  useEffect(() => {
    speak('Выбери игру');
  }, [speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 p-4">
      {/* Шапка профиля */}
      <div className="flex items-center justify-between mb-6">
        <div
          onClick={onProfile}
          className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl py-2 px-4 hover:bg-white/30 transition-all cursor-pointer"
        >
          <span className="text-4xl">{char?.emoji || '👤'}</span>
          <div>
            <p className="text-white font-bold text-lg">{profile.name}</p>
            <p className="text-white/70 text-sm">⭐ {profile.totalStars || 0} звёзд</p>
          </div>
        </div>

        <button
          onClick={onStats}
          className="bg-white/20 backdrop-blur p-3 rounded-xl hover:bg-white/30 transition-all"
        >
          <span className="text-3xl">📊</span>
        </button>
      </div>

      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🎮 Обучающие Игры
        </h1>
        <p className="text-white/80 text-lg">Выбери игру для обучения</p>
      </div>

      {/* Список игр */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              speak(game.name);
              onSelectGame(game.id);
            }}
            className={`w-full bg-gradient-to-r ${game.color} rounded-3xl p-6 shadow-2xl hover:scale-105 active:scale-95 transition-all`}
          >
            <div className="flex items-center gap-4">
              <span className="text-6xl">{game.icon}</span>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-white mb-1">{game.name}</h2>
                <p className="text-white/80 text-sm mb-2">{game.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {game.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-white/20 backdrop-blur px-2 py-1 rounded-lg text-xs text-white font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-4xl">▶️</span>
            </div>
          </button>
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="mt-8 text-center">
        <p className="text-white/60 text-sm">Все игры адаптированы для детей от 4 лет</p>
      </div>
    </div>
  );
};

// Экран статистики
interface StatsScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ profile, onBack }) => {
  const speak = useSpeak();

  useEffect(() => {
    speak('Твоя статистика');
  }, [speak]);

  const stats = profile.stats || {};
  const days = Object.entries(stats).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);

  // Подсчет общей статистики
  const totalGames = days.reduce((sum, [_, data]) => sum + (data.gamesPlayed || 0), 0);
  const totalTasks = days.reduce((sum, [_, data]) => sum + (data.tasksCompleted || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-500 to-purple-600 p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-4xl text-white hover:scale-110 transition-all mr-4"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold text-white">Статистика</h2>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
          <span className="text-4xl block mb-2">⭐</span>
          <p className="text-3xl font-black text-white">{profile.totalStars || 0}</p>
          <p className="text-white/70 text-sm">Всего звёзд</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
          <span className="text-4xl block mb-2">🎮</span>
          <p className="text-3xl font-black text-white">{totalGames}</p>
          <p className="text-white/70 text-sm">Игр сыграно</p>
        </div>
      </div>

      {/* История по дням */}
      <h3 className="text-white font-bold mb-3">История обучения</h3>
      {days.length === 0 ? (
        <div className="text-center text-white/60 mt-12">
          <p className="text-5xl mb-4">📚</p>
          <p>Пока нет данных. Начни играть!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map(([date, data]) => (
            <div key={date} className="bg-white/20 backdrop-blur rounded-xl p-4">
              <p className="text-white/80 text-sm mb-2">
                {new Date(date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <div className="flex justify-between text-white">
                <span>📋 {data.tasksCompleted || 0} заданий</span>
                <span>⭐ +{data.starsEarned || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Главный компонент маркетплейса
export default function Marketplace() {
  const [screen, setScreen] = useState<'loading' | 'profiles' | 'create' | 'menu' | 'stats' | 'game'>('loading');
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Загрузка профилей
  useEffect(() => {
    const loadProfiles = async () => {
      const loadedProfiles = await storage.getProfiles();
      setProfiles(loadedProfiles);

      // Проверяем, есть ли текущий профиль
      const currentProfileId = await storage.getCurrentProfile();
      if (currentProfileId && loadedProfiles.length > 0) {
        const profile = loadedProfiles.find(p => p.id === currentProfileId.id);
        if (profile) {
          setCurrentProfile(profile);
          setScreen('menu');
          return;
        }
      }

      setScreen('profiles');
    };

    loadProfiles();
  }, []);

  // Выбор профиля
  const handleSelectProfile = async (profile: PlayerProfile) => {
    setCurrentProfile(profile);
    await storage.setCurrentProfile(profile.id);
    setScreen('menu');
  };

  // Создание профиля
  const handleCreateProfile = async (name: string, character: string) => {
    const newProfile = await storage.createProfile(name, character);
    setProfiles([...profiles, newProfile]);
    setCurrentProfile(newProfile);
    await storage.setCurrentProfile(newProfile.id);
    setScreen('menu');
  };

  // Удаление профиля
  const handleDeleteProfile = async (id: string) => {
    await storage.deleteProfile(id);
    const updatedProfiles = profiles.filter(p => p.id !== id);
    setProfiles(updatedProfiles);

    if (currentProfile?.id === id) {
      setCurrentProfile(null);
      setScreen('profiles');
    }
  };

  // Выбор игры
  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
    setScreen('game');
  };

  // Возврат из игры
  const handleBackFromGame = async () => {
    // Перезагружаем профиль, чтобы получить обновленные данные
    const updatedProfiles = await storage.getProfiles();
    const updatedProfile = updatedProfiles.find(p => p.id === currentProfile?.id);
    if (updatedProfile) {
      setCurrentProfile(updatedProfile);
    }
    setProfiles(updatedProfiles);
    setSelectedGame(null);
    setScreen('menu');
  };

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🎮</div>
          <p className="text-white text-2xl">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (screen === 'profiles') {
    return (
      <ProfileSelect
        profiles={profiles}
        onSelect={handleSelectProfile}
        onCreate={() => setScreen('create')}
        onDelete={handleDeleteProfile}
      />
    );
  }

  if (screen === 'create') {
    return (
      <CreateProfile
        onBack={() => setScreen('profiles')}
        onCreate={handleCreateProfile}
      />
    );
  }

  if (screen === 'stats' && currentProfile) {
    return (
      <StatsScreen
        profile={currentProfile}
        onBack={() => setScreen('menu')}
      />
    );
  }

  if (screen === 'menu' && currentProfile) {
    return (
      <GameMenu
        profile={currentProfile}
        onSelectGame={handleSelectGame}
        onProfile={() => setScreen('profiles')}
        onStats={() => setScreen('stats')}
      />
    );
  }

  if (screen === 'game' && selectedGame && currentProfile) {
    // Здесь будет рендериться выбранная игра
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Игра: {selectedGame}</p>
          <p className="text-white/60 mb-6">Загрузка игры...</p>
          <button
            onClick={handleBackFromGame}
            className="bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all"
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return null;
}
