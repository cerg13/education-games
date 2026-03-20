'use client';

import { useCallback } from 'react';
import type { SubjectId } from '@/lib/curriculum/types';

function useSpeak() {
  return useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  }, []);
}

const SUBJECT_CONFIG: Record<SubjectId, { name: string; icon: string; color: string; gradient: string }> = {
  math: { name: 'Математика', icon: '🔢', color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
  reading: { name: 'Чтение', icon: '📖', color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
  world: { name: 'Окружающий мир', icon: '🌍', color: '#10B981', gradient: 'from-emerald-500 to-teal-600' },
  logic: { name: 'Логика', icon: '🧩', color: '#F59E0B', gradient: 'from-amber-400 to-orange-500' },
  nature: { name: 'Природа', icon: '🌿', color: '#22C55E', gradient: 'from-green-500 to-emerald-600' },
  emotions: { name: 'Эмоции', icon: '💖', color: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
  safety: { name: 'Безопасность', icon: '🛡️', color: '#EF4444', gradient: 'from-red-500 to-orange-600' },
};

interface SubjectCardProps {
  subjectId: SubjectId;
  level: number;
  lessonsCompleted: number;
  averageScore: number;
  onClick: () => void;
  isLocked?: boolean;
}

export function SubjectCard({
  subjectId,
  level,
  lessonsCompleted,
  averageScore,
  onClick,
  isLocked = false,
}: SubjectCardProps) {
  const config = SUBJECT_CONFIG[subjectId];
  const stars = Math.min(3, Math.floor(averageScore / 30));
  const speak = useSpeak();

  const handleClick = () => {
    speak(config.name);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={`
        w-full rounded-3xl p-5 shadow-xl transition-all duration-200
        ${isLocked
          ? 'bg-gray-300 opacity-60 cursor-not-allowed'
          : `bg-gradient-to-br ${config.gradient} hover:scale-[1.03] active:scale-95 cursor-pointer`
        }
      `}
    >
      <div className="flex items-center gap-4">
        <span className="text-5xl">{config.icon}</span>
        <div className="flex-1 text-left">
          <h3 className="text-xl font-bold text-white">{config.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/80 text-sm">Уровень {level}</span>
            <span className="text-white/60 text-sm">|</span>
            <span className="text-white/80 text-sm">{lessonsCompleted} уроков</span>
          </div>
          {lessonsCompleted > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-lg ${s <= stars ? 'opacity-100' : 'opacity-30'}`}>
                  ⭐
                </span>
              ))}
              <span className="text-white/60 text-xs ml-1">{averageScore}%</span>
            </div>
          )}
        </div>
        <span className="text-3xl text-white/80">▶️</span>
      </div>
    </button>
  );
}
