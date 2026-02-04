# 🚀 Деплой на сервер Beget

## Предварительные требования

1. Доступ к серверу Beget по SSH
2. Настроенный SSH alias `beget`
3. Node.js установлен на сервере (версия 14+)

## Настройка SSH alias

Добавьте в файл `~/.ssh/config`:

```ssh
Host beget
    HostName your-server.beget.tech
    User your-username
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Проверьте подключение:
```bash
ssh beget
```

## Автоматический деплой

### Использование скрипта deploy.sh

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите деплой
./deploy.sh
```

### Что делает скрипт:

1. ✅ Упаковывает проект (исключая node_modules)
2. ✅ Загружает на сервер через SCP
3. ✅ Распаковывает файлы
4. ✅ Устанавливает зависимости
5. ✅ Останавливает старый процесс (если есть)
6. ✅ Запускает новый сервер в фоне
7. ✅ Проверяет работоспособность

## Ручной деплой

### Шаг 1: Подключитесь к серверу

```bash
ssh beget
```

### Шаг 2: Создайте директорию

```bash
mkdir -p ~/education-games
cd ~/education-games
```

### Шаг 3: Загрузите файлы

С локальной машины:

```bash
# Вариант 1: через SCP
scp -r . beget:~/education-games

# Вариант 2: через rsync (рекомендуется)
rsync -avz --exclude='node_modules' --exclude='.git' \
  . beget:~/education-games/
```

### Шаг 4: Установите зависимости

На сервере:

```bash
cd ~/education-games
npm install --production
```

### Шаг 5: Запустите сервер

```bash
# Создайте директорию для данных
mkdir -p server/data

# Запустите сервер в фоне
nohup node server/server.js > server.log 2>&1 &

# Сохраните PID процесса
echo $! > server.pid
```

## Управление сервером

### Проверка статуса

```bash
# Проверить, запущен ли процесс
ssh beget "pgrep -f 'node server/server.js'"

# Проверить API
ssh beget "curl http://localhost:3000/api/health"

# Посмотреть логи
ssh beget "tail -f ~/education-games/server.log"
```

### Остановка сервера

```bash
# Через PID файл
ssh beget "kill \$(cat ~/education-games/server.pid)"

# Или найти и убить процесс
ssh beget "pkill -f 'node server/server.js'"
```

### Перезапуск сервера

```bash
ssh beget << 'EOF'
  cd ~/education-games

  # Остановить
  pkill -f 'node server/server.js'

  # Запустить заново
  nohup node server/server.js > server.log 2>&1 &
  echo $! > server.pid

  echo "Сервер перезапущен!"
EOF
```

## Настройка Nginx (если используется)

Добавьте в конфигурацию Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.ru;

    # Статические файлы (фронтенд)
    location / {
        root /home/your-user/education-games;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API прокси на Node.js сервер
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Перезапустите Nginx:

```bash
ssh beget "nginx -s reload"
```

## PM2 (рекомендуется для продакшена)

PM2 - менеджер процессов для Node.js приложений.

### Установка PM2

```bash
ssh beget "npm install -g pm2"
```

### Использование PM2

```bash
ssh beget << 'EOF'
  cd ~/education-games

  # Запустить
  pm2 start server/server.js --name education-games

  # Сохранить список процессов
  pm2 save

  # Автозапуск при перезагрузке
  pm2 startup

  # Просмотр статуса
  pm2 status

  # Просмотр логов
  pm2 logs education-games

  # Перезапуск
  pm2 restart education-games

  # Остановка
  pm2 stop education-games
EOF
```

## Обновление приложения с PM2

```bash
# Скрипт обновления с PM2
ssh beget << 'EOF'
  cd ~/education-games

  # Забекапить данные
  cp -r server/data server/data.backup

  # Получить обновления
  git pull  # если используется Git

  # Установить зависимости
  npm install --production

  # Перезапустить
  pm2 restart education-games

  echo "Обновление завершено!"
EOF
```

## Переменные окружения

Создайте файл `.env` на сервере:

```bash
ssh beget "cat > ~/education-games/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATA_DIR=./server/data
EOF"
```

Обновите `server/server.js` для использования `.env`:

```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, process.env.DATA_DIR || 'data', 'profiles.json');
```

Установите dotenv:

```bash
ssh beget "cd ~/education-games && npm install dotenv"
```

## Резервное копирование данных

### Создание бэкапа

```bash
ssh beget "cd ~/education-games && tar -czf backup-\$(date +%Y%m%d-%H%M%S).tar.gz server/data"
```

### Автоматический бэкап через cron

```bash
ssh beget "crontab -e"
```

Добавьте:

```cron
# Бэкап каждый день в 3:00
0 3 * * * cd ~/education-games && tar -czf ~/backups/education-games-$(date +\%Y\%m\%d).tar.gz server/data && find ~/backups -mtime +30 -delete
```

## Мониторинг

### Простой мониторинг через cURL

Создайте скрипт `monitor.sh`:

```bash
#!/bin/bash
while true; do
  STATUS=$(ssh beget "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health")

  if [ "$STATUS" != "200" ]; then
    echo "⚠️ Сервер не отвечает! Код: $STATUS"
    # Отправить уведомление или перезапустить
  else
    echo "✅ Сервер работает"
  fi

  sleep 60
done
```

## Troubleshooting

### Сервер не запускается

```bash
# Проверьте логи
ssh beget "tail -100 ~/education-games/server.log"

# Проверьте, занят ли порт
ssh beget "lsof -i :3000"

# Проверьте права на файлы
ssh beget "ls -la ~/education-games/server/data"
```

### Ошибки с правами доступа

```bash
ssh beget "chmod -R 755 ~/education-games"
ssh beget "chmod -R 777 ~/education-games/server/data"
```

### Проблемы с зависимостями

```bash
ssh beget "cd ~/education-games && rm -rf node_modules && npm install"
```

## Полезные команды

```bash
# Посмотреть использование ресурсов
ssh beget "top -bn1 | grep node"

# Проверить версию Node.js
ssh beget "node -v"

# Проверить свободное место
ssh beget "df -h"

# Посмотреть активные процессы Node.js
ssh beget "ps aux | grep node"
```

## Контакты

При проблемах с деплоем обращайтесь в поддержку Beget или проверьте документацию Node.js.
