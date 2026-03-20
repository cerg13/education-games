'use client';

import { useState } from 'react';
import type { FeedbackRating } from '@/lib/curriculum/types';

interface LessonFeedbackProps {
  lessonTitle: string;
  score: number;
  starsEarned: number;
  onSubmit: (feedback: FeedbackRating) => void;
}

const FEEDBACK_OPTIONS: { rating: FeedbackRating; emoji: string; label: string; color: string }[] = [
  { rating: 'loved', emoji: '😍', label: 'Супер!', color: 'from-pink-400 to-rose-500' },
  { rating: 'liked', emoji: '😊', label: 'Понравилось', color: 'from-green-400 to-emerald-500' },
  { rating: 'neutral', emoji: '😐', label: 'Нормально', color: 'from-amber-400 to-yellow-500' },
  { rating: 'disliked', emoji: '😕', label: 'Не очень', color: 'from-gray-400 to-gray-500' },
];

export function LessonFeedback({ lessonTitle, score, starsEarned, onSubmit }: LessonFeedbackProps) {
  const [selected, setSelected] = useState<FeedbackRating | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6">
      {/* Stars animation */}
      <div className="mb-6 flex gap-3">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`text-6xl transition-all duration-500 ${
              s <= starsEarned ? 'scale-110 animate-bounce' : 'opacity-30 scale-75'
            }`}
            style={{ animationDelay: `${s * 200}ms` }}
          >
            ⭐
          </span>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Молодец!</h2>
      <p className="text-white/80 text-lg mb-2">{lessonTitle}</p>
      <p className="text-white/60 mb-8">Результат: {score}%</p>

      <p className="text-xl text-white mb-4 font-bold">Тебе понравилось?</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {FEEDBACK_OPTIONS.map((opt) => (
          <button
            key={opt.rating}
            onClick={() => setSelected(opt.rating)}
            className={`
              bg-gradient-to-br ${opt.color} rounded-2xl p-4 text-center
              transition-all duration-200 shadow-lg
              ${selected === opt.rating ? 'ring-4 ring-white scale-105' : 'hover:scale-105'}
            `}
          >
            <span className="text-4xl block mb-1">{opt.emoji}</span>
            <span className="text-white font-bold text-sm">{opt.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={() => onSubmit(selected)}
          className="bg-white text-purple-600 font-bold text-xl py-4 px-12 rounded-full
            hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Дальше! 🚀
        </button>
      )}
    </div>
  );
}
