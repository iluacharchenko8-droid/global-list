// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentUser = null;
let users = {};
let messages = [];
let chatCooldown = false;
let onlineUsers = 0;
let typingTimeout = null;
let activeSection = 'profile';

// Конфигурация
const CONFIG = {
    creatorID: '888-888-888',
    creatorName: 'Geroy777',
    creatorPassword: 'admin200803', // Пароль создателя
    messageCooldown: 3000,
    maxMessages: 200
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    loadData();
    setupEventListeners();
    checkSession();
    updateOnlineCount();
    setInterval(updateOnlineCount, 30000);
    
    // По умолчанию скрываем поле подтверждения пароля
    document.getElementById('confirmField').style.display = 'none';
    
    // Показываем поле подтверждения только когда вводят новый пароль
    document.getElementById('loginPassword').addEventListener('input', function() {
        const confirmField = document.getElementById('confirmField');
        if (this.value.length > 0) {
            confirmField.style.display = 'block';
        } else {
            confirmField.style.display = 'none';
        }
    });
});

// Инициализация частиц
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 800 } },
                color: { value: '#9c54ff' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out'
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' }
                }
            }
        });
    }
}

// Загрузка данных
function loadData() {
    try {
        // Загружаем пользователей
        const savedUsers = localStorage.getItem('globalListUsers');
        if (savedUsers) {
            users = JSON.parse(savedUsers);
        } else {
            // Создаем создателя с правильным паролем
            users = {};
        }
        
        // ВСЕГДА добавляем создателя при загрузке (на случай если его нет)
        users['Geroy777'] = {
            password: 'admin200803', // ВАЖНО: пароль именно такой
            username: 'Geroy777',
            id: '888-888-888',
            regDate: new Date().toLocaleDateString('ru-RU'),
            titles: ['👑 Создатель Global List', '⚡ Верховный Админ', '✨ Основатель', '🌟 Легенда'],
            avatar: '1',
            isAdmin: true,
            adminColor: 'gold',
            role: 'creator'
        };
        
        // Загружаем сообщения
        const savedMessages = localStorage.getItem('globalListMessages');
        if (savedMessages) {
            messages = JSON.parse(savedMessages);
        }
        
        saveUsers();
        console.log('Загружены пользователи:', users); // Для отладки
    } catch (e) {
        console.error('Ошибка загрузки данных:', e);
    }
}

// Сохранение пользователей
function saveUsers() {
    try {
        localStorage.setItem('globalListUsers', JSON.stringify(users));
    } catch (e) {
        console.error('Ошибка сохранения пользователей:', e);
    }
}

// Сохранение сообщений
function saveMessages() {
    try {
        localStorage.setItem('globalListMessages', JSON.stringify(messages));
    } catch (e) {
        console.error('Ошибка сохранения сообщений:', e);
    }
}

// Проверка сессии
function checkSession() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            // Проверяем, что пользователь существует в базе
            if (users[currentUser.username] && 
                users[currentUser.username].password === currentUser.password) {
                // Обновляем данные пользователя
                currentUser = {...users[currentUser.username], username: currentUser.username};
                showMainScreen();
                updateUI();
            } else {
                localStorage.removeItem('currentUser');
            }
        }
    } catch (e) {
        console.error('Ошибка проверки сессии:', e);
    }
}

// Настройка обработчиков
function setupEventListeners() {
    // Авторизация
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    
    // Показать оферту
    document.getElementById('showOfferBtn').addEventListener('click', showOfferModal);
    
    // Мобильное меню
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    document.getElementById('sidebarClose').addEventListener('click', closeMobileMenu);
    
    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            navigateToSection(section);
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Клик по профилю в меню
    document.getElementById('sidebarProfile').addEventListener('click', () => {
        navigateToSection('profile');
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
    
    // Выход
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Поиск пользователей
    document.getElementById('userSearch')?.addEventListener('input', filterUsers);
    
    // Выбор аватарки
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.addEventListener('click', function() {
            const avatar = this.dataset.avatar;
            selectAvatar(avatar);
        });
    });
    
    // Чат
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Закрытие модалок по клику на оверлей
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeAllModals);
    });
}

