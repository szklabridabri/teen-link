const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ścieżki do folderów
const DATA_DIR = path.join(__dirname, 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const POSTS_DIR = path.join(DATA_DIR, 'posts');
const MESSAGES_DIR = path.join(DATA_DIR, 'messages');
const LIKES_DIR = path.join(DATA_DIR, 'likes');
const GROUPS_DIR = path.join(DATA_DIR, 'groups');

// Inicjalizacja folderów
async function initFolders() {
    try {
        await fs.mkdir(USERS_DIR, { recursive: true });
        await fs.mkdir(POSTS_DIR, { recursive: true });
        await fs.mkdir(MESSAGES_DIR, { recursive: true });
        await fs.mkdir(LIKES_DIR, { recursive: true });
        await fs.mkdir(GROUPS_DIR, { recursive: true });
        console.log('✅ Foldery danych utworzone:');
        console.log('   -', USERS_DIR);
        console.log('   -', POSTS_DIR);
        console.log('   -', MESSAGES_DIR);
        console.log('   -', LIKES_DIR);
        console.log('   -', GROUPS_DIR);
    } catch (error) {
        console.error('❌ Błąd tworzenia folderów:', error);
    }
}

// ==================== API UŻYTKOWNIKÓW ====================

// Pobierz wszystkich użytkowników
app.get('/api/users', async (req, res) => {
    try {
        const files = await fs.readdir(USERS_DIR);
        const users = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(USERS_DIR, file), 'utf8');
                users.push(JSON.parse(data));
            }
        }
        res.json(users);
    } catch (error) {
        console.error('Błąd pobierania użytkowników:', error);
        res.json([]);
    }
});

// Pobierz konkretnego użytkownika
app.get('/api/users/:id', async (req, res) => {
    try {
        const filePath = path.join(USERS_DIR, `${req.params.id}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(404).json({ error: 'Nie znaleziono' });
    }
});

// Zapisz użytkownika
app.post('/api/users', async (req, res) => {
    try {
        const user = req.body;
        const filePath = path.join(USERS_DIR, `${user.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(user, null, 2));
        console.log(`✅ Zapisano użytkownika: ${user.name} (${user.id})`);
        res.json({ success: true, id: user.id });
    } catch (error) {
        console.error('❌ Błąd zapisu użytkownika:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== API POSTÓW ====================

// Pobierz wszystkie posty
app.get('/api/posts', async (req, res) => {
    try {
        const files = await fs.readdir(POSTS_DIR);
        const posts = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
                posts.push(JSON.parse(data));
            }
        }
        res.json(posts);
    } catch (error) {
        console.error('Błąd pobierania postów:', error);
        res.json([]);
    }
});

// Zapisz post
app.post('/api/posts', async (req, res) => {
    try {
        const post = req.body;
        const filePath = path.join(POSTS_DIR, `${post.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(post, null, 2));
        console.log(`✅ Zapisano post: ${post.title}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Błąd zapisu posta:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== API LIKE'ÓW ====================

// Pobierz like'i
app.get('/api/likes', async (req, res) => {
    try {
        const filePath = path.join(LIKES_DIR, 'likes.json');
        try {
            const data = await fs.readFile(filePath, 'utf8');
            res.json(JSON.parse(data));
        } catch {
            res.json({ posts: {}, profiles: {} });
        }
    } catch (error) {
        res.json({ posts: {}, profiles: {} });
    }
});

// Zapisz like'i
app.post('/api/likes', async (req, res) => {
    try {
        const likes = req.body;
        const filePath = path.join(LIKES_DIR, 'likes.json');
        await fs.writeFile(filePath, JSON.stringify(likes, null, 2));
        console.log(`✅ Zapisano like'i`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Błąd zapisu likeów:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== API GRUP ====================

// Pobierz wszystkie grupy
app.get('/api/groups', async (req, res) => {
    try {
        const files = await fs.readdir(GROUPS_DIR);
        const groups = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(GROUPS_DIR, file), 'utf8');
                groups.push(JSON.parse(data));
            }
        }
        res.json(groups);
    } catch (error) {
        res.json([]);
    }
});

// Zapisz grupę
app.post('/api/groups', async (req, res) => {
    try {
        const group = req.body;
        const filePath = path.join(GROUPS_DIR, `${group.id}.json`);
        await fs.writeFile(filePath, JSON.stringify(group, null, 2));
        console.log(`✅ Zapisano grupę: ${group.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Błąd zapisu grupy:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== API WIADOMOŚCI ====================

// Pobierz wiadomości między użytkownikami
app.get('/api/messages/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const convId = [user1, user2].sort().join('_');
        const filePath = path.join(MESSAGES_DIR, `${convId}.json`);
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            res.json(JSON.parse(data));
        } catch {
            res.json([]);
        }
    } catch (error) {
        res.json([]);
    }
});

// Zapisz wiadomość
app.post('/api/messages', async (req, res) => {
    try {
        const message = req.body;
        const convId = [message.senderId, message.receiverId].sort().join('_');
        const filePath = path.join(MESSAGES_DIR, `${convId}.json`);
        
        let messages = [];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            messages = JSON.parse(data);
        } catch {
            messages = [];
        }
        
        messages.push(message);
        await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
        console.log(`✅ Zapisano wiadomość`);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Błąd zapisu wiadomości:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SYNCHRONIZACJA ====================

// Pobierz wszystkie dane
app.get('/api/sync', async (req, res) => {
    try {
        // Użytkownicy
        const userFiles = await fs.readdir(USERS_DIR).catch(() => []);
        const users = [];
        for (const file of userFiles) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(USERS_DIR, file), 'utf8');
                users.push(JSON.parse(data));
            }
        }
        
        // Posty
        const postFiles = await fs.readdir(POSTS_DIR).catch(() => []);
        const posts = [];
        for (const file of postFiles) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
                posts.push(JSON.parse(data));
            }
        }
        
        // Like'i
        let likes = { posts: {}, profiles: {} };
        try {
            const likesData = await fs.readFile(path.join(LIKES_DIR, 'likes.json'), 'utf8');
            likes = JSON.parse(likesData);
        } catch {}
        
        // Grupy
        const groupFiles = await fs.readdir(GROUPS_DIR).catch(() => []);
        const groups = [];
        for (const file of groupFiles) {
            if (file.endsWith('.json')) {
                const data = await fs.readFile(path.join(GROUPS_DIR, file), 'utf8');
                groups.push(JSON.parse(data));
            }
        }
        
        res.json({ users, posts, likes, groups });
    } catch (error) {
        console.error('❌ Błąd synchronizacji:', error);
        res.status(500).json({ error: error.message });
    }
});

// Inicjalizacja i start
initFolders().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Serwer działa na http://localhost:${PORT}`);
        console.log(`📁 Dane zapisują się w: ${DATA_DIR}\n`);
    });
});