# 🔥 Plataforma de Almacenamiento Completa

Una plataforma web completa con sistema de usuarios, almacenamiento privado/público y distribución de apps.

## ✨ Características Principales

### 👥 Sistema de Usuarios
- ✅ Registro de nuevos usuarios
- ✅ Login con sesiones persistentes
- ✅ Sistema de roles (Usuario / Administrador)
- ✅ Contraseñas encriptadas con bcrypt

### 📁 Almacenamiento Personal
- ✅ Cada usuario tiene su propio espacio
- ✅ Subir archivos (hasta 100MB)
- ✅ Archivos privados o públicos
- ✅ Descargar archivos propios
- ✅ Eliminar archivos
- ✅ Cambiar privacidad (privado/público)
- ✅ Estadísticas personales

### 🌍 Archivos Públicos
- ✅ Ver archivos públicos de todos los usuarios
- ✅ Descargar archivos públicos
- ✅ Ver quién subió cada archivo

### 📱 Sistema de Apps (Admin)
- ✅ El admin puede subir apps para que todos descarguen
- ✅ Apps con nombre, versión y descripción
- ✅ Contador de descargas
- ✅ Archivos grandes (hasta 500MB)
- ✅ Panel de administración

### 🎨 Interfaz Moderna
- ✅ Tema negro y naranja
- ✅ Responsive (móvil y desktop)
- ✅ Animaciones suaves
- ✅ Notificaciones visuales
- ✅ Drag & drop para subir archivos

## 🚀 Instalación y Uso

### Paso 1: Instalar Dependencias

```bash
npm install
```

### Paso 2: Iniciar el Servidor

```bash
npm start
```

### Paso 3: Abrir en el Navegador

```
http://localhost:3000
```

## 👤 Credenciales por Defecto

**Usuario Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña del admin después del primer login.

## 📖 Cómo Usar la Plataforma

### Para Usuarios Normales:

1. **Registrarse**
   - Haz clic en "Regístrate"
   - Completa el formulario
   - Inicia sesión

2. **Subir Archivos**
   - Ve a "Mis Archivos"
   - Haz clic en "Subir Archivo"
   - Arrastra tu archivo o selecciónalo
   - Marca "Hacer público" si quieres compartirlo
   - Haz clic en "Subir"

3. **Gestionar Archivos**
   - 👁️ **Icono ojo**: Cambiar entre privado/público
   - ⬇️ **Icono descarga**: Descargar el archivo
   - 🗑️ **Icono basura**: Eliminar el archivo

4. **Ver Archivos Públicos**
   - Ve a "Archivos Públicos"
   - Descarga archivos de otros usuarios

5. **Descargar Apps**
   - Ve a "Apps Disponibles"
   - Descarga las apps que el admin haya subido

### Para Administradores:

1. **Subir Apps**
   - Ve a "Panel Admin"
   - Haz clic en "Subir App"
   - Completa el formulario
   - Sube el archivo de la app
   - Los usuarios podrán descargarla

2. **Gestionar Apps**
   - Ver lista de apps subidas
   - Ver estadísticas de descargas
   - Eliminar apps

## 🗄️ Base de Datos

La plataforma usa **SQLite** (archivo `database.db`) que se crea automáticamente.

### Tablas:
- **users**: Usuarios registrados
- **files**: Archivos de usuarios
- **apps**: Apps para descargar
- **folders**: Carpetas de usuarios

## 📁 Estructura de Archivos

```
├── server.js              # Servidor Express
├── package.json           # Dependencias
├── database.db           # Base de datos SQLite (se crea automáticamente)
├── public/
│   ├── index.html        # Interfaz principal
│   ├── styles.css        # Estilos
│   └── app.js            # Lógica del frontend
├── uploads/
│   ├── users/            # Archivos de usuarios
│   └── apps/             # Apps para descargar
└── README.md             # Este archivo
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Sesiones con express-session
- ✅ Verificación de permisos en cada endpoint
- ✅ Archivos privados solo accesibles por el dueño
- ✅ Panel admin solo para administradores

## 🌐 Para Compartir con Todo el Mundo

### Opción 1: Hosting Gratuito con Base de Datos

**Heroku** (Recomendado para esta app):
1. Crea cuenta en [heroku.com](https://heroku.com)
2. Instala Heroku CLI
3. Ejecuta:
   ```bash
   git init
   heroku create nombre-de-tu-app
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

**Render** (Más fácil):
1. Ve a [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Deploy automático
4. URL: `https://tu-app.onrender.com`

### Opción 2: VPS (Control Total)

**DigitalOcean, AWS, Google Cloud**:
1. Crea un servidor
2. Instala Node.js
3. Sube tu código
4. Ejecuta `npm install && npm start`
5. Configura un dominio

### Opción 3: Túnel Local (Para Pruebas)

**ngrok** (Rápido para mostrar):
```bash
# Instala ngrok
npm install -g ngrok

# Ejecuta el servidor
npm start

# En otra terminal
ngrok http 3000
```
Te dará una URL pública temporal.

## 🛠️ Configuración Avanzada

### Cambiar Puerto

Edita `server.js` línea 12:
```javascript
const PORT = 3000; // Cambia a tu puerto deseado
```

### Cambiar Secret de Sesión

Edita `server.js` línea 94:
```javascript
secret: 'tu-secreto-super-seguro-cambialo',
```

### Limites de Archivos

Edita `server.js`:
- Línea 124: Archivos de usuario (100MB por defecto)
- Línea 134: Apps (500MB por defecto)

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/check` - Verificar sesión

### Archivos de Usuario
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/my-files` - Obtener mis archivos
- `GET /api/files/public` - Obtener archivos públicos
- `PUT /api/files/:id/privacy` - Cambiar privacidad
- `GET /api/files/download/:id` - Descargar archivo
- `DELETE /api/files/:id` - Eliminar archivo

### Apps
- `POST /api/apps/upload` - Subir app (solo admin)
- `GET /api/apps` - Obtener todas las apps
- `GET /api/apps/download/:id` - Descargar app
- `DELETE /api/apps/:id` - Eliminar app (solo admin)

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del usuario

## 🐛 Solución de Problemas

**Error: Cannot find module**
```bash
npm install
```

**Error: Puerto en uso**
- Cambia el puerto en `server.js`

**No puedo subir archivos**
- Verifica permisos de la carpeta `uploads/`

**La base de datos no se crea**
- Verifica que tengas permisos de escritura en la carpeta

## 🎯 Próximas Mejoras

Ideas para expandir:
- [ ] Carpetas anidadas para organizar archivos
- [ ] Búsqueda de archivos
- [ ] Vista previa de imágenes
- [ ] Compartir archivos con link temporal
- [ ] Límite de almacenamiento por usuario
- [ ] Compresión automática de archivos
- [ ] Papelera de reciclaje
- [ ] Múltiples archivos a la vez
- [ ] Integración con Google Drive / Dropbox

## 📄 Licencia

Uso libre - Puedes modificar y usar como quieras.

---

## 🎉 ¡Tu Plataforma Está Lista!

1. Ejecuta `npm install`
2. Ejecuta `npm start`
3. Abre http://localhost:3000
4. Login como admin o crea tu cuenta
5. ¡Empieza a subir archivos!

**¿Dudas? Revisa el código - está comentado y organizado.**

---

**Creado con ❤️ y Node.js**