// ==================== АВТОРИЗАЦИЯ ====================
function handleAuth(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const confirmPass = document.getElementById('confirmPassword').value.trim();
    const offerChecked = document.getElementById('offerAgree').checked;
    
    console.log('Попытка входа:', username, password); // Для отладки
    
    // Валидация
    if (!username || !password) {
        showAuthMessage('Заполните все поля', 'error');
        return;
    }
    
    if (!offerChecked) {
        showAuthMessage('Необходимо согласие с офертой', 'error');
        return;
    }
    
    // Проверяем существование пользователя
    if (users[username]) {
        // Вход существующего пользователя
        console.log('Найден пользователь:', users[username]); // Для отладки
        console.log('Сравнение паролей:', password, '===', users[username].password);
        
        if (users[username].password === password) {
            currentUser = {...users[username], username: username};
            loginSuccess();
        } else {
            showAuthMessage('Неверный пароль', 'error');
        }
    } else {
        // Регистрация нового
        if (password !== confirmPass) {
            showAuthMessage('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        const newUser = {
            password: password, // Сохраняем пароль как есть
            username: username,
            id: generateUniqueID(),
            regDate: new Date().toLocaleDateString('ru-RU'),
            titles: ['🆕 Новобранец'],
            avatar: Math.floor(Math.random() * 10 + 1).toString(),
            isAdmin: false,
            role: 'user'
        };
        
        users[username] = newUser;
        saveUsers();
        currentUser = {...newUser, username: username};
        loginSuccess();
    }
}

// Генерация уникального ID
function generateUniqueID() {
    let id;
    do {
        const part1 = Math.floor(Math.random() * 900 + 100);
        const part2 = Math.floor(Math.random() * 900 + 100);
        const part3 = Math.floor(Math.random() * 900 + 100);
        id = `${part1}-${part2}-${part3}`;
    } while (Object.values(users).some(u => u.id === id));
    return id;
}

// Успешный вход
function loginSuccess() {
    showAuthMessage(`✅ Добро пожаловать, ${currentUser.username}!`, 'success');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    setTimeout(() => {
        showMainScreen();
        updateUI();
    }, 1000);
}

// Показать сообщение в форме авторизации
function showAuthMessage(text, type) {
    const msgDiv = document.getElementById('authMessage');
    msgDiv.textContent = text;
    msgDiv.style.background = type === 'error' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)';
    msgDiv.style.border = type === 'error' ? '1px solid #f44336' : '1px solid #4caf50';
    
    if (type === 'success') {
        setTimeout(() => {
            msgDiv.textContent = '';
        }, 3000);
    }
}

// Показать главный экран
function showMainScreen() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
}

// ==================== ИНТЕРФЕЙС ====================
function updateUI() {
    if (!currentUser) return;
    
    // Обновляем информацию в меню
    document.getElementById('menuUsername').textContent = currentUser.username;
    document.getElementById('menuUserId').textContent = `ID: ${currentUser.id}`;
    
    // Обновляем аватарку в меню
    updateAvatar('menuAvatar', currentUser.avatar);
    updateAvatar('profileAvatar', currentUser.avatar);
    
    // Обновляем профиль
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileId').textContent = currentUser.id;
    document.getElementById('profileRegDate').textContent = currentUser.regDate;
    document.getElementById('profileTitlesCount').textContent = currentUser.titles.length;
    document.getElementById('profileRank').textContent = getRankName(currentUser);
    
    // Обновляем титулы
    updateTitlesList();
    
    // Показываем/скрываем админ-панель
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = (currentUser.isAdmin || currentUser.role === 'creator') ? 'block' : 'none';
    }
    
    // Обновляем выделение аватарки
    document.querySelectorAll('.avatar-item').forEach(item => {
        if (item.dataset.avatar === currentUser.avatar) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Обновляем счетчики
    updateCounters();
}

function updateAvatar(elementId, avatarId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const icon = element.querySelector('i');
    const avatars = {
        '1': 'fa-user-astronaut', '2': 'fa-rocket', '3': 'fa-star',
        '4': 'fa-meteor', '5': 'fa-moon', '6': 'fa-sun',
        '7': 'fa-galaxy', '8': 'fa-saturn', '9': 'fa-alien',
        '10': 'fa-robot'
    };
    
    icon.className = `fas ${avatars[avatarId] || 'fa-user-astronaut'}`;
}

function getRankName(user) {
    if (user.role === 'creator') return '👑 Создатель';
    if (user.isAdmin) return '⚡ Администратор';
    return '🌟 Пользователь';
}

function updateTitlesList() {
    const container = document.getElementById('profileTitlesList');
    if (!container) return;
    
    container.innerHTML = '';
    currentUser.titles.forEach(title => {
        const titleClass = getTitleClass(title);
        container.innerHTML += `<div class="title-item ${titleClass}">${title}</div>`;
    });
}

function getTitleClass(title) {
    if (title.includes('Создатель') || title.includes('Основатель')) return 'creator';
    if (title.includes('Админ')) return 'admin';
    if (title.includes('Новобранец')) return 'default';
    return 'special';
}

// ==================== НАВИГАЦИЯ ====================
function navigateToSection(section) {
    activeSection = section;
    
    // Обновляем активный пункт меню
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.section === section) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Показываем секцию
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    const sectionMap = {
        'profile': 'profileSection',
        'chat': 'chatSection',
        'users': 'usersSection',
        'admins': 'adminsSection',
        'settings': 'settingsSection'
    };
    
    const targetSection = document.getElementById(sectionMap[section]);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Обновляем контент в зависимости от секции
    if (section === 'users') {
        updateUsersList();
    } else if (section === 'admins') {
        updateAdminsList();
    } else if (section === 'chat') {
        loadChatMessages();
    }
}

