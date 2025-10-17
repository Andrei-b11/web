const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 3000;

// Inicializar base de datos
db.initDB();

// Crear usuario admin por defecto si no existe
const adminExists = db.getUserByUsername('admin');
if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.createUser('admin', hashedPassword, 'admin@plataforma.com', true);
    console.log('✅ Usuario admin creado - Usuario: admin, Contraseña: admin123');
}

// Crear directorios necesarios
const createDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

createDir('./uploads/users');
createDir('./uploads/apps');
createDir('./public');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: 'tu-secreto-super-seguro-cambialo',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware de autenticación
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.userId || !req.session.isAdmin) {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Configuración de multer para archivos de usuario
const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join('./uploads/users', req.session.userId.toString());
        createDir(userDir);
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const uploadUser = multer({ 
    storage: userStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Configuración de multer para apps
const appStorage = multer.diskStorage({
    destination: './uploads/apps',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const uploadApp = multer({ 
    storage: appStorage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB para apps
});

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = db.getUserByUsername(username) || db.getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = db.createUser(username, hashedPassword, email);

        res.json({ 
            success: true, 
            message: 'Usuario registrado exitosamente',
            userId: user.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        // Buscar usuario
        const user = db.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Crear sesión
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = user.is_admin === 1;

        res.json({ 
            success: true, 
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.is_admin === 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout exitoso' });
});

// Verificar sesión
app.get('/api/auth/check', (req, res) => {
    if (req.session.userId) {
        const user = db.getUserById(req.session.userId);
        if (user) {
            res.json({ 
                authenticated: true, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.is_admin === 1
                }
            });
        } else {
            res.json({ authenticated: false });
        }
    } else {
        res.json({ authenticated: false });
    }
});

// ==================== RUTAS DE ARCHIVOS DE USUARIO ====================

// Subir archivo
app.post('/api/files/upload', requireAuth, uploadUser.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió archivo' });
        }

        const isPublic = req.body.isPublic === 'true';

        const file = db.createFile(
            req.session.userId,
            req.file.filename,
            req.file.originalname,
            req.file.path,
            req.file.size,
            isPublic
        );

        res.json({ 
            success: true, 
            message: 'Archivo subido exitosamente',
            file: {
                id: file.id,
                filename: req.file.originalname,
                size: req.file.size,
                isPublic: file.is_public === 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir archivo' });
    }
});

// Obtener archivos del usuario
app.get('/api/files/my-files', requireAuth, (req, res) => {
    try {
        const files = db.getFilesByUserId(req.session.userId);

        res.json({ success: true, files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener archivos' });
    }
});

// Obtener archivos públicos
app.get('/api/files/public', (req, res) => {
    try {
        const files = db.getPublicFiles();

        res.json({ success: true, files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener archivos públicos' });
    }
});

// Cambiar privacidad de archivo
app.put('/api/files/:id/privacy', requireAuth, (req, res) => {
    try {
        const { isPublic } = req.body;
        const fileId = parseInt(req.params.id);

        // Verificar que el archivo pertenezca al usuario
        const file = db.getFileById(fileId);

        if (!file || file.user_id !== req.session.userId) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        db.updateFilePrivacy(fileId, isPublic);

        res.json({ success: true, message: 'Privacidad actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar privacidad' });
    }
});

// Descargar archivo
app.get('/api/files/download/:id', (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const file = db.getFileById(fileId);

        if (!file) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Verificar permisos
        if (file.is_public === 0 && (!req.session.userId || req.session.userId !== file.user_id)) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        res.download(file.filepath, file.original_name);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al descargar archivo' });
    }
});

// Eliminar archivo
app.delete('/api/files/:id', requireAuth, (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        const file = db.getFileById(fileId);

        if (!file || file.user_id !== req.session.userId) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        // Eliminar archivo físico
        if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
        }

        // Eliminar de BD
        db.deleteFile(fileId);

        res.json({ success: true, message: 'Archivo eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar archivo' });
    }
});

// ==================== RUTAS DE APPS (ADMIN) ====================

// Subir app (solo admin)
app.post('/api/apps/upload', requireAdmin, uploadApp.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió archivo' });
        }

        const { name, description, version } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const app = db.createApp(
            name,
            description,
            req.file.filename,
            req.file.path,
            version,
            req.file.size
        );

        res.json({ 
            success: true, 
            message: 'App subida exitosamente',
            app: {
                id: app.id,
                name: app.name,
                version: app.version
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir app' });
    }
});

// Obtener todas las apps
app.get('/api/apps', (req, res) => {
    try {
        const apps = db.getAllApps();

        res.json({ success: true, apps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener apps' });
    }
});

// Descargar app
app.get('/api/apps/download/:id', (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        const app = db.getAppById(appId);

        if (!app) {
            return res.status(404).json({ error: 'App no encontrada' });
        }

        // Incrementar contador de descargas
        db.incrementAppDownloads(appId);

        res.download(app.filepath, app.filename);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al descargar app' });
    }
});

// Eliminar app (solo admin)
app.delete('/api/apps/:id', requireAdmin, (req, res) => {
    try {
        const appId = parseInt(req.params.id);
        const app = db.getAppById(appId);

        if (!app) {
            return res.status(404).json({ error: 'App no encontrada' });
        }

        // Eliminar archivo físico
        if (fs.existsSync(app.filepath)) {
            fs.unlinkSync(app.filepath);
        }

        // Eliminar de BD
        db.deleteApp(appId);

        res.json({ success: true, message: 'App eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar app' });
    }
});

// ==================== ESTADÍSTICAS ====================

app.get('/api/stats', requireAuth, (req, res) => {
    try {
        const userStats = db.getFileStats(req.session.userId);

        res.json({ success: true, stats: userStats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║  🔥 PLATAFORMA DE ALMACENAMIENTO INICIADA 🔥    ║
╠══════════════════════════════════════════════════╣
║  🌐 URL: http://localhost:${PORT}                  ║
║  👤 Admin: admin                                 ║
║  🔑 Pass: admin123                               ║
╚══════════════════════════════════════════════════╝
    `);
});

// Manejo de cierre
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit();
});

