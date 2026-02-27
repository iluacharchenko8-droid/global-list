<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Global List | Космическая сеть</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="particles-js"></div>
    
    <div class="app">
        <!-- ЭКРАН ВХОДА -->
        <div id="authScreen" class="screen auth-screen active">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1 class="logo">GLOBAL<span>LIST</span></h1>
                        <p class="logo-sub">Войди в свою вселенную</p>
                    </div>
                    
                    <form id="authForm" class="auth-form">
                        <div class="input-field">
                            <i class="fas fa-user"></i>
                            <input type="text" id="loginUsername" placeholder="Никнейм" autocomplete="off" required>
                        </div>
                        
                        <div class="input-field">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="loginPassword" placeholder="Пароль" required>
                            <button type="button" class="password-toggle" onclick="togglePassword('loginPassword')">
                                <i class="far fa-eye"></i>
                            </button>
                        </div>
                        
                        <div class="input-field" id="confirmField">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="confirmPassword" placeholder="Подтвердите пароль">
                            <button type="button" class="password-toggle" onclick="togglePassword('confirmPassword')">
                                <i class="far fa-eye"></i>
                            </button>
                        </div>
                        
                        <label class="checkbox-container">
                            <input type="checkbox" id="offerAgree" required>
                            <span class="checkmark"></span>
                            <span class="checkbox-text">Я принимаю условия оферты</span>
                        </label>
                        
                        <button type="submit" class="auth-button" id="authBtn">
                            <span>Войти / Регистрация</span>
                        </button>
                        
                        <div id="authMessage" class="auth-message"></div>
                    </form>
                </div>
            </div>
        </div>

        <!-- ОСНОВНОЙ ЭКРАН -->
        <div id="mainScreen" class="screen main-screen">
            <div class="mobile-menu-toggle" id="mobileMenuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">G<span>L</span></div>
                    <button class="sidebar-close" id="sidebarClose"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="sidebar-profile" id="sidebarProfile">
                    <div class="profile-avatar" id="menuAvatar">
                        <i class="fas fa-user-astronaut"></i>
                    </div>
                    <div class="profile-info">
                        <div class="profile-name" id="menuUsername">Загрузка...</div>
                        <div class="profile-id" id="menuUserId">ID: загрузка</div>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <ul>
                        <li><a href="#" class="nav-link active" data-section="profile"><i class="fas fa-id-card"></i><span>Мой профиль</span></a></li>
                        <li><a href="#" class="nav-link" data-section="chat"><i class="fas fa-comments"></i><span>Глобальный чат</span></a></li>
                        <li><a href="#" class="nav-link" data-section="users"><i class="fas fa-users"></i><span>Все пользователи</span></a></li>
                        <li><a href="#" class="nav-link" data-section="admins"><i class="fas fa-crown"></i><span>Администрация</span></a></li>
                        <li><a href="#" class="nav-link" data-section="settings"><i class="fas fa-paint-brush"></i><span>Оформление</span></a></li>
                    </ul>
                </nav>
                
                <div class="sidebar-footer">
                    <button class="logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Выйти</span>
                    </button>
                </div>
            </aside>

            <main class="content" id="content">
                <div class="section active" id="profileSection">
                    <div class="profile-card">
                        <h2>Профиль загружается...</h2>
                    </div>
                </div>
                <div class="section" id="chatSection">
                    <div class="chat-container">
                        <h2>Чат загружается...</h2>
                    </div>
                </div>
                <div class="section" id="usersSection">
                    <div class="users-container">
                        <h2>Пользователи загружаются...</h2>
                    </div>
                </div>
                <div class="section" id="adminsSection">
                    <div class="admins-container">
                        <h2>Администрация загружается...</h2>
                    </div>
                </div>
                <div class="section" id="settingsSection">
                    <div class="settings-container">
                        <h2>Настройки загружаются...</h2>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