// ==================== СЧЕТЧИКИ ====================
function updateCounters() {
    const totalUsers = Object.keys(users).length;
    const adminsCount = Object.values(users).filter(u => u.isAdmin || u.role === 'creator').length;
    
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('adminsCount').textContent = adminsCount;
}

function updateOnlineCount() {
    // Имитация онлайна
    onlineUsers = Math.floor(Math.random() * (Object.keys(users).length * 0.7)) + 1;
    document.getElementById('onlineCount').textContent = onlineUsers;
    document.getElementById('chatOnlineCount').textContent = onlineUsers;
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================
function updateUsersList() {
    const grid = document.getElementById('usersGrid');
    if (!grid) return;
    
    const searchQuery = document.getElementById('userSearch')?.value.toLowerCase() || '';
    
    const filteredUsers = Object.values(users).filter(user => 
        user.username.toLowerCase().includes(searchQuery) || 
        user.id.includes(searchQuery)
    );
    
    grid.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.onclick = () => showUserProfile(user.id);
        
        const isAdmin = user.isAdmin || user.role === 'creator';
        const rank = user.role === 'creator' ? '👑' : (user.isAdmin ? '⚡' : '');
        
        userCard.innerHTML = `
            <div class="user-card-avatar">
                <i class="fas ${getAvatarIcon(user.avatar)}"></i>
            </div>
            <div class="user-card-name">${user.username} ${rank}</div>
            <div class="user-card-id">${user.id}</div>
            ${isAdmin ? '<div class="user-card-badge">Админ</div>' : ''}
        `;
        
        grid.appendChild(userCard);
    });
}

function filterUsers() {
    updateUsersList();
}

// ==================== АДМИНИСТРАЦИЯ ====================
function updateAdminsList() {
    const list = document.getElementById('adminsList');
    if (!list) return;
    
    const admins = Object.values(users).filter(u => u.isAdmin || u.role === 'creator');
    
    list.innerHTML = '';
    
    admins.forEach(admin => {
        const color = admin.role === 'creator' ? 'gold' : (admin.adminColor || 'purple');
        const rank = admin.role === 'creator' ? '👑 Создатель' : '⚡ Администратор';
        
        const adminCard = document.createElement('div');
        adminCard.className = `admin-list-card ${color}`;
        adminCard.onclick = () => showUserProfile(admin.id);
        
        adminCard.innerHTML = `
            <div class="admin-card-avatar">
                <i class="fas ${getAvatarIcon(admin.avatar)}"></i>
            </div>
            <div class="admin-card-info">
                <h3>${admin.username}</h3>
                <p class="admin-card-role">${rank}</p>
                <p>ID: ${admin.id}</p>
            </div>
        `;
        
        list.appendChild(adminCard);
    });
}

