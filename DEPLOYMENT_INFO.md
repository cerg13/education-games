# ✅ Информация о развёртывании

## 🎯 Статус развёртывания

**Приложение успешно развёрнуто на сервере Beget!**

### 📊 Параметры развёртывания

- **Сервер**: beget (83.222.23.107)
- **Директория**: `~/education-games`
- **API порт**: 8081 (без конфликтов)
- **PID файл**: `~/education-games/server.pid`
- **Логи**: `~/education-games/server.log`

### 🔧 Настройки

```bash
API URL: http://localhost:8081/api
Node.js версия: v22.15.0
Порты заняты на сервере: 3000, 3001, 3002, 8080
Выбран свободный порт: 8081
```

## 📡 API Endpoints

### Профили
- `GET /api/profiles` - Получить все профили
- `POST /api/profiles` - Создать профиль
- `GET /api/profiles/:id` - Получить профиль по ID
- `PUT /api/profiles/:id` - Обновить профиль
- `DELETE /api/profiles/:id` - Удалить профиль

### Текущий профиль
- `GET /api/current-profile` - Получить текущий профиль
- `POST /api/current-profile` - Установить текущий профиль

### Здоровье
- `GET /api/health` - Проверка работоспособности

## 🚀 Команды управления

### Проверка статуса
```bash
ssh beget "curl http://localhost:8081/api/health"
```

### Просмотр логов
```bash
ssh beget "tail -f ~/education-games/server.log"
```

### Перезапуск сервера
```bash
ssh beget << 'EOF'
  cd ~/education-games
  kill $(cat server.pid)
  sleep 2
  nohup node server/server.js > server.log 2>&1 &
  echo $! > server.pid
  echo "Сервер перезапущен!"
EOF
```

### Остановка сервера
```bash
ssh beget "kill \$(cat ~/education-games/server.pid)"
```

### Проверка процесса
```bash
ssh beget "ps aux | grep 'node server/server.js'"
```

## 📁 Структура на сервере

```
~/education-games/
├── index.html              # Главная страница
├── number-racing.html      # Игра "Гонки с числами"
├── reading-game.html       # Игра "Читайка"
├── number-racing.tsx       # Исходники игры 1
├── reading-game.tsx        # Исходники игры 2
├── package.json           # Зависимости
├── node_modules/          # Установленные пакеты
├── server/
│   ├── server.js         # API сервер (порт 8081)
│   └── data/
│       └── profiles.json # База данных профилей
└── src/
    ├── components/       # React компоненты
    ├── games/           # Игры
    └── utils/           # Утилиты (storage)
```

## 💾 Хранение данных

Все данные сохраняются в файле:
```
~/education-games/server/data/profiles.json
```

Формат данных:
```json
{
  "profiles": [
    {
      "id": "1234567890",
      "name": "Имя",
      "character": "fox",
      "stars": 0,
      "totalStars": 0,
      "gameProgress": {},
      "stats": {},
      "createdAt": "2025-12-06T05:17:24.999Z"
    }
  ],
  "currentProfileId": "1234567890"
}
```

## 🔄 Обновление приложения

### Быстрое обновление
```bash
# Локально создайте архив
tar -czf deploy.tar.gz index.html server/ src/

# Загрузите на сервер
scp deploy.tar.gz beget:~/

# Разверните
ssh beget << 'EOF'
  cd ~/education-games
  tar -xzf ~/deploy.tar.gz
  kill $(cat server.pid) 2>/dev/null || true
  sleep 2
  nohup node server/server.js > server.log 2>&1 &
  echo $! > server.pid
  rm ~/deploy.tar.gz
  echo "Обновлено!"
EOF
```

## 🔒 Безопасность

1. API доступен только локально (localhost:8081)
2. Для внешнего доступа настройте Nginx proxy
3. Добавьте HTTPS через Nginx
4. Настройте firewall правила

### Пример Nginx конфига
```nginx
server {
    listen 80;
    server_name your-domain.ru;

    location / {
        root /root/education-games;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📈 Мониторинг

### Проверка здоровья каждые 60 секунд
```bash
while true; do
  STATUS=$(ssh beget "curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/health")
  if [ "$STATUS" != "200" ]; then
    echo "⚠️ Сервер не отвечает!"
  else
    echo "✅ Сервер работает"
  fi
  sleep 60
done
```

## 🛠️ Troubleshooting

### Проблема: Сервер не запускается
```bash
# Проверьте логи
ssh beget "tail -50 ~/education-games/server.log"

# Проверьте, занят ли порт
ssh beget "lsof -i :8081"
```

### Проблема: Порт занят
```bash
# Найдите процесс на порту 8081
ssh beget "lsof -i :8081"

# Убейте процесс
ssh beget "kill -9 <PID>"
```

### Проблема: Нет данных
```bash
# Проверьте файл данных
ssh beget "cat ~/education-games/server/data/profiles.json"

# Создайте заново
ssh beget "echo '{\"profiles\":[],\"currentProfileId\":null}' > ~/education-games/server/data/profiles.json"
```

## 📞 Поддержка

При проблемах проверьте:
1. Логи сервера: `tail -f ~/education-games/server.log`
2. Статус процесса: `ps aux | grep node`
3. API здоровье: `curl http://localhost:8081/api/health`

---

**Дата развёртывания**: 2025-12-06
**Версия**: 1.0.0
**Статус**: ✅ Работает
