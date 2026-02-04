# 🎮 Маркетплейс Обучающих Игр - Информация о доступе

## ✅ Приложение развёрнуто и работает!

### 🌐 Адрес приложения

**Главная страница (Маркетплейс)**:
```
http://83.222.23.107:8081/
```

**Игры**:
- Гонки с Числами: http://83.222.23.107:8081/number-racing.html
- Читайка: http://83.222.23.107:8081/reading-game.html

**API**:
```
http://83.222.23.107:8081/api
```

### 📊 API Endpoints

**Health Check**:
```bash
curl http://83.222.23.107:8081/api/health
# Response: {"status":"ok","timestamp":"2025-12-06T05:25:09.544Z"}
```

**Профили**:
- `GET http://83.222.23.107:8081/api/profiles` - Список всех профилей
- `POST http://83.222.23.107:8081/api/profiles` - Создать профиль
- `GET http://83.222.23.107:8081/api/profiles/:id` - Получить профиль
- `PUT http://83.222.23.107:8081/api/profiles/:id` - Обновить профиль
- `DELETE http://83.222.23.107:8081/api/profiles/:id` - Удалить профиль

**Текущий профиль**:
- `GET http://83.222.23.107:8081/api/current-profile` - Получить текущий профиль
- `POST http://83.222.23.107:8081/api/current-profile` - Установить текущий профиль

## 🔧 Технические детали

### Сервер
- **IP**: 83.222.23.107
- **Порт**: 8081
- **Node.js**: v22.15.0
- **Директория**: ~/education-games
- **PID файл**: ~/education-games/server.pid
- **Логи**: ~/education-games/server.log

### Безопасность
- ✅ Порт 8081 открыт в UFW
- ✅ CORS включён для всех доменов
- ✅ Данные сохраняются на сервере в JSON

### Хранение данных
**Файл**: `~/education-games/server/data/profiles.json`

**Структура**:
```json
{
  "profiles": [
    {
      "id": "1733462825944",
      "name": "Имя игрока",
      "character": "fox",
      "stars": 0,
      "totalStars": 0,
      "gameProgress": {
        "numberRacing": {},
        "readingGame": {}
      },
      "stats": {},
      "createdAt": "2025-12-06T05:20:25.944Z"
    }
  ],
  "currentProfileId": "1733462825944"
}
```

## 🚀 Управление сервером

### Проверка статуса
```bash
# Проверка здоровья API
curl http://83.222.23.107:8081/api/health

# Проверка процесса
ssh beget "ps aux | grep 'node server/server.js'"

# Проверка порта
ssh beget "lsof -i :8081"
```

### Просмотр логов
```bash
# Последние 50 строк
ssh beget "tail -50 ~/education-games/server.log"

# Отслеживание в реальном времени
ssh beget "tail -f ~/education-games/server.log"
```

### Перезапуск
```bash
ssh beget << 'EOF'
  cd ~/education-games
  kill $(cat server.pid) 2>/dev/null || pkill -f "node server/server.js"
  sleep 2
  nohup node server/server.js > server.log 2>&1 &
  echo $! > server.pid
  echo "Сервер перезапущен!"
EOF
```

### Остановка
```bash
ssh beget "kill \$(cat ~/education-games/server.pid)"
```

### Обновление
```bash
# Создайте архив локально
tar -czf deploy.tar.gz index.html number-racing.html reading-game.html number-racing.tsx reading-game.tsx server/ src/

# Загрузите на сервер
scp deploy.tar.gz beget:~/

# Разверните
ssh beget << 'EOF'
  cd ~/education-games
  tar -xzf ~/deploy.tar.gz
  kill $(cat server.pid) 2>/dev/null
  sleep 2
  nohup node server/server.js > server.log 2>&1 &
  echo $! > server.pid
  rm ~/deploy.tar.gz
EOF
```

## 📱 Использование

1. **Откройте в браузере**: http://83.222.23.107:8081/
2. **Создайте профиль игрока** - выберите персонажа и введите имя
3. **Выберите игру** - "Гонки с Числами" или "Читайка"
4. **Играйте!** - весь прогресс сохраняется автоматически

## 🔐 Доступ по SSH

```bash
ssh beget
cd ~/education-games
```

## 📊 Мониторинг

### Простой скрипт мониторинга
```bash
#!/bin/bash
while true; do
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://83.222.23.107:8081/api/health)

  if [ "$STATUS" != "200" ]; then
    echo "⚠️ $(date): Сервер не отвечает! Код: $STATUS"
    # Можно добавить уведомление
  else
    echo "✅ $(date): Сервер работает"
  fi

  sleep 60
done
```

## 🆙 Настройка доменного имени (опционально)

Если у вас есть домен, настройте DNS:

### A-запись
```
games.yourdomain.com → 83.222.23.107
```

### Nginx конфиг
```nginx
server {
    listen 80;
    server_name games.yourdomain.com;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Затем добавьте SSL через Let's Encrypt:
```bash
sudo certbot --nginx -d games.yourdomain.com
```

## 💡 Рекомендации

1. **Бэкап данных**:
   ```bash
   ssh beget "tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/education-games/server/data"
   ```

2. **Автозапуск с PM2**:
   ```bash
   npm install -g pm2
   pm2 start ~/education-games/server/server.js --name education-games
   pm2 save
   pm2 startup
   ```

3. **Логротация**:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   ```

## 🆘 Troubleshooting

### Приложение не открывается
```bash
# Проверьте статус
curl http://83.222.23.107:8081/api/health

# Проверьте логи
ssh beget "tail -100 ~/education-games/server.log"

# Проверьте файрвол
ssh beget "sudo ufw status | grep 8081"
```

### API не отвечает
```bash
# Проверьте процесс
ssh beget "pgrep -f 'node server/server.js' || echo 'Процесс не запущен'"

# Перезапустите
ssh beget "cd ~/education-games && kill \$(cat server.pid) 2>/dev/null; nohup node server/server.js > server.log 2>&1 & echo \$! > server.pid"
```

### Нет данных
```bash
# Проверьте файл данных
ssh beget "cat ~/education-games/server/data/profiles.json"

# Создайте заново если нужно
ssh beget "mkdir -p ~/education-games/server/data && echo '{\"profiles\":[],\"currentProfileId\":null}' > ~/education-games/server/data/profiles.json"
```

---

**Последнее обновление**: 2025-12-06 05:25:00 UTC
**Статус**: ✅ Работает
**Версия**: 1.0.0