// ==================== ЧАТ ====================
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text || !currentUser) return;
    
    // Проверка кулдауна (кроме админов и создателя)
    if (!currentUser.isAdmin && currentUser.role !== 'creator' && chatCooldown) {
        showCooldownMessage('Подождите 3 секунды');
        return;
    }
    
    const message = {
        id: Date.now(),
        sender: currentUser.username,
        senderId: currentUser.id,
        text: text,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isAdmin: currentUser.isAdmin || currentUser.role === 'creator',
        isCreator: currentUser.role === 'creator'
    };
    
    messages.push(message);
    if (messages.length > CONFIG.maxMessages) {
        messages.shift();
    }
    
    saveMessages();
    addMessageToChat(message);
    input.value = '';
    
    // Активируем кулдаун
    if (!currentUser.isAdmin && currentUser.role !== 'creator') {
        activateCooldown();
    }
}

function activateCooldown() {
    chatCooldown = true;
    const timerDiv = document.getElementById('cooldownTimer');
    let seconds = 3;
    
    timerDiv.textContent = `⏳ ${seconds}с`;
    
    const interval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            timerDiv.textContent = `⏳ ${seconds}с`;
        } else {
            clearInterval(interval);
            timerDiv.textContent = '';
            chatCooldown = false;
        }
    }, 1000);
}

function showCooldownMessage(text) {
    const timerDiv = document.getElementById('cooldownTimer');
    timerDiv.textContent = text;
    timerDiv.style.color = '#ff9800';
    setTimeout(() => {
        timerDiv.style.color = '';
    }, 2000);
}

