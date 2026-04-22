const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;
const DATA_FILE = path.join(__dirname, 'data', 'profiles.json');

// Middleware
app.use(cors());
app.use(express.json());

// Раздача статических файлов
// Принудительный MIME для .tsx: Express по умолчанию отдаёт application/octet-stream,
// что блокируется iOS Safari при fetch/babel load.
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  },
}));

// Создаём файл данных если его нет
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ profiles: [], currentProfileId: null }));
  }
}

// Читаем данные
async function readData() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Записываем данные
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Получить все профили
app.get('/api/profiles', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.profiles);
  } catch (error) {
    console.error('Error reading profiles:', error);
    res.status(500).json({ error: 'Failed to read profiles' });
  }
});

// Создать профиль
app.post('/api/profiles', async (req, res) => {
  try {
    const { name, character } = req.body;

    if (!name || !character) {
      return res.status(400).json({ error: 'Name and character are required' });
    }

    const data = await readData();

    const newProfile = {
      id: Date.now().toString(),
      name,
      character,
      stars: 0,
      totalStars: 0,
      gameProgress: {},
      stats: {},
      createdAt: new Date().toISOString(),
    };

    data.profiles.push(newProfile);
    await writeData(data);

    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Получить профиль по ID
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const data = await readData();
    const profile = data.profiles.find(p => p.id === req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error reading profile:', error);
    res.status(500).json({ error: 'Failed to read profile' });
  }
});

// Обновить профиль
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.profiles.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    data.profiles[index] = { ...data.profiles[index], ...req.body };
    await writeData(data);

    res.json(data.profiles[index]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Удалить профиль
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.profiles.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    data.profiles.splice(index, 1);

    // Если удаляем текущий профиль, сбрасываем его
    if (data.currentProfileId === req.params.id) {
      data.currentProfileId = null;
    }

    await writeData(data);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// Получить текущий профиль
app.get('/api/current-profile', async (req, res) => {
  try {
    const data = await readData();

    if (!data.currentProfileId) {
      return res.json(null);
    }

    const profile = data.profiles.find(p => p.id === data.currentProfileId);
    res.json(profile || null);
  } catch (error) {
    console.error('Error reading current profile:', error);
    res.status(500).json({ error: 'Failed to read current profile' });
  }
});

// Установить текущий профиль
app.post('/api/current-profile', async (req, res) => {
  try {
    const { profileId } = req.body;
    const data = await readData();

    if (profileId) {
      const profile = data.profiles.find(p => p.id === profileId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
    }

    data.currentProfileId = profileId;
    await writeData(data);

    res.json({ success: true, currentProfileId: profileId });
  } catch (error) {
    console.error('Error setting current profile:', error);
    res.status(500).json({ error: 'Failed to set current profile' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Запуск сервера
async function startServer() {
  await ensureDataFile();

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 API доступен на http://localhost:${PORT}/api`);
    console.log(`💾 Данные сохраняются в: ${DATA_FILE}`);
  });
}

startServer().catch(console.error);
