# Реализация Системы Достижений
## Дата: 2024-12-11

---

## ✅ УЖЕ РЕАЛИЗОВАНО

### 1. Список из 23 Достижений

```typescript
const ACHIEVEMENTS = [
  // Beginner (3)
  'first_win' - Первая Победа 🎉
  'first_steps' - Первые Шаги 👣 (10 правильных ответов)
  'star_collector' - Собиратель Звёзд ⭐ (50 звёзд)

  // Speed (2)
  'speed_demon' - Демон Скорости ⚡ (< 2 сек)
  'lightning_fast' - Молниеносный ⚡⚡ (< 1 сек)

  // Accuracy (3)
  'perfectionist' - Перфекционист 💯 (1 гонка без ошибок)
  'master' - Мастер 🎯 (5 гонок без ошибок)
  'accuracy_king' - Король Точности 👑 (90%+ точность)

  // Streak (3)
  'hot_streak' - Горячая Серия 🔥 (5 подряд)
  'unstoppable' - Неостановимый 🔥🔥 (10 подряд)
  'legendary' - Легендарный 🔥🔥🔥 (15 подряд)

  // Practice (4)
  'dedicated' - Целеустремлённый 🎮 (10 гонок)
  'veteran' - Ветеран 🎖️ (50 гонок)
  'math_ninja' - Ниндзя Математики 🥷 (100 правильных)
  'math_master' - Мастер Математики 🧙 (500 правильных)

  // Collector (3)
  'car_collector' - Коллекционер 🚗 (все машинки)
  'rich' - Богач 💰 (100 звёзд)
  'millionaire' - Миллионер 💎 (200 звёзд)

  // Special (5)
  'comeback' - Возвращение ❤️‍🔥 (победа с 1 сердцем)
  'explorer' - Исследователь 🔍 (все типы заданий)
  'night_owl' - Ночная Сова 🦉 (игра после 22:00)
  'early_bird' - Ранняя Птичка 🐦 (игра до 7:00)
  'persistent' - Настойчивый 💪 (продолжение гонки)
];
```

### 2. Расширенная Статистика

Добавлены новые поля в `stats`:
```typescript
stats: {
  // Базовые (уже были)
  totalRaces: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,

  // Новые для достижений
  wins: 0,                // Количество побед
  perfectRaces: 0,        // Гонки без ошибок
  fastestAnswer: 0,       // Самый быстрый ответ (ms)
  totalStarsEarned: 0,    // Всего заработано звёзд
  comebackWins: 0,        // Победы с 1 сердцем
  taskTypesTried: 0,      // Попробовано типов заданий
  nightGames: 0,          // Игр ночью
  morningGames: 0,        // Игр утром
  continuedRaces: 0,      // Продолженных гонок
}
```

### 3. State для Достижений

```typescript
achievements: {}  // Объект { achievementId: true }
```

### 4. Функция Проверки Достижений

```typescript
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
```

### 5. Трекинг Времени Ответа

```typescript
const [answerStartTime, setAnswerStartTime] = useState(0);

// В getNextTask:
setAnswerStartTime(Date.now()); // Start timer
```

---

## 🔨 ЧТО НУЖНО ДОДЕЛАТЬ

### Шаг 1: Обновить handleAnswer

Добавить отслеживание статистики:

```typescript
const handleAnswer = (answer) => {
  // Block answers when paused
  if (isPaused) return;

  const isCorrect = answer === task.correct;

  // ===== ДОБАВИТЬ ЗДЕСЬ =====
  // Calculate answer time
  const answerTime = Date.now() - answerStartTime;

  // Update fastest answer if correct
  let newStats = { ...gameState.stats };

  if (isCorrect) {
    if (newStats.fastestAnswer === 0 || answerTime < newStats.fastestAnswer) {
      newStats.fastestAnswer = answerTime;
    }

    // Track task types tried
    const taskType = task.visual.type;
    if (!gameState.taskTypesSeen) {
      gameState.taskTypesSeen = {};
    }
    if (!gameState.taskTypesSeen[taskType]) {
      gameState.taskTypesSeen[taskType] = true;
      newStats.taskTypesTried = Object.keys(gameState.taskTypesSeen).length;
    }
  }
  // ===== КОНЕЦ =====

  setShowResult(isCorrect ? 'correct' : 'wrong');
  setCarBounce(true);
  setIsMoving(false);

  // ... rest of existing code
};
```

### Шаг 2: Обновить Логику Победы

В блоке где `newProgress >= 100`:

