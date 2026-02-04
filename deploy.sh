#!/bin/bash

# Скрипт для развертывания приложения на сервере beget

echo "🚀 Начинаем деплой на сервер beget..."

# Параметры
SSH_ALIAS="beget"
REMOTE_DIR="~/education-games"
LOCAL_DIR="."

echo "📦 Упаковка файлов..."
tar -czf deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.claude \
  --exclude=deploy.tar.gz \
  --exclude=*.log \
  .

echo "📤 Загрузка на сервер..."
scp deploy.tar.gz $SSH_ALIAS:~/

echo "🔧 Развёртывание на сервере..."
ssh $SSH_ALIAS << 'EOF'
  # Создаём директорию если её нет
  mkdir -p ~/education-games

  # Распаковываем
  tar -xzf ~/deploy.tar.gz -C ~/education-games

  # Переходим в директорию
  cd ~/education-games

  # Устанавливаем зависимости
  npm install --production

  # Создаём директорию для данных
  mkdir -p server/data

  # Проверяем, запущен ли процесс
  if pgrep -f "node server/server.js" > /dev/null; then
    echo "⚠️ Останавливаем старый процесс..."
    pkill -f "node server/server.js"
  fi

  # Запускаем сервер в фоне
  echo "▶️ Запускаем сервер..."
  nohup node server/server.js > server.log 2>&1 &

  # Выводим PID
  echo "✅ Сервер запущен! PID: $!"

  # Чистим временные файлы
  rm ~/deploy.tar.gz

  echo "📊 Проверяем статус..."
  sleep 2
  curl -s http://localhost:3000/api/health || echo "❌ Сервер не отвечает"
EOF

# Удаляем локальный архив
rm deploy.tar.gz

echo "✨ Деплой завершён!"
echo "🌐 Проверьте работу на вашем домене"
echo "📝 Логи сервера: ssh $SSH_ALIAS 'tail -f ~/education-games/server.log'"
