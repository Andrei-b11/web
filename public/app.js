// Estado global
let currentUser = null;

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Drag and drop para subir archivos
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea?.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    uploadArea?.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            showSelectedFile(files[0].name, 'selectedFileName');
        }
    });

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            showSelectedFile(e.target.files[0].name, 'selectedFileName');
        }
    });

    // App file input
    document.getElementById('appFileInput')?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            showSelectedFile(e.target.files[0].name, 'selectedAppFileName');
        }
    });
}

function showSelectedFile(filename, elementId) {
    document.getElementById(elementId).innerHTML = `
        <i class="fas fa-file"></i> ${filename}
    `;
}

// ==================== AUTENTICACIÓN ====================

async function register(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('¡Registro exitoso! Inicia sesión', 'success');
            showLogin();
        } else {
            showNotification(data.error || 'Error al registrar', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error(error);
    }
}

async function login(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            showDashboard();
            loadUserData();
        } else {
            showNotification(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error(error);
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        document.getElementById('dashboardScreen').classList.remove('active');
        document.getElementById('authScreen').classList.add('active');
        showNotification('Sesión cerrada', 'success');
    } catch (error) {
        console.error(error);
    }
}

async function checkSession() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (data.authenticated) {
            currentUser = data.user;
            showDashboard();
            loadUserData();
        }
    } catch (error) {
        console.error(error);
    }
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showDashboard() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    document.getElementById('navUsername').textContent = currentUser.username;
    
    // Mostrar menú admin si es admin
    if (currentUser.isAdmin) {
        document.getElementById('adminMenuItem').style.display = 'flex';
    }
}

// ==================== NAVEGACIÓN ====================

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Desactivar todos los menú items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const sectionMap = {
        'myFiles': 'myFilesSection',
        'publicFiles': 'publicFilesSection',
        'apps': 'appsSection',
        'admin': 'adminSection'
    };

    document.getElementById(sectionMap[sectionName]).classList.add('active');

    // Activar el menú item correspondiente
    event.target.closest('.menu-item').classList.add('active');

    // Cargar datos de la sección
    if (sectionName === 'myFiles') {
        loadMyFiles();
        loadStats();
    } else if (sectionName === 'publicFiles') {
        loadPublicFiles();
    } else if (sectionName === 'apps') {
        loadApps();
    } else if (sectionName === 'admin') {
        loadAdminApps();
    }
}

function loadUserData() {
    loadMyFiles();
    loadStats();
    loadApps();
}

// ==================== ESTADÍSTICAS ====================

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalFiles').textContent = data.stats.file_count;
            document.getElementById('totalSize').textContent = formatFileSize(data.stats.total_size);
            document.getElementById('publicFiles').textContent = data.stats.public_count;
        }
    } catch (error) {
        console.error(error);
    }
}

// ==================== ARCHIVOS ====================

