const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Estructura inicial de la base de datos
const initialDB = {
    users: [],
    files: [],
    apps: [],
    folders: []
};

// Inicializar base de datos
function initDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    }
}

// Leer base de datos
function readDB() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer BD:', error);
        return initialDB;
    }
}

// Escribir base de datos
function writeDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error al escribir BD:', error);
        return false;
    }
}

// Obtener próximo ID
function getNextId(collection) {
    const db = readDB();
    const items = db[collection];
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

// USUARIOS
function createUser(username, password, email, isAdmin = false) {
    const db = readDB();
    const id = getNextId('users');
    const user = {
        id,
        username,
        password,
        email,
        is_admin: isAdmin ? 1 : 0,
        created_at: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    return user;
}

function getUserByUsername(username) {
    const db = readDB();
    return db.users.find(u => u.username === username);
}

function getUserByEmail(email) {
    const db = readDB();
    return db.users.find(u => u.email === email);
}

function getUserById(id) {
    const db = readDB();
    return db.users.find(u => u.id === id);
}

// ARCHIVOS
function createFile(userId, filename, originalName, filepath, size, isPublic = false) {
    const db = readDB();
    const id = getNextId('files');
    const file = {
        id,
        user_id: userId,
        filename,
        original_name: originalName,
        filepath,
        size,
        is_public: isPublic ? 1 : 0,
        uploaded_at: new Date().toISOString()
    };
    db.files.push(file);
    writeDB(db);
    return file;
}

function getFilesByUserId(userId) {
    const db = readDB();
    return db.files.filter(f => f.user_id === userId);
}

function getPublicFiles() {
    const db = readDB();
    const files = db.files.filter(f => f.is_public === 1);
    
    // Agregar información del usuario
    return files.map(file => {
        const user = getUserById(file.user_id);
        return {
            ...file,
            username: user ? user.username : 'Desconocido'
        };
    });
}

function getFileById(id) {
    const db = readDB();
    return db.files.find(f => f.id === id);
}

function updateFilePrivacy(id, isPublic) {
    const db = readDB();
    const fileIndex = db.files.findIndex(f => f.id === id);
    if (fileIndex !== -1) {
        db.files[fileIndex].is_public = isPublic ? 1 : 0;
        writeDB(db);
        return true;
    }
    return false;
}

function deleteFile(id) {
    const db = readDB();
    const fileIndex = db.files.findIndex(f => f.id === id);
    if (fileIndex !== -1) {
        db.files.splice(fileIndex, 1);
        writeDB(db);
        return true;
    }
    return false;
}

function getFileStats(userId) {
    const db = readDB();
    const userFiles = db.files.filter(f => f.user_id === userId);
    
    return {
        file_count: userFiles.length,
        total_size: userFiles.reduce((sum, f) => sum + f.size, 0),
        public_count: userFiles.filter(f => f.is_public === 1).length
    };
}

// APPS
function createApp(name, description, filename, filepath, version, size) {
    const db = readDB();
    const id = getNextId('apps');
    const app = {
        id,
        name,
        description: description || '',
        filename,
        filepath,
        version: version || '1.0.0',
        size,
        downloads: 0,
        uploaded_at: new Date().toISOString()
    };
    db.apps.push(app);
    writeDB(db);
    return app;
}

function getAllApps() {
    const db = readDB();
    return db.apps;
}

function getAppById(id) {
    const db = readDB();
    return db.apps.find(a => a.id === id);
}

function incrementAppDownloads(id) {
    const db = readDB();
    const appIndex = db.apps.findIndex(a => a.id === id);
    if (appIndex !== -1) {
        db.apps[appIndex].downloads++;
        writeDB(db);
        return true;
    }
    return false;
}

function deleteApp(id) {
    const db = readDB();
    const appIndex = db.apps.findIndex(a => a.id === id);
    if (appIndex !== -1) {
        db.apps.splice(appIndex, 1);
        writeDB(db);
        return true;
    }
    return false;
}

// Exportar funciones
module.exports = {
    initDB,
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    createFile,
    getFilesByUserId,
    getPublicFiles,
    getFileById,
    updateFilePrivacy,
    deleteFile,
    getFileStats,
    createApp,
    getAllApps,
    getAppById,
    incrementAppDownloads,
    deleteApp
};