function loadChatMessages() {
    const chatDiv = document.getElementById('chatMessages');
    chatDiv.innerHTML = '';
    messages.forEach(msg => addMessageToChat(msg));
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function addMessageToChat(msg) {
    const chatDiv = document.getElementById('chatMessages');
    const isOwn = msg.sender === currentUser?.username;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
    
    if (msg.isCreator) {
        messageDiv.classList.add('creator');
    } else if (msg.isAdmin) {
        messageDiv.classList.add('admin');
    }
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender" onclick="showUserProfile('${msg.senderId}')">${msg.sender}</span>
            <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-content">${escapeHTML(msg.text)}</div>
    `;
    
    chatDiv.appendChild(messageDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// ==================== ПРОСМОТР ПРОФИЛЯ ====================
function showUserProfile(userId) {
    const user = Object.values(users).find(u => u.id === userId);
    if (!user) return;
    
    const modalBody = document.getElementById('modalBody');
    const isCreator = user.role === 'creator';
    const isAdmin = user.isAdmin;
    
    modalBody.innerHTML = `
        <div class="modal-profile">
            <div class="modal-profile-header">
                <div class="modal-avatar">
                    <i class="fas ${getAvatarIcon(user.avatar)}"></i>
                </div>
                <div class="modal-profile-info">
                    <h2>${user.username}</h2>
                    <p class="modal-id">ID: ${user.id}</p>
                    <div class="modal-badges">
                        ${isCreator ? '<span class="badge creator-badge">👑 Создатель</span>' : ''}
                        ${isAdmin && !isCreator ? '<span class="badge admin-badge">⚡ Админ</span>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="modal-stat">
                <i class="fas fa-calendar-alt"></i>
                <span>Регистрация: ${user.regDate}</span>
            </div>
            
            <div class="modal-titles">
                <h4>Титулы (${user.titles.length}):</h4>
                <div class="modal-titles-list">
                    ${user.titles.map(t => `<span class="modal-title">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('profileModal').classList.add('active');
}

// ==================== АДМИН ФУНКЦИИ ====================
function giveTitle() {
    const targetID = document.getElementById('targetUserID').value.trim();
    const title = document.getElementById('titleToGive').value.trim();
    
    if (!targetID || !title) {
        alert('❌ Заполните все поля');
        return;
    }
    
    const targetUser = findUserByID(targetID);
    if (!targetUser) {
        alert('❌ Пользователь не найден');
        return;
    }
    
    if (!targetUser.titles) targetUser.titles = [];
    targetUser.titles.push(title);
    
    // Обновляем пользователя
    Object.keys(users).forEach(key => {
        if (users[key].id === targetID) {
            users[key] = targetUser;
        }
    });
    
    saveUsers();
    alert(`✅ Титул "${title}" выдан пользователю ${targetUser.username}`);
    
    // Очищаем поля
    document.getElementById('targetUserID').value = '';
    document.getElementById('titleToGive').value = '';
}

function makeAdmin() {
    const targetID = document.getElementById('newAdminID').value.trim();
    const color = document.getElementById('adminColorSelect').value;
    
    if (!targetID) {
        alert('❌ Введите ID пользователя');
        return;
    }
    
    const targetUser = findUserByID(targetID);
    if (!targetUser) {
        alert('❌ Пользователь не найден');
        return;
    }
    
    if (targetUser.role === 'creator') {
        alert('❌ Нельзя изменить права создателя');
        return;
    }
    
    targetUser.isAdmin = true;
    targetUser.adminColor = color;
    
    if (!targetUser.titles.includes('⚡ Администратор')) {
        targetUser.titles.push('⚡ Администратор');
    }
    
    // Обновляем пользователя
    Object.keys(users).forEach(key => {
        if (users[key].id === targetID) {
            users[key] = targetUser;
        }
    });
    
    saveUsers();
    alert(`✅ ${targetUser.username} назначен администратором`);
    updateAdminsList();
    
    document.getElementById('newAdminID').value = '';
}

function removeCooldown() {
    const targetID = document.getElementById('unbanUserID').value.trim();
    if (!targetID) {
        alert('❌ Введите ID пользователя');
        return;
    }
    
    alert(`✅ Кулдаун снят для пользователя с ID: ${targetID}`);
    document.getElementById('unbanUserID').value = '';
}

function removeTitle() {
    const targetID = document.getElementById('removeTitleUserID').value.trim();
    const title = document.getElementById('titleToRemove').value.trim();
    
    if (!targetID || !title) {
        alert('❌ Заполните все поля');
        return;
    }
    
    const targetUser = findUserByID(targetID);
    if (!targetUser) {
        alert('❌ Пользователь не найден');
        return;
    }
    
    const index = targetUser.titles.indexOf(title);
    if (index > -1) {
        targetUser.titles.splice(index, 1);
        
        // Обновляем пользователя
        Object.keys(users).forEach(key => {
            if (users[key].id === targetID) {
                users[key] = targetUser;
            }
        });
        
        saveUsers();
        alert(`✅ Титул "${title}" удален у пользователя ${targetUser.username}`);
    } else {
        alert('❌ Титул не найден');
    }
    
    document.getElementById('removeTitleUserID').value = '';
    document.getElementById('titleToRemove').value = '';
}

// ==================== НАСТРОЙКИ ====================
function selectAvatar(avatarId) {
    if (!currentUser) return;
    
    currentUser.avatar = avatarId;
    users[currentUser.username].avatar = avatarId;
    
    saveUsers();
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUI();
}

function setTheme(color) {
    const colors = {
        'purple': '#9c54ff',
        'blue': '#4da6ff',
        'red': '#ff4d4d',
        'green': '#4caf50',
        'orange': '#ff9800',
        'pink': '#e91e63'
    };
    
    document.documentElement.style.setProperty('--primary', colors[color] || '#9c54ff');
    localStorage.setItem('theme', color);
}

// ==================== МОДАЛЬНЫЕ ОКНА ====================
function showOfferModal() {
    document.getElementById('offerModal').classList.add('active');
}

function closeOfferModal() {
    document.getElementById('offerModal').classList.remove('active');
}

function acceptOffer() {
    document.getElementById('offerAgree').checked = true;
    closeOfferModal();
}

function closeModal() {
    document.getElementById('profileModal').classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ==================== МОБИЛЬНОЕ МЕНЮ ====================
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    
    sidebar.classList.toggle('active');
    toggle.classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('mobileMenuToggle').classList.remove('active');
}

// ==================== ПАРОЛЬ ====================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'far fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'far fa-eye';
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ====================
function findUserByID(id) {
    return Object.values(users).find(u => u.id === id);
}

function getAvatarIcon(avatarId) {
    const icons = {
        '1': 'fa-user-astronaut', '2': 'fa-rocket', '3': 'fa-star',
        '4': 'fa-meteor', '5': 'fa-moon', '6': 'fa-sun',
        '7': 'fa-galaxy', '8': 'fa-saturn', '9': 'fa-alien',
        '10': 'fa-robot'
    };
    return icons[avatarId] || 'fa-user-astronaut';
}

function copyID() {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.id).then(() => {
        alert('✅ ID скопирован в буфер обмена!');
    }).catch(() => {
        alert('❌ Не удалось скопировать');
    });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== ВЫХОД ====================
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('authScreen').classList.add('active');
    document.getElementById('authForm').reset();
    closeMobileMenu();
}

// ==================== ЗАГРУЗКА ТЕМЫ ====================
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
}