```typescript
if(newProgress >= 100) {
  setShowFinish(true);
  if (gameState.soundOn) sound.playWin();
  sound.stopMusic();

  setTimeout(() => {
    const earned = raceStars + 1;

    // ===== ДОБАВИТЬ ЗДЕСЬ =====
    const isPerfectRace = raceWrong === 0 && totalErrors === 0;
    const isComebackWin = totalErrors === MAX_ERRORS - 1;

    // Check time of day
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour < 6;
    const isMorning = hour < 7;

    const newStats = {
      ...gameState.stats,
      totalRaces: gameState.stats.totalRaces + 1,
      totalCorrect: gameState.stats.totalCorrect + raceCorrect + 1,
      totalWrong: gameState.stats.totalWrong + raceWrong,
      bestStreak: Math.max(gameState.stats.bestStreak, streak + 1),
      wins: gameState.stats.wins + 1,
      perfectRaces: gameState.stats.perfectRaces + (isPerfectRace ? 1 : 0),
      totalStarsEarned: gameState.stats.totalStarsEarned + earned,
      comebackWins: gameState.stats.comebackWins + (isComebackWin ? 1 : 0),
      nightGames: gameState.stats.nightGames + (isNight ? 1 : 0),
      morningGames: gameState.stats.morningGames + (isMorning ? 1 : 0),
    };

    updateGameState({
      stars: gameState.stars + earned,
      stats: newStats
    });

    // Check for new achievements
    checkAchievements(newStats);
    // ===== КОНЕЦ =====

    setScreen('finish');
  }, 1500);
  return;
}
```

### Шаг 3: Отслеживание Продолженных Гонок

В функции `continueRace`:

```typescript
const continueRace = (savedRace) => {
  if (gameState.soundOn) sound.playStart();

  // ===== ДОБАВИТЬ ЗДЕСЬ =====
  // Track continued races
  const newStats = {
    ...gameState.stats,
    continuedRaces: gameState.stats.continuedRaces + 1
  };

  updateGameState({ stats: newStats });
  checkAchievements(newStats);
  // ===== КОНЕЦ =====

  setScreen('race');
  // ... rest of code
};
```

### Шаг 4: Экран Достижений

Добавить после garage screen:

```typescript
// ACHIEVEMENTS
if(screen === 'achievements') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4 relative overflow-hidden">
      <style>{styles}</style>
      <Particles />

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('menu'); }} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl hover:bg-white/30 active:scale-90 transition-all">◀️</button>
        <div className="text-3xl">🏆</div>
      </div>

      <div className="text-4xl font-black text-white text-center mb-2">Достижения</div>
      <div className="text-white/80 text-center mb-6">
        {Object.keys(gameState.achievements).length} / {ACHIEVEMENTS.length}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = gameState.achievements[achievement.id];
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg'
                  : 'bg-gray-600/50'
              }`}
              style={isUnlocked ? {animation:'float 3s ease-in-out infinite'} : {}}
            >
              <div className={`text-5xl mb-2 ${!isUnlocked && 'grayscale opacity-30'}`}>
                {achievement.icon}
              </div>
              <div className="text-sm font-bold text-white">{achievement.title}</div>
              <div className="text-xs text-white/70">{achievement.description}</div>
              {isUnlocked && (
                <div className="mt-2 text-green-400 text-sm font-bold">✅ Получено!</div>
              )}
              {!isUnlocked && (
                <div className="mt-2 text-gray-400 text-sm">🔒 Заблокировано</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Шаг 5: Кнопка Достижений в Меню

В menu screen, добавить после кнопки stats:

```typescript
<button onClick={() => { if(gameState.soundOn) sound.playClick(); setScreen('achievements'); }} className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white py-4 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
  <span className="text-4xl">🏆</span><span className="text-4xl">🎖️</span>
</button>
```

### Шаг 6: Уведомление о Достижении

Добавить в любой экран (лучше в race/finish screen):

```typescript
{/* Achievement notification */}
{newAchievement && (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-2xl max-w-sm w-full" style={{animation:'pop 0.3s ease-out'}}>
    <div className="text-center">
      <div className="text-6xl mb-2">{newAchievement.icon}</div>
      <div className="text-2xl font-bold text-white mb-1">Достижение!</div>
      <div className="text-xl font-bold text-white mb-1">{newAchievement.title}</div>
      <div className="text-white/80">{newAchievement.description}</div>
    </div>
  </div>
)}
```

---

## 📊 Тестирование

После реализации:

1. **Начать новую игру** → должно разблокировать `first_steps` после 10 правильных
2. **Выиграть гонку** → должно разблокировать `first_win`
3. **Выиграть без ошибок** → должно разблокировать `perfectionist`
4. **5 правильных подряд** → должно разблокировать `hot_streak`
5. **Накопить 50 звёзд** → должно разблокировать `star_collector`

---

## 🎯 Приоритет Реализации

1. ✅ **Список достижений** - ГОТОВО
2. ✅ **Расширенная статистика** - ГОТОВО
3. ✅ **Функция проверки** - ГОТОВО
4. ⏳ **Обновить handleAnswer** - В ПРОЦЕССЕ
5. ⏳ **Обновить логику победы** - В ПРОЦЕССЕ
6. ⏳ **Экран достижений** - TODO
7. ⏳ **Уведомление о разблокировке** - TODO

---

## 💡 Дальнейшие Улучшения

После базовой реализации:

1. **Прогресс к достижениям** - показывать "3/10" для незавершенных
2. **Анимация разблокировки** - конфетти, звезды
3. **Звуковые эффекты** - уникальный звук для разных категорий
4. **Фильтры** - показывать только разблокированные/заблокированные
5. **Награды** - дополнительные звезды за достижения
6. **Шеринг** - поделиться достижением

---

Готов продолжить реализацию!
