'use client';

import { useState, useEffect, useCallback } from 'react';
import { SubjectCard } from '@/components/kids/SubjectCard';
import { LessonFeedback } from '@/components/kids/LessonFeedback';
import { ParentDashboard } from '@/components/kids/ParentDashboard';
import { useCurriculumStore } from '@/lib/curriculum/store';
import { calculateStars } from '@/lib/curriculum';
import type { SubjectId, FeedbackRating } from '@/lib/curriculum/types';

type Screen = 'profiles' | 'create' | 'menu' | 'subjects' | 'lesson' | 'feedback' | 'parent';

const CHARACTERS = [
  { id: 'fox', name: 'Лисёнок', emoji: '🦊', color: '#FF9F43' },
  { id: 'bunny', name: 'Зайка', emoji: '🐰', color: '#A8E6CF' },
  { id: 'bear', name: 'Мишка', emoji: '🐻', color: '#FFEAA7' },
  { id: 'cat', name: 'Котик', emoji: '🐱', color: '#FFB6C1' },
  { id: 'panda', name: 'Панда', emoji: '🐼', color: '#E0E0E0' },
];

export default function KidsPage() {
  const store = useCurriculumStore();
  const [screen, setScreen] = useState<Screen>('profiles');
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(5);
  const [newCharacter, setNewCharacter] = useState('fox');
  const [lessonScore, setLessonScore] = useState(0);

  // Load profiles on mount
  useEffect(() => {
    const profiles = Object.values(store.profiles);
    if (store.activeChildId && store.profiles[store.activeChildId]) {
      setScreen('menu');
    } else if (profiles.length > 0) {
      setScreen('profiles');
    }
  }, []);

  // Start background worker
  useEffect(() => {
    if (store.activeChildId && !store.isWorkerRunning) {
      store.startBackgroundWorker();
    }
    return () => {
      if (store.isWorkerRunning) {
        store.stopBackgroundWorker();
      }
    };
  }, [store.activeChildId]);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const handleCreateProfile = () => {
    if (!newName.trim()) return;
    const id = store.createProfile(newName.trim(), newAge, newCharacter);
    store.setActiveChild(id);
    speak(`Привет, ${newName}!`);
    setScreen('menu');
  };

  const handleSelectProfile = (id: string) => {
    store.setActiveChild(id);
    const profile = store.profiles[id];
    if (profile) speak(`Привет, ${profile.name}!`);
    setScreen('menu');
  };

  const [generating, setGenerating] = useState(false);

  const handleStartLesson = async () => {
    const lesson = store.getNextLesson();
    if (!lesson) {
      speak('Уроки готовятся, подожди немного');
      return;
    }

    // If lesson already has a classroomId, go directly to it
    if (lesson.classroomId) {
      store.startLesson(lesson.id);
      window.location.href = `/kids/classroom/${lesson.classroomId}`;
      return;
    }

    // Generate classroom via OpenMAIC API
    speak(`Готовим урок: ${lesson.title}. Подожди немножко!`);
    setGenerating(true);

    try {
      const res = await fetch('/api/generate-classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement: `Урок для ребёнка ${profile?.age || 5} лет на тему "${lesson.title}". ${lesson.description}. Сделай 3 сцены: объяснение с примерами, практика, квиз.`,
          language: 'ru-RU',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Generation failed');

      // Poll until done
      const jobId = data.jobId;
      let classroomId = '';
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(`/api/generate-classroom/${jobId}`);
        const status = await poll.json();
        if (status.status === 'succeeded' && status.result?.classroomId) {
          classroomId = status.result.classroomId;
          break;
        }
        if (status.status === 'failed') throw new Error(status.error || 'Failed');
      }

      if (classroomId) {
        store.startLesson(lesson.id);
        window.location.href = `/kids/classroom/${classroomId}`;
      } else {
        throw new Error('Timeout');
      }
    } catch (e) {
      speak('Ой, не получилось создать урок. Попробуй ещё раз!');
      setGenerating(false);
    }
  };

  const handleCompleteLesson = () => {
    const score = Math.floor(Math.random() * 40) + 60;
    setLessonScore(score);
    setScreen('feedback');
  };

  const handleFeedback = (feedback: FeedbackRating) => {
    if (store.activeLesson) {
      store.completeLesson(store.activeLesson.id, lessonScore, feedback, 300);
    }
    setScreen('menu');
    speak('Отлично! Выбирай следующий урок');
  };

  // Auto-speak on screen change (for non-reading children)
  useEffect(() => {
    const delay = setTimeout(() => {
      switch (screen) {
        case 'profiles':
          speak('Выбери игрока');
          break;
        case 'create':
          speak('Выбери друга и напиши своё имя');
          break;
        case 'menu': {
          const p = store.getActiveProfile();
          const next = store.getNextLesson();
          if (next) {
            speak(`Привет, ${p?.name || ''}! Следующий урок: ${next.title}. Нажми зелёную кнопку чтобы начать!`);
          } else {
            speak(`Привет, ${p?.name || ''}! Уроки готовятся, подожди немножко`);
          }
          break;
        }
        case 'lesson':
          if (store.activeLesson) {
            speak(`Урок: ${store.activeLesson.title}. ${store.activeLesson.description}`);
          }
          break;
        case 'feedback':
          speak('Молодец! Тебе понравилось? Нажми на смайлик');
          break;
        case 'subjects':
          speak('Выбери предмет');
          break;
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [screen]);

  const profile = store.getActiveProfile();
  const profiles = Object.values(store.profiles);

  // ============= RENDER =============

  // Profile Selection
  if (screen === 'profiles') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">🎓 Умная Классная</h1>
          <p className="text-white/80">Интерактивное обучение с AI</p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid gap-3 mb-4">
            {profiles.map((p) => {
              const char = CHARACTERS.find((c) => c.id === p.character);
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProfile(p.id)}
                  className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4
                    hover:bg-white/30 transition-all"
                >
                  <span className="text-5xl">{char?.emoji || '👤'}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white font-bold text-xl">{p.name}</p>
                    <p className="text-white/70 text-sm">
                      ⭐ {p.totalStars} звёзд | 📚 {p.totalLessonsCompleted} уроков
                    </p>
                  </div>
                  <span className="text-3xl">▶️</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setScreen('create')}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 py-4
            rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          + Новый ученик
        </button>
      </div>
    );
  }

  // Create Profile
  if (screen === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 p-6 flex flex-col items-center justify-center">
        <button
          onClick={() => setScreen('profiles')}
          className="absolute top-4 left-4 text-4xl text-white hover:scale-110 transition-all"
        >
          ←
        </button>

        <p className="text-2xl text-white mb-6 font-bold">Выбери друга</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setNewCharacter(c.id)}
              className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg
                ${newCharacter === c.id ? 'scale-110 ring-4 ring-white' : 'hover:scale-105'}`}
              style={{ backgroundColor: c.color }}
            >
              <span className="text-4xl">{c.emoji}</span>
              <span className="text-xs font-bold mt-1">{c.name}</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Как тебя зовут?"
          className="text-xl text-center py-3 px-6 rounded-2xl bg-white/90 mb-4 w-60 outline-none shadow-lg font-bold"
          maxLength={12}
          autoFocus
        />

        <div className="flex items-center gap-4 mb-6">
          <span className="text-white font-bold">Возраст:</span>
          <div className="flex gap-2">
            {[4, 5, 6, 7, 8].map((age) => (
              <button
                key={age}
                onClick={() => setNewAge(age)}
                className={`w-10 h-10 rounded-full font-bold transition-all ${
                  newAge === age
                    ? 'bg-white text-purple-600 scale-110'
                    : 'bg-white/30 text-white hover:bg-white/40'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {newName.length > 0 && (
          <button
            onClick={handleCreateProfile}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 text-xl
              font-bold py-4 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Поехали! 🚀
          </button>
        )}
      </div>
    );
  }

  // Main Menu
  if (screen === 'menu' && profile) {
    const char = CHARACTERS.find((c) => c.id === profile.character);
    const nextLesson = store.getNextLesson();

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setScreen('profiles')}
            className="flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl py-2 px-4
              hover:bg-white/30 transition-all cursor-pointer"
          >
            <span className="text-4xl">{char?.emoji || '👤'}</span>
            <div>
              <p className="text-white font-bold text-lg">{profile.name}</p>
              <p className="text-white/70 text-sm">⭐ {profile.totalStars} | 📚 {profile.totalLessonsCompleted}</p>
            </div>
          </button>

          <button
            onClick={() => setScreen('parent')}
            className="bg-white/20 backdrop-blur p-3 rounded-xl hover:bg-white/30 transition-all"
            title="Панель родителя"
          >
            <span className="text-2xl">👨‍👩‍👧</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            🎓 Умная Классная
          </h1>
          <p className="text-white/80">AI подготовил для тебя уроки</p>
        </div>

        {/* Next lesson CTA */}
        {generating && (
          <div className="w-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 shadow-2xl mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl animate-bounce">🧠</span>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-white">AI создаёт урок...</h2>
                <p className="text-white/90">Подожди немножко, это займёт пару минут</p>
                <div className="mt-2 w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        {nextLesson && !generating && (
          <button
            onClick={handleStartLesson}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-6
              shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mb-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <span className="text-6xl">🚀</span>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold text-white">Следующий урок</h2>
                <p className="text-white/90 font-bold">{nextLesson.title}</p>
                <p className="text-white/70 text-sm">~{nextLesson.estimatedMinutes} мин</p>
              </div>
              <span className="text-4xl">▶️</span>
            </div>
          </button>
        )}

        {!nextLesson && (
          <div className="w-full bg-white/20 backdrop-blur rounded-3xl p-6 mb-6 text-center">
            <span className="text-5xl block mb-2">⏳</span>
            <p className="text-white font-bold">Готовим новые уроки...</p>
            <p className="text-white/70 text-sm">AI ищет материалы и создаёт задания</p>
          </div>
        )}

        {/* Subject overview */}
        <h3 className="text-white font-bold mb-3">Предметы</h3>
        <div className="space-y-3">
          {(['math', 'reading', 'world'] as SubjectId[]).map((sub) => {
            const progress = profile.subjectProgress[sub];
            return (
              <SubjectCard
                key={sub}
                subjectId={sub}
                level={progress?.currentLevel || 1}
                lessonsCompleted={progress?.lessonsCompleted || 0}
                averageScore={progress?.averageScore || 0}
                onClick={() => setScreen('subjects')}
              />
            );
          })}
        </div>

        <button
          onClick={() => setScreen('subjects')}
          className="w-full mt-3 bg-white/20 backdrop-blur rounded-2xl p-4 text-center
            text-white/80 hover:bg-white/30 transition-all"
        >
          Все предметы →
        </button>
      </div>
    );
  }

  // All Subjects
  if (screen === 'subjects' && profile) {
    const subjects: SubjectId[] = ['math', 'reading', 'world', 'logic', 'nature', 'emotions', 'safety'];
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-600 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setScreen('menu')} className="text-4xl text-white hover:scale-110 transition-all mr-4">
            ←
          </button>
          <h2 className="text-2xl font-bold text-white">Все предметы</h2>
        </div>

        <div className="space-y-3">
          {subjects.map((sub) => {
            const progress = profile.subjectProgress[sub];
            const isLocked = sub !== 'math' && sub !== 'reading' && sub !== 'world' && profile.totalLessonsCompleted < 5;

            return (
              <SubjectCard
                key={sub}
                subjectId={sub}
                level={progress?.currentLevel || 1}
                lessonsCompleted={progress?.lessonsCompleted || 0}
                averageScore={progress?.averageScore || 0}
                onClick={() => {/* TODO: subject-specific lesson start */}}
                isLocked={isLocked}
              />
            );
          })}
        </div>

        {profile.totalLessonsCompleted < 5 && (
          <p className="text-white/60 text-sm text-center mt-4">
            🔒 Пройди 5 уроков, чтобы открыть все предметы
          </p>
        )}
      </div>
    );
  }

  // Active Lesson (placeholder — in real app this renders OpenMAIC classroom)
  if (screen === 'lesson' && store.activeLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <span className="text-7xl block mb-4">📚</span>
          <h2 className="text-3xl font-bold text-white mb-2">{store.activeLesson.title}</h2>
          <p className="text-white/70 mb-8">{store.activeLesson.description}</p>

          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
            <p className="text-white text-lg mb-4">
              Здесь будет интерактивный урок OpenMAIC
            </p>
            <p className="text-white/60 text-sm">
              Слайды + квизы + симуляции с AI-учителем
            </p>
          </div>

          <button
            onClick={handleCompleteLesson}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl
              font-bold py-4 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Завершить урок ✓
          </button>
        </div>
      </div>
    );
  }

  // Feedback
  if (screen === 'feedback' && store.activeLesson) {
    return (
      <LessonFeedback
        lessonTitle={store.activeLesson?.title || 'Урок'}
        score={lessonScore}
        starsEarned={calculateStars(lessonScore)}
        onSubmit={handleFeedback}
      />
    );
  }

  // Parent Dashboard
  if (screen === 'parent' && profile) {
    return (
      <ParentDashboard
        profile={profile}
        onBack={() => setScreen('menu')}
        onAdjustPriority={(subjectId, delta) => {
          // Update preference in profile
          const updatedProfile = { ...profile };
          updatedProfile.preferences.preferredSubjects[subjectId] =
            (updatedProfile.preferences.preferredSubjects[subjectId] || 0) + delta;
          // Note: In production, this would go through the store
        }}
      />
    );
  }

  return null;
}