async function loadMyFiles() {
    const container = document.getElementById('myFilesList');
    container.innerHTML = '<div class="loading">Cargando archivos...</div>';

    try {
        const response = await fetch('/api/files/my-files');
        const data = await response.json();

        if (data.success) {
            if (data.files.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open"></i>
                        <h3>No tienes archivos</h3>
                        <p>Sube tu primer archivo para comenzar</p>
                    </div>
                `;
            } else {
                container.innerHTML = data.files.map(file => `
                    <div class="file-card">
                        <div class="file-info">
                            <div class="file-icon">${getFileIcon(file.original_name)}</div>
                            <div class="file-details">
                                <h4>${file.original_name}</h4>
                                <div class="file-meta">
                                    ${formatFileSize(file.size)} • 
                                    ${new Date(file.uploaded_at).toLocaleDateString()} • 
                                    <span class="badge ${file.is_public ? 'badge-public' : 'badge-private'}">
                                        ${file.is_public ? 'Público' : 'Privado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="icon-btn ${file.is_public ? 'public' : 'private'}" 
                                    onclick="togglePrivacy(${file.id}, ${file.is_public})"
                                    title="${file.is_public ? 'Hacer privado' : 'Hacer público'}">
                                <i class="fas fa-${file.is_public ? 'eye' : 'eye-slash'}"></i>
                            </button>
                            <button class="icon-btn" onclick="downloadFile(${file.id})" title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="icon-btn" onclick="deleteFile(${file.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error al cargar archivos</div>';
        console.error(error);
    }
}

async function loadPublicFiles() {
    const container = document.getElementById('publicFilesList');
    container.innerHTML = '<div class="loading">Cargando archivos públicos...</div>';

    try {
        const response = await fetch('/api/files/public');
        const data = await response.json();

        if (data.success) {
            if (data.files.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-globe"></i>
                        <h3>No hay archivos públicos</h3>
                        <p>Aún no hay archivos compartidos públicamente</p>
                    </div>
                `;
            } else {
                container.innerHTML = data.files.map(file => `
                    <div class="file-card">
                        <div class="file-info">
                            <div class="file-icon">${getFileIcon(file.original_name)}</div>
                            <div class="file-details">
                                <h4>${file.original_name}</h4>
                                <div class="file-meta">
                                    ${formatFileSize(file.size)} • 
                                    Por: ${file.username} • 
                                    ${new Date(file.uploaded_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="icon-btn" onclick="downloadFile(${file.id})" title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error al cargar archivos</div>';
        console.error(error);
    }
}

async function uploadFile(e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const isPublic = document.getElementById('isPublicCheck').checked;

    if (!fileInput.files[0]) {
        showNotification('Selecciona un archivo', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('isPublic', isPublic);

    try {
        showNotification('Subiendo archivo...', 'info');
        
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Archivo subido exitosamente', 'success');
            closeModal('uploadModal');
            loadMyFiles();
            loadStats();
            fileInput.value = '';
            document.getElementById('selectedFileName').innerHTML = '';
            document.getElementById('isPublicCheck').checked = false;
        } else {
            showNotification(data.error || 'Error al subir archivo', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error(error);
    }
}

async function togglePrivacy(fileId, currentPublic) {
    try {
        const response = await fetch(`/api/files/${fileId}/privacy`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic: !currentPublic })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Privacidad actualizada', 'success');
            loadMyFiles();
            loadStats();
        }
    } catch (error) {
        showNotification('Error al actualizar', 'error');
        console.error(error);
    }
}

function downloadFile(fileId) {
    window.location.href = `/api/files/download/${fileId}`;
}

async function deleteFile(fileId) {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return;

    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Archivo eliminado', 'success');
            loadMyFiles();
            loadStats();
        }
    } catch (error) {
        showNotification('Error al eliminar', 'error');
        console.error(error);
    }
}

// ==================== APPS ====================

async function loadApps() {
    const container = document.getElementById('appsList');
    container.innerHTML = '<div class="loading">Cargando apps...</div>';

    try {
        const response = await fetch('/api/apps');
        const data = await response.json();

        if (data.success) {
            if (data.apps.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>No hay apps disponibles</h3>
                        <p>Las apps aparecerán aquí cuando el admin las suba</p>
                    </div>
                `;
            } else {
                container.innerHTML = data.apps.map(app => `
                    <div class="app-card">
                        <div class="app-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h3>${app.name}</h3>
                        <div class="app-version">v${app.version}</div>
                        <div class="app-description">${app.description || 'Sin descripción'}</div>
                        <div class="app-stats">
                            <div class="app-stat">
                                <div class="app-stat-number">${formatFileSize(app.size)}</div>
                                <div class="app-stat-label">Tamaño</div>
                            </div>
                            <div class="app-stat">
                                <div class="app-stat-number">${app.downloads}</div>
                                <div class="app-stat-label">Descargas</div>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="downloadApp(${app.id})">
                            <i class="fas fa-download"></i> Descargar
                        </button>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error al cargar apps</div>';
        console.error(error);
    }
}

function downloadApp(appId) {
    window.location.href = `/api/apps/download/${appId}`;
    showNotification('Descargando app...', 'success');
}

// ==================== ADMIN ====================

async function loadAdminApps() {
    const container = document.getElementById('adminAppsList');
    container.innerHTML = '<div class="loading">Cargando apps...</div>';

    try {
        const response = await fetch('/api/apps');
        const data = await response.json();

        if (data.success) {
            if (data.apps.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <h3>No hay apps subidas</h3>
                        <p>Haz clic en "Subir App" para comenzar</p>
                    </div>
                `;
            } else {
                container.innerHTML = data.apps.map(app => `
                    <div class="file-card">
                        <div class="file-info">
                            <div class="file-icon">📱</div>
                            <div class="file-details">
                                <h4>${app.name} v${app.version}</h4>
                                <div class="file-meta">
                                    ${formatFileSize(app.size)} • 
                                    ${app.downloads} descargas • 
                                    ${new Date(app.uploaded_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="icon-btn" onclick="deleteApp(${app.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error al cargar apps</div>';
        console.error(error);
    }
}

async function uploadApp(e) {
    e.preventDefault();

    const name = document.getElementById('appName').value;
    const version = document.getElementById('appVersion').value;
    const description = document.getElementById('appDescription').value;
    const fileInput = document.getElementById('appFileInput');

    if (!fileInput.files[0]) {
        showNotification('Selecciona un archivo', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('name', name);
    formData.append('version', version);
    formData.append('description', description);

    try {
        showNotification('Subiendo app...', 'info');
        
        const response = await fetch('/api/apps/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showNotification('App subida exitosamente', 'success');
            closeModal('uploadAppModal');
            loadApps();
            loadAdminApps();
            document.getElementById('appName').value = '';
            document.getElementById('appVersion').value = '';
            document.getElementById('appDescription').value = '';
            fileInput.value = '';
            document.getElementById('selectedAppFileName').innerHTML = '';
        } else {
            showNotification(data.error || 'Error al subir app', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
        console.error(error);
    }
}

async function deleteApp(appId) {
    if (!confirm('¿Estás seguro de eliminar esta app?')) return;

    try {
        const response = await fetch(`/api/apps/${appId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showNotification('App eliminada', 'success');
            loadApps();
            loadAdminApps();
        }
    } catch (error) {
        showNotification('Error al eliminar', 'error');
        console.error(error);
    }
}

// ==================== MODALES ====================

function showUploadModal() {
    document.getElementById('uploadModal').classList.add('active');
}

function showUploadAppModal() {
    document.getElementById('uploadAppModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Cerrar modal al hacer clic fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// ==================== UTILIDADES ====================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': '📄',
        'doc': '📝', 'docx': '📝',
        'xls': '📊', 'xlsx': '📊',
        'ppt': '📽️', 'pptx': '📽️',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
        'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
        'mp3': '🎵', 'wav': '🎵',
        'zip': '📦', 'rar': '📦', '7z': '📦',
        'txt': '📃',
        'js': '📜', 'html': '📜', 'css': '📜', 'json': '📜', 'py': '📜',
        'exe': '⚙️', 'app': '⚙️',
    };
    return icons[ext] || '📄';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#ff6600'};
        color: ${type === 'success' ? '#0a0a0a' : '#ffffff'};
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('🔥 Plataforma de Almacenamiento cargada!');

