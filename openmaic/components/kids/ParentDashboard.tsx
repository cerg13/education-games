'use client';

import { useState } from 'react';
import type { ChildProfile, SubjectId, LessonResult } from '@/lib/curriculum/types';

const SUBJECT_META: Record<SubjectId, { name: string; icon: string; color: string }> = {
  math: { name: 'Математика', icon: '🔢', color: '#8B5CF6' },
  reading: { name: 'Чтение', icon: '📖', color: '#3B82F6' },
  world: { name: 'Окр. мир', icon: '🌍', color: '#10B981' },
  logic: { name: 'Логика', icon: '🧩', color: '#F59E0B' },
  nature: { name: 'Природа', icon: '🌿', color: '#22C55E' },
  emotions: { name: 'Эмоции', icon: '💖', color: '#EC4899' },
  safety: { name: 'Безопасность', icon: '🛡️', color: '#EF4444' },
};

interface ParentDashboardProps {
  profile: ChildProfile;
  onBack: () => void;
  onAdjustPriority: (subjectId: SubjectId, delta: number) => void;
}

export function ParentDashboard({ profile, onBack, onAdjustPriority }: ParentDashboardProps) {
  const [tab, setTab] = useState<'progress' | 'history' | 'settings'>('progress');

  const subjects: SubjectId[] = ['math', 'reading', 'world', 'logic', 'nature', 'emotions', 'safety'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white text-2xl hover:scale-110 transition-all">
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Панель родителя</h1>
            <p className="text-white/70 text-sm">{profile.name} | {profile.totalLessonsCompleted} уроков | {profile.totalStars} звёзд</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {(['progress', 'history', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                tab === t ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {t === 'progress' ? '📊 Прогресс' : t === 'history' ? '📋 История' : '⚙️ Настройки'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {tab === 'progress' && (
          <ProgressTab profile={profile} subjects={subjects} />
        )}
        {tab === 'history' && (
          <HistoryTab history={profile.lessonHistory} />
        )}
        {tab === 'settings' && (
          <SettingsTab
            profile={profile}
            subjects={subjects}
            onAdjustPriority={onAdjustPriority}
          />
        )}
      </div>
    </div>
  );
}

function ProgressTab({ profile, subjects }: { profile: ChildProfile; subjects: SubjectId[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Прогресс по предметам</h2>
      {subjects.map((sub) => {
        const progress = profile.subjectProgress[sub];
        const meta = SUBJECT_META[sub];
        if (!progress) return null;

        const progressPercent = Math.min(100, (progress.currentLevel / 10) * 100);

        return (
          <div key={sub} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{meta.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">{meta.name}</h3>
                  <span className="text-sm text-gray-500">Уровень {progress.currentLevel}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{progress.lessonsCompleted} уроков</span>
              <span>{progress.completedTopics.length} тем пройдено</span>
              {progress.averageScore > 0 && (
                <span>Средний балл: {progress.averageScore}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryTab({ history }: { history: LessonResult[] }) {
  const recent = [...history].reverse().slice(0, 20);

  if (recent.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-4">📚</span>
        <p className="text-gray-500">Пока нет пройденных уроков</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Последние уроки</h2>
      {recent.map((result, i) => {
        const meta = SUBJECT_META[result.subjectId];
        const feedbackEmoji =
          result.feedback === 'loved' ? '😍' :
          result.feedback === 'liked' ? '😊' :
          result.feedback === 'neutral' ? '😐' : '😕';

        return (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            <span className="text-xl">{meta.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{meta.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(result.completedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: meta.color }}>{result.score}%</span>
              <span>{feedbackEmoji}</span>
              <div className="flex">
                {[1, 2, 3].map((s) => (
                  <span key={s} className={`text-xs ${s <= result.starsEarned ? '' : 'opacity-20'}`}>⭐</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab({
  profile,
  subjects,
  onAdjustPriority,
}: {
  profile: ChildProfile;
  subjects: SubjectId[];
  onAdjustPriority: (subjectId: SubjectId, delta: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Приоритет предметов</h2>
      <p className="text-sm text-gray-500 mb-4">
        Настройте, какие предметы система будет предлагать чаще
      </p>
      {subjects.map((sub) => {
        const meta = SUBJECT_META[sub];
        const preference = profile.preferences.preferredSubjects[sub] || 0;

        return (
          <div key={sub} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{meta.name}</p>
              <p className="text-xs text-gray-500">
                Приоритет: {preference > 0 ? `+${preference}` : preference}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAdjustPriority(sub, -1)}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold hover:bg-gray-300 transition-all"
              >
                −
              </button>
              <button
                onClick={() => onAdjustPriority(sub, 1)}
                className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold hover:bg-purple-200 transition-all"
              >
                +
              </button>
            </div>
          </div>
        );
      })}

      <div className="mt-6 bg-blue-50 rounded-xl p-4">
        <h3 className="font-bold text-blue-800 mb-2">Как работает система</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Система запоминает, что понравилось ребёнку</li>
          <li>• Автоматически ищет новые материалы в интернете</li>
          <li>• Генерирует уроки заранее — ребёнок не ждёт</li>
          <li>• Адаптирует сложность: легко — сложнее, трудно — проще</li>
          <li>• Ротация тем по прогрессу в каждом предмете</li>
        </ul>
      </div>
    </div>
  );
}
