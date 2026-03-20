'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface SlideElement {
  id: string;
  type: string;
  content?: string;
  latex?: string;
}

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: { label: string; value: string }[];
  answer?: string[];
  analysis?: string;
  points?: number;
}

interface SceneAction {
  id: string;
  type: string;
  text?: string;
  elementId?: string;
}

interface Scene {
  id: string;
  type: 'slide' | 'quiz';
  title: string;
  content: any;
  actions?: SceneAction[];
}

interface ClassroomData {
  id: string;
  stage: { name: string; language: string };
  scenes: Scene[];
}

export default function KidsClassroomPage() {
  const params = useParams();
  const classroomId = params?.id as string;
  const [data, setData] = useState<ClassroomData | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [currentAction, setCurrentAction] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  }, []);

  useEffect(() => {
    fetch(`/api/classroom?id=${classroomId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.classroom) {
          setData(json.classroom);
        } else {
          setError('Урок не найден');
        }
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [classroomId]);

  // Auto-speak current action
  useEffect(() => {
    if (!data) return;
    const scene = data.scenes[currentScene];
    if (!scene?.actions) return;

    const action = scene.actions[currentAction];
    if (action?.type === 'speech' && action.text) {
      speak(action.text);
    }
  }, [data, currentScene, currentAction, speak]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">📚</div>
          <p className="text-white text-2xl">Загружаем урок...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-500 to-orange-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4">😕</div>
          <p className="text-white text-2xl">{error || 'Ошибка'}</p>
          <a href="/kids" className="mt-4 inline-block bg-white text-purple-600 px-6 py-3 rounded-full font-bold">
            Назад
          </a>
        </div>
      </div>
    );
  }

  const scene = data.scenes[currentScene];
  const totalScenes = data.scenes.length;
  const speechActions = scene?.actions?.filter(a => a.type === 'speech') || [];
  const currentSpeech = speechActions[currentAction]?.text || '';

  const nextAction = () => {
    if (currentAction < speechActions.length - 1) {
      setCurrentAction(currentAction + 1);
    } else if (currentScene < totalScenes - 1) {
      setCurrentScene(currentScene + 1);
      setCurrentAction(0);
    }
  };

  const prevAction = () => {
    if (currentAction > 0) {
      setCurrentAction(currentAction - 1);
    } else if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
      setCurrentAction(0);
    }
  };

  const handleQuizAnswer = (questionId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const checkQuizAnswer = (question: QuizQuestion) => {
    const userAnswer = quizAnswers[question.id];
    const isCorrect = question.answer?.includes(userAnswer) || false;
    setQuizResults(prev => ({ ...prev, [question.id]: isCorrect }));
    if (isCorrect) {
      speak('Правильно! Молодец!');
    } else {
      speak('Попробуй ещё раз!');
    }
  };

  // Extract text content from slide elements
  const getSlideTexts = (content: any): string[] => {
    if (!content?.canvas?.elements) return [];
    return content.canvas.elements
      .filter((el: any) => el.type === 'text' && el.content)
      .map((el: any) => {
        // Strip HTML tags
        return el.content.replace(/<[^>]*>/g, '').trim();
      })
      .filter((t: string) => t.length > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-black/20">
        <a href="/kids" className="text-white text-2xl hover:scale-110 transition-all">←</a>
        <h1 className="text-white font-bold text-lg">{data.stage.name}</h1>
        <span className="text-white/70 text-sm">{currentScene + 1}/{totalScenes}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/20 h-2">
        <div
          className="h-2 bg-green-400 transition-all duration-500"
          style={{ width: `${((currentScene + 1) / totalScenes) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h2 className="text-2xl font-bold text-white text-center mb-4">{scene.title}</h2>

        {scene.type === 'slide' && (
          <div className="flex-1 flex flex-col">
            {/* Slide content */}
            <div className="bg-white rounded-2xl p-6 shadow-xl flex-1 mb-4">
              {getSlideTexts(scene.content).map((text, i) => (
                <p
                  key={i}
                  onClick={() => speak(text)}
                  className="text-gray-800 text-lg mb-3 leading-relaxed cursor-pointer hover:bg-purple-50 active:bg-purple-100 rounded-lg p-1 -m-1 transition-colors"
                  title="Нажми, чтобы послушать"
                >
                  🔊 {text}
                </p>
              ))}
            </div>

            {/* Speech bubble */}
            {currentSpeech && (
              <div
                onClick={() => speak(currentSpeech)}
                className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-4 cursor-pointer hover:bg-white/30 active:bg-white/40 transition-colors"
              >
                <p className="text-white text-lg leading-relaxed">🗣️ {currentSpeech}</p>
              </div>
            )}
          </div>
        )}

        {scene.type === 'quiz' && (
          <div className="flex-1 flex flex-col gap-4">
            {/* Speech intro */}
            {currentSpeech && (
              <div
                onClick={() => speak(currentSpeech)}
                className="bg-white/20 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/30 transition-colors"
              >
                <p className="text-white text-lg">🗣️ {currentSpeech}</p>
              </div>
            )}

            {/* Questions */}
            {scene.content?.questions?.map((q: QuizQuestion) => (
              <div key={q.id} className="bg-white rounded-2xl p-5 shadow-xl">
                <p
                  onClick={() => speak(q.question)}
                  className="text-gray-800 font-bold text-lg mb-3 cursor-pointer hover:bg-purple-50 rounded-lg p-1 -m-1 transition-colors"
                >
                  🔊 {q.question}
                </p>
                <div className="space-y-2">
                  {q.options?.map((opt) => {
                    const isSelected = quizAnswers[q.id] === opt.value;
                    const result = quizResults[q.id];
                    const isCorrect = result !== null && result !== undefined && q.answer?.includes(opt.value);
                    const isWrong = result !== null && result !== undefined && isSelected && !isCorrect;

                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleQuizAnswer(q.id, opt.value);
                          speak(opt.label);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-lg font-bold transition-all
                          ${isCorrect && result !== null ? 'bg-green-100 border-2 border-green-500 text-green-700' : ''}
                          ${isWrong ? 'bg-red-100 border-2 border-red-400 text-red-700 animate-[shake_0.3s]' : ''}
                          ${isSelected && result === undefined ? 'bg-purple-100 border-2 border-purple-500 text-purple-700' : ''}
                          ${!isSelected && result === undefined ? 'bg-gray-100 hover:bg-purple-50 text-gray-700' : ''}
                        `}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {quizAnswers[q.id] && quizResults[q.id] === undefined && (
                  <button
                    onClick={() => checkQuizAnswer(q)}
                    className="mt-3 w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Проверить ✓
                  </button>
                )}

                {quizResults[q.id] !== undefined && (
                  <div className={`mt-3 p-3 rounded-xl ${quizResults[q.id] ? 'bg-green-50' : 'bg-orange-50'}`}>
                    <p className={`font-bold ${quizResults[q.id] ? 'text-green-700' : 'text-orange-700'}`}>
                      {quizResults[q.id] ? '⭐ Правильно!' : '🔄 Попробуй ещё!'}
                    </p>
                    {quizResults[q.id] && q.analysis && (
                      <p className="text-green-600 text-sm mt-1">{q.analysis}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        <button
          onClick={prevAction}
          disabled={currentScene === 0 && currentAction === 0}
          className="flex-1 bg-white/20 text-white py-3 rounded-xl font-bold disabled:opacity-30 hover:bg-white/30 transition-all"
        >
          ← Назад
        </button>
        {currentScene < totalScenes - 1 || currentAction < speechActions.length - 1 ? (
          <button
            onClick={nextAction}
            className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all"
          >
            Дальше →
          </button>
        ) : (
          <a
            href="/kids"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 py-3 rounded-xl font-bold text-center hover:scale-[1.02] active:scale-95 transition-all"
          >
            Готово! 🎉
          </a>
        )}
      </div>
    </div>
  );
}
