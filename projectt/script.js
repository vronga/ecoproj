
// ==========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================

// Сохранение сессии пользователя
function saveUserSession(user) {
    localStorage.setItem('ekb_current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        login: user.login,
        password: user.password,
        points: user.points,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar,
        background: user.background,
        role: user.role,
        location: user.location,
        inventory: user.inventory,
        completedQuests: user.completedQuests,
        activeBoosts: user.activeBoosts,
        frame: user.frame,
        isOnline: true
    }));
}

function loadUserSession() {
    const savedUser = localStorage.getItem('ekb_current_user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Находим актуального пользователя в allUsers
        const user = allUsers.find(u => u.id === userData.id);
        if (user) {
            // Обновляем данные пользователя из сессии
            user.points = userData.points;
            user.xp = userData.xp;
            user.level = userData.level;
            user.avatar = userData.avatar;
            user.background = userData.background;
            user.location = userData.location;
            user.inventory = userData.inventory;
            user.completedQuests = userData.completedQuests;
            user.frame = userData.frame;
            user.isOnline = true;
            return user;
        }
    }
    return null;
}

function clearUserSession() {
    localStorage.removeItem('ekb_current_user');
}

let currentUser = null;
let allUsers = [];
let quests = [];
let donations = [];
let shopItems = [];
let submissions = [];
let mapInstance = null;
let markersLayer = null;
let routingControl = null;
let currentPage = 'map';
let currentShopTab = 'avatars';
let onlineInterval = null;
let newQuestLocation = null;
let newQuestTempMarker = null;

// Координаты Экибастуза
const EKIBASTUZ_COORDS = { lat: 51.7273, lng: 72.4163 };

// Адреса Экибастуза для создания квестов
const EKIBASTUZ_ADDRESSES = [
    { name: "Парк Победы", lat: 51.7350, lng: 72.4250 },
    { name: "Центральная площадь", lat: 51.7273, lng: 72.4163 },
    { name: "ЖД Вокзал", lat: 51.7200, lng: 72.4100 },
    { name: "Торговый центр", lat: 51.7300, lng: 72.4200 },
    { name: "Школа №1", lat: 51.7250, lng: 72.4150 },
    { name: "Больница", lat: 51.7400, lng: 72.4300 },
    { name: "Стадион", lat: 51.7220, lng: 72.4080 },
    { name: "Музей", lat: 51.7280, lng: 72.4180 }
];

// ==========================================
// ИНИЦИАЛИЗАЦИЯ ДАННЫХ
// ==========================================
function initData() {
    localStorage.removeItem('ekb_shop');
    // Пользователи
    // Пользователи
    if (!localStorage.getItem('ekb_users')) {
        allUsers = [
            {
                id: 'mod_1',
                name: 'Админ Эко',
                email: 'moderationforsitebeta67',
                login: 'moderationforsitebeta67',
                password: '12345676767aoao',
                points: 5000,
                xp: 2500,
                level: 6,
                avatar: 'texture/avv1.jfif',
                background: 'texture/fonn1.jfif',
                role: 'moderator',
                location: EKIBASTUZ_COORDS,
                inventory: ['s_av1', 's_bg1'],
                completedQuests: [],
                isOnline: true,
                activeBoosts: [],
                frame: ''
            },
            {
                id: 'user_1',
                name: 'Алексей',
                email: 'alex@example.com',
                login: 'alex',
                password: '123',
                points: 300,
                xp: 450,
                level: 3,
                avatar: 'texture/avv2.jfif',
                background: '',
                role: 'user',
                location: { lat: 51.73, lng: 72.42 },
                inventory: [],
                completedQuests: [],
                isOnline: true,
                activeBoosts: [],
                frame: ''
            },
            {
                id: 'user_2',
                name: 'Мария',
                email: 'maria@example.com',
                login: 'maria',
                password: '123',
                points: 150,
                xp: 200,
                level: 2,
                avatar: 'texture/avv3.jfif',
                background: '',
                role: 'user',
                location: { lat: 51.72, lng: 72.41 },
                inventory: [],
                completedQuests: [],
                isOnline: true,
                activeBoosts: [],
                frame: ''
            }
        ];
        save('ekb_users', allUsers);
    } else allUsers = load('ekb_users');

    // Квесты
    if (!localStorage.getItem('ekb_quests')) {
        quests = [
            {
                id: 'q_1',
                title: 'Уборка парка Победы',
                description: 'Собери мусор в парке и сделай фото до/после',
                xpReward: 150,
                coinReward: 100,
                lat: 51.7350,
                lng: 72.4250,
                creatorId: 'mod_1',
                status: 'active',
                isUrgent: true,
                address: 'Парк Победы'
            },
            {
                id: 'q_2',
                title: 'Посади дерево',
                description: 'Участвуй в озеленении города',
                xpReward: 200,
                coinReward: 150,
                lat: 51.7273,
                lng: 72.4163,
                creatorId: 'mod_1',
                status: 'active',
                isUrgent: false,
                address: 'Центральная площадь'
            }
        ];
        save('ekb_quests', quests);
    } else quests = load('ekb_quests');

    // Пожертвования
    if (!localStorage.getItem('ekb_donations')) {
        donations = [
            {
                id: 'd_1',
                title: 'Новые скамейки в парке',
                description: 'Собираем на установку экологичных скамеек',
                img: '🪑',
                current: 1200,
                goal: 5000
            },
            {
                id: 'd_2',
                title: 'Урны для раздельного сбора',
                description: 'Установка контейнеров для переработки',
                img: '♻️',
                current: 800,
                goal: 3000
            }
        ];
        save('ekb_donations', donations);
    } else donations = load('ekb_donations');

    // Магазин
    if (!localStorage.getItem('ekb_shop')) {
        shopItems = [
            // Аватары
            { id: 's_av1', type: 'avatar', src: 'texture/avv1.jfif', price: 300 },
            { id: 's_av2', type: 'avatar', src: 'texture/avv2.jfif', price: 250 },
            { id: 's_av3', type: 'avatar', src: 'texture/avv3.jfif', price: 400 },
            { id: 's_av4', type: 'avatar', src: 'texture/avv4.jfif', price: 500 },
            // Фоны
            { id: 's_bg1', type: 'background', src: 'texture/fonn1.jfif', price: 800 },
            { id: 's_bg2', type: 'background', src: 'texture/fonn2.jfif', price: 600 },
            { id: 's_bg3', type: 'background', src: 'texture/fonn3.jfif', price: 1200 }
        ];
        save('ekb_shop', shopItems);
    } else shopItems = load('ekb_shop');

    // Заявки
    if (!localStorage.getItem('ekb_submissions')) {
        submissions = [];
        save('ekb_submissions', submissions);
    } else submissions = load('ekb_submissions');
}

// Утилиты
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function load(key) { return JSON.parse(localStorage.getItem(key)); }

function showToast(msg, icon = '🔔') {
    const div = document.createElement('div');
    div.className = 'toast';
    div.innerHTML = `<span>${icon}</span> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2800);
}

// ==========================================
// ИГРОВАЯ ЛОГИКА
// ==========================================
function calcLevel(xp) { return Math.floor(1 + Math.sqrt(xp / 100)); }

function getMultiplier(type) {
    if (!currentUser || !currentUser.activeBoosts) return 1;
    let mult = 1;
    const now = Date.now();
    currentUser.activeBoosts = currentUser.activeBoosts.filter(b => b.expires > now);
    currentUser.activeBoosts.forEach(b => {
        if (b.type.startsWith(type)) mult *= parseFloat(b.type.split('_')[1]);
    });
    return mult;
}

function addRewards(userId, xpBase, coinBase) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const rewardFactor = 0.8;
    let xpG = Math.floor(xpBase * rewardFactor);
    let coinG = Math.floor(coinBase * rewardFactor);

    if (currentUser && currentUser.id === userId) {
        xpG = Math.floor(xpG * getMultiplier('xp'));
    }

    user.xp = (user.xp || 0) + xpG;
    user.points = (user.points || 0) + coinG;

    const newLvl = calcLevel(user.xp);
    let lvlUp = false;
    if (newLvl > user.level) { user.level = newLvl; lvlUp = true; }

    if (currentUser && currentUser.id === userId) {
        currentUser = { ...user };
        showToast(`+${xpG} XP | +${coinG} 🪙`, '🎉');
        if (lvlUp) setTimeout(() => showToast(`Уровень ${newLvl}!`, '🔥'), 1000);
    }
    save('ekb_users', allUsers);
}

function donate(donationId, amount) {
    if (!currentUser) return showToast('Сначала войдите', '❌');
    if (currentUser.points < amount) return showToast('Недостаточно монет!', '💸');

    const don = donations.find(d => d.id === donationId);
    if (!don) return;

    currentUser.points -= amount;
    don.current += amount;

    const dbU = allUsers.find(u => u.id === currentUser.id);
    if (dbU) dbU.points = currentUser.points;
    save('ekb_users', allUsers);
    save('ekb_donations', donations);

    showToast(`Пожертвовано ${amount}🪙`, '❤️');
    renderCurrentPage();
}

// Симуляция онлайн-пользователей
function simulateOnlineUsers() {
    if (onlineInterval) clearInterval(onlineInterval);
    onlineInterval = setInterval(() => {
        let moved = false;
        allUsers.forEach(u => {
            if (u.id !== (currentUser?.id) && u.isOnline) {
                u.location.lat += (Math.random() - 0.5) * 0.001;
                u.location.lng += (Math.random() - 0.5) * 0.001;
                moved = true;
            }
        });
        if (moved && currentPage === 'map' && mapInstance) refreshMapMarkers();
    }, 5000);
}

// ==========================================
// КАРТА
// ==========================================
function initMap(containerId) {
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    const center = currentUser?.location || EKIBASTUZ_COORDS;

    mapInstance = L.map(containerId, { zoomControl: false }).setView([center.lat, center.lng], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    }).addTo(mapInstance);

    L.control.zoom({ position: 'topright' }).addTo(mapInstance);
    markersLayer = L.layerGroup().addTo(mapInstance);

    refreshMapMarkers();
}

function refreshMapMarkers() {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    // Квесты
    quests.filter(q => q.status === 'active').forEach(q => {
        const markerType = q.isUrgent ? 'urgent' : 'normal';
        const truncated = q.title.length > 20 ? q.title.slice(0, 20) + '…' : q.title;
        const icon = L.divIcon({
            html: `
                        <div class="quest-marker ${markerType}">
                            <i class="fas fa-${q.isUrgent ? 'star' : 'leaf'}"></i>
                            <div class="marker-name">${truncated}</div>
                        </div>
                    `,
            className: '',
            iconSize: [80, 72],
            iconAnchor: [40, 72]
        });
        const marker = L.marker([q.lat, q.lng], { icon }).addTo(markersLayer);

        marker.bindPopup(`
                    <div style="min-width: 250px; background: #111827; color: var(--text); border-radius: 18px; padding: 15px;">
                        <h3 style="margin: 0 0 10px 0; color: var(--primary);">${q.title}</h3>
                        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">${q.description}</p>
                        <p style="margin: 0 0 10px 0; color: var(--text-muted); font-size: 0.85rem;">
                            <i class="fas fa-map-marker-alt"></i> ${q.address}
                        </p>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <span class="badge"><i class="fas fa-arrow-up"></i> ${q.xpReward} XP</span>
                            <span class="badge"><i class="fas fa-coins"></i> ${q.coinReward} 🪙</span>
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 8px;" 
                                onclick="startRouting(${q.lat}, ${q.lng})">
                            <i class="fas fa-route"></i> Проложить маршрут
                        </button>
                        <button class="btn btn-accent" style="width: 100%;" 
                                onclick="openQuestSubmit('${q.id}')">
                            <i class="fas fa-play"></i> Взять квест
                        </button>
                    </div>
                `, { maxWidth: 300 });
    });

    // Пользователи - убраны, оставлена только стрелочка текущего игрока

    // Текущий пользователь
    if (currentUser) {
        const myIcon = L.divIcon({
            html: `
                        <div class="current-user-arrow">
                            <i class="fas fa-location-arrow"></i>
                        </div>
                    `,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
        L.marker([currentUser.location.lat, currentUser.location.lng], { icon: myIcon }).addTo(markersLayer);
    }
}

window.startRouting = (lat, lng) => {
    if (!currentUser) return showToast('Нужна авторизация', '❌');
    if (routingControl) mapInstance.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(currentUser.location.lat, currentUser.location.lng),
            L.latLng(lat, lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: '#10b981', weight: 6, opacity: 0.8 }] },
        show: false,
        createMarker: () => null
    }).addTo(mapInstance);
    mapInstance.closePopup();
}

function updateGeo() {
    if (!navigator.geolocation) return showToast('Геолокация не поддерживается');
    navigator.geolocation.getCurrentPosition(
        p => {
            if (currentUser) {
                currentUser.location = { lat: p.coords.latitude, lng: p.coords.longitude };
                const dbU = allUsers.find(u => u.id === currentUser.id);
                if (dbU) dbU.location = currentUser.location;
                save('ekb_users', allUsers);
            }
            if (mapInstance) {
                mapInstance.setView([p.coords.latitude, p.coords.longitude], 15);
                refreshMapMarkers();
            }
            showToast('Координаты обновлены', '📍');
        },
        () => showToast('Ошибка доступа к GPS', '⚠️')
    );
}

// ==========================================
// МИНИ-ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ==========================================
window.showMiniProfile = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="mini-profile">
                    <div class="mini-profile-header">
                        <div class="mini-profile-avatar">
                            <img src="${user.avatar}" alt="${user.name}">
                        </div>
                        <div class="mini-profile-info">
                            <h3>${user.name}</h3>
                            <span class="badge">Уровень ${user.level}</span>
                            <span class="badge">${user.points} 🪙</span>
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <p style="color: var(--text-muted); margin-bottom: 0.5rem;">
                            <i class="fas fa-tasks"></i> Выполнено квестов: ${user.completedQuests?.length || 0}
                        </p>
                        <p style="color: var(--text-muted);">
                            <i class="fas fa-star"></i> Опыт: ${user.xp} XP
                        </p>
                    </div>
                    <button class="btn btn-outline" style="width: 100%; margin-top: 1rem;" 
                            onclick="this.closest('.modal-overlay').remove()">
                        Закрыть
                    </button>
                </div>
            `;
    document.body.appendChild(modal);
}

// ==========================================
// РЕНДЕР СТРАНИЦ
// ==========================================
function renderMap() {
    const root = document.getElementById('appRoot');
    root.innerHTML = `
                <div class="card" style="padding: 1rem;">
                    <div class="flex-between mb-1">
                        <h3><i class="fas fa-map-marked-alt text-primary"></i> Карта Экибастуза</h3>
                        <div>
                            <button class="btn btn-outline" style="padding: 8px 12px;" onclick="updateGeo()">
                                <i class="fas fa-crosshairs"></i>
                            </button>
                            ${currentUser ?
            `<button class="btn btn-primary" style="padding: 8px 12px; margin-left: 8px;" 
                                         onclick="createNewQuest()">
                                    <i class="fas fa-plus"></i> Создать квест
                                </button>` : ''}
                        </div>
                    </div>
                    <div id="mainMap" class="map-container"></div>
                </div>
                
                <div class="grid-2" style="gap: 1rem;">
                    <div class="card">
                        <h3>⚡ Срочные задания</h3>
                        <div id="urgentQuestsList"></div>
                    </div>
                    <div class="card">
                        <h3>🍃 Обычные задания</h3>
                        <div id="normalQuestsList"></div>
                    </div>
                </div>
            `;

    setTimeout(() => initMap('mainMap'), 100);

    const urgent = quests.filter(q => q.status === 'active' && q.isUrgent);
    const normal = quests.filter(q => q.status === 'active' && !q.isUrgent);

    const uList = document.getElementById('urgentQuestsList');
    if (urgent.length === 0) {
        uList.innerHTML = '<p class="text-muted">Сейчас нет срочных заданий.</p>';
    } else {
        uList.innerHTML = urgent.map(q => `
                    <div class="list-item urgent flex-between">
                        <div>
                            <h4 style="color: var(--danger); margin-bottom: 8px;">${q.title}</h4>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">
                                <i class="fas fa-map-marker-alt"></i> ${q.address}
                            </p>
                            <div style="display: flex; gap: 8px;">
                                <span class="badge"><i class="fas fa-arrow-up"></i> ${q.xpReward} XP</span>
                                <span class="badge"><i class="fas fa-coins"></i> ${q.coinReward} 🪙</span>
                            </div>
                        </div>
                        <button class="btn btn-danger" onclick="openQuestSubmit('${q.id}')">Взять</button>
                    </div>
                `).join('');
    }

    const nList = document.getElementById('normalQuestsList');
    if (normal.length === 0) {
        nList.innerHTML = '<p class="text-muted">Сейчас нет обычных заданий.</p>';
    } else {
        nList.innerHTML = normal.map(q => `
                    <div class="list-item flex-between">
                        <div>
                            <h4 style="margin-bottom: 8px;">${q.title}</h4>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 8px;">
                                <i class="fas fa-map-marker-alt"></i> ${q.address}
                            </p>
                            <div style="display: flex; gap: 8px;">
                                <span class="badge"><i class="fas fa-arrow-up"></i> ${q.xpReward} XP</span>
                                <span class="badge"><i class="fas fa-coins"></i> ${q.coinReward} 🪙</span>
                            </div>
                        </div>
                        <button class="btn btn-secondary" onclick="openQuestSubmit('${q.id}')">Взять</button>
                    </div>
                `).join('');
    }
}

function renderQuests() {
    const root = document.getElementById('appRoot');
    const activeQs = quests.filter(q => q.status === 'active');

    root.innerHTML = `
                <h2><i class="fas fa-clipboard-list"></i> Доступные квесты</h2>
                <p class="text-muted mb-1">Выполняй задания и получай награды.</p>
                <div id="questsContainer">
                    ${activeQs.map(q => `
                        <div class="card" style="border-left: 5px solid ${q.isUrgent ? 'var(--danger)' : 'var(--primary)'}">
                            <h3>${q.title}</h3>
                            <p class="text-muted mt-1" style="font-size: 0.9rem;">${q.description}</p>
                            <p class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">
                                <i class="fas fa-map-marker-alt"></i> ${q.address}
                            </p>
                            <div class="flex-between mt-1" style="margin-top: 1.5rem;">
                                <div>
                                    <span class="badge"><i class="fas fa-star"></i> ${q.xpReward}</span>
                                    <span class="badge"><i class="fas fa-coins"></i> ${q.coinReward}</span>
                                </div>
                                <button class="btn btn-primary" onclick="openQuestSubmit('${q.id}')">Выполнить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
}

function renderDonations() {
    const root = document.getElementById('appRoot');
    root.innerHTML = `
                <h2><i class="fas fa-hands-helping"></i> Пожертвования</h2>
                <p class="text-muted mb-1">Пожертвуй монеты на улучшение города.</p>
                ${donations.map(d => {
        const percent = Math.min(100, Math.floor((d.current / d.goal) * 100));
        return `
                        <div class="card">
                            <div class="flex-between">
                                <div style="font-size: 3rem;">${d.img}</div>
                                <div style="flex: 1; margin-left: 1rem;">
                                    <h3>${d.title}</h3>
                                    <p class="text-muted" style="font-size: 0.85rem; margin-top: 5px;">${d.description}</p>
                                </div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-fill donation-fill" style="width: ${percent}%"></div>
                            </div>
                            <div class="flex-between" style="font-size: 0.85rem; font-weight: bold;">
                                <span>Собрано: ${d.current} 🪙</span>
                                <span>Цель: ${d.goal} 🪙</span>
                            </div>
                            <div class="grid-2 mt-1">
                                <button class="btn btn-outline" onclick="donate('${d.id}', 50)">50 🪙</button>
                                <button class="btn btn-outline" onclick="donate('${d.id}', 100)">100 🪙</button>
                                <button class="btn btn-secondary" style="grid-column: 1 / -1;" onclick="donate('${d.id}', 500)">500 🪙</button>
                            </div>
                        </div>
                    `;
    }).join('')}
            `;
}

function renderShop() {
    if (!currentUser) return showAuthWall();

    const root = document.getElementById('appRoot');
    root.innerHTML = `
        <div class="flex-between mb-1">
            <h2><i class="fas fa-store"></i> Магазин</h2>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div class="badge" style="font-size: 1rem;"><i class="fas fa-coins"></i> ${currentUser.points}</div>
                <button class="btn btn-outline" style="padding: 8px 10px; height: 38px;" onclick="showBuyCoinsModal()">+</button>
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab-btn ${currentShopTab === 'avatars' ? 'active' : ''}" 
                    onclick="currentShopTab='avatars'; renderShop()">Аватары</button>
            <button class="tab-btn ${currentShopTab === 'backgrounds' ? 'active' : ''}" 
                    onclick="currentShopTab='backgrounds'; renderShop()">Фоны</button>
        </div>
        
        <div class="shop-grid">
            ${(() => {
            // Фильтруем по типу
            let filteredItems = [];
            if (currentShopTab === 'backgrounds') {
                filteredItems = shopItems.filter(i => i.type === 'background');
            } else {
                filteredItems = shopItems.filter(i => i.type === 'avatar');
            }

            // ✅ СОРТИРОВКА ПО ЦЕНЕ (от дешёвых к дорогим)
            filteredItems.sort((a, b) => a.price - b.price);

            return filteredItems.map(item => {
                const hasItem = currentUser.inventory.includes(item.id);

                // ✅ ИСПРАВЛЕНА ЗАГРУЗКА КАРТИНОК
                if (item.type === 'background') {
                    return `
                            <div class="shop-card">
                                <div style="width: 100%; height: 120px; background-image: url('${item.value}'); background-size: cover; background-position: center; border-radius: 12px; margin-bottom: 0.75rem;"></div>
                                <h4 style="font-size: 0.9rem;">${item.name || 'Фон'}</h4>
                                ${hasItem ?
                            `<button class="btn btn-outline" style="width: 100%;" onclick="equipItem('${item.id}')">✅ Экипировать</button>` :
                            `<button class="btn btn-primary" style="width: 100%;" onclick="buyItem('${item.id}')">${item.price} 🪙</button>`
                        }
                            </div>
                        `;
                } else {
                    return `
                            <div class="shop-card">
                                <img src="${item.value}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; margin: 0 auto 0.75rem; display: block;" 
                                     onerror="this.src='https://via.placeholder.com/80?text=Avatar'">
                                <h4 style="font-size: 0.9rem;">${item.name || 'Аватар'}</h4>
                                ${hasItem ?
                            `<button class="btn btn-outline" style="width: 100%;" onclick="equipItem('${item.id}')">✅ Экипировать</button>` :
                            `<button class="btn btn-primary" style="width: 100%;" onclick="buyItem('${item.id}')">${item.price} 🪙</button>`
                        }
                            </div>
                        `;
                }
            }).join('');
        })()}
        </div>
    `;
}

function renderProfile() {
    if (!currentUser) return showAuthWall();
    const root = document.getElementById('appRoot');

    const xpForNext = Math.pow(currentUser.level, 2) * 100;
    const xpCurrentLvl = Math.pow(currentUser.level - 1, 2) * 100;
    const progress = Math.max(0, Math.min(100, ((currentUser.xp - xpCurrentLvl) / (xpForNext - xpCurrentLvl)) * 100));

    let boostHtml = '';
    if (currentUser.activeBoosts && currentUser.activeBoosts.length > 0) {
        boostHtml = `
            <div class="card" style="border: 1px solid var(--accent);">
                <h4><i class="fas fa-bolt" style="color: var(--accent);"></i> Активные бусты</h4>
                ${currentUser.activeBoosts.map(b =>
            `<div class="badge mt-1">${b.type.replace('_', ' x')} (до ${new Date(b.expires).toLocaleTimeString()})</div>`
        ).join('')}
            </div>
        `;
    }

    // ТВОИ СТАРЫЕ ССЫЛКИ
    const LEVEL_REWARDS = {
        5: { type: 'avatar', id: 'reward_av1', url: 'texture/av5.jfif', name: '' },
        10: { type: 'avatar', id: 'reward_av2', url: 'texture/av10.jfif', name: '' },
        15: { type: 'background', id: 'reward_bg1', url: 'texture/fon15.jfif', name: '' },
        20: { type: 'avatar', id: 'reward_av3', url: 'texture/av20.jfif', name: '' },
        25: { type: 'background', id: 'reward_bg2', url: 'texture/fon25.jfif', name: '' },
        30: { type: 'avatar', id: 'reward_av4', url: 'texture/av30.jfif', name: '' },
        35: { type: 'background', id: 'reward_bg3', url: 'texture/fon35.jfif', name: '' },
        40: { type: 'avatar', id: 'reward_av5', url: 'texture/av40.jfif', name: '' },
        45: { type: 'background', id: 'reward_bg4', url: 'texture/fon45.jfif', name: '' },
        50: { type: 'avatar', id: 'reward_av6', url: 'texture/av50.jfif', name: '' }
    };

    const unlockedRewards = Object.entries(LEVEL_REWARDS).filter(([lvl]) => currentUser.level >= parseInt(lvl));

    // ФОРМИРУЕМ СТИЛЬ ДЛЯ ФОНА
    let bgStyle = '';
    if (currentUser.background && currentUser.background !== '' && currentUser.background !== 'none') {
        if (currentUser.background.startsWith('url(')) {
            bgStyle = `background-image: ${currentUser.background};`;
        } else {
            bgStyle = `background-image: url(${currentUser.background});`;
        }
    }

    root.innerHTML = `
        <div class="profile-header" style="${bgStyle}">
            <div class="profile-content">
                <div class="avatar-lg" style="${currentUser.frame || ''}">
                    <img src="${currentUser.avatar}" alt="${currentUser.name}">
                </div>
                <h2 class="mt-1">${currentUser.name}</h2>
                <p class="text-muted">${currentUser.role === 'moderator' ? '👑 Модератор' : 'Эко-волонтёр'}</p>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="showProfileTab('stats')">Статистика</button>
            <button class="tab-btn" onclick="showProfileTab('rewards')">Награды</button>
            <button class="tab-btn" onclick="showProfileTab('customize')">Кастомизация</button>
            <button class="tab-btn" onclick="showProfileTab('withdraw')">Вывод монет</button>
        </div>

        <div id="profileContent">
            <div id="statsTab" class="tab-content">
                <div class="card">
                    <div class="flex-between">
                        <h3>Уровень ${currentUser.level}</h3>
                        <span class="text-muted">${currentUser.xp} / ${xpForNext} XP</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    
                    <div class="grid-2 mt-1">
                        <div class="stat-box">
                            <i class="fas fa-coins text-accent" style="font-size: 1.5rem;"></i>
                            <h4>${currentUser.points}</h4>
                            <span class="text-muted" style="font-size: 0.8rem">Монет</span>
                        </div>
                        <div class="stat-box">
                            <i class="fas fa-check-circle text-primary" style="font-size: 1.5rem;"></i>
                            <h4>${currentUser.completedQuests?.length || 0}</h4>
                            <span class="text-muted" style="font-size: 0.8rem">Квестов</span>
                        </div>
                    </div>
                </div>
                ${boostHtml}
            </div>

            <div id="rewardsTab" class="tab-content" style="display: none;">
                <div class="card">
                    <h3>Прогрессия уровней</h3>
                    <p class="text-muted mb-1">Каждые 5 уровней вы получаете специальную награду!</p>
                    <div class="grid-2">
                        ${Object.entries(LEVEL_REWARDS).map(([level, reward]) => {
        const isUnlocked = currentUser.level >= parseInt(level);
        const isCurrent = currentUser.level == level;
        return `
                                <div class="level-reward-item ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}">
                                    <div class="flex-between">
                                        <span class="text-primary">Уровень ${level}</span>
                                        ${isUnlocked ? '<i class="fas fa-check-circle text-success"></i>' : '<i class="fas fa-lock text-muted"></i>'}
                                    </div>
                                    <div class="mt-1">
                                        ${reward.type === 'avatar' ?
                `<img src="${reward.url}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
                `<div style="width: 40px; height: 40px; background-image: url(${reward.url}); background-size: cover; border-radius: 8px;"></div>`
            }
                                        <span class="text-muted" style="font-size: 0.8rem;">${reward.name}</span>
                                    </div>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            </div>

            <div id="customizeTab" class="tab-content" style="display: none;">
                <div class="card">
                    <h3>Кастомизация профиля</h3>
                    <p class="text-muted mb-1">Выберите аватар и фон из разблокированных наград</p>
                    <button class="btn btn-primary" onclick="showProfileEditor()">Настроить профиль</button>
                </div>
            </div>

            <div id="withdrawTab" class="tab-content" style="display: none;">
                <div class="card">
                    <h3>Вывод монет в тенге</h3>
                    <p class="text-muted mb-1">Обменяйте монеты на реальные деньги</p>
                    <div class="stat-box" style="margin-bottom: 1rem;">
                        <i class="fas fa-coins text-accent" style="font-size: 1.5rem;"></i>
                        <h4>${currentUser.points} монет = ${(currentUser.points * 10).toLocaleString()} ₸</h4>
                        <span class="text-muted" style="font-size: 0.8rem">Курс: 1 монета = 10 ₸</span>
                    </div>
                    <button class="btn btn-success" style="width: 100%;" onclick="showWithdrawModal()">Вывести средства</button>
                </div>
            </div>
        </div>

        <button class="btn btn-danger" style="width: 100%; margin-top: 1rem;" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> Выйти
        </button>
    `;

    window.showProfileTab = (tab) => {
        const contents = document.querySelectorAll('#profileContent .tab-content');
        const buttons = document.querySelectorAll('.tabs .tab-btn');

        contents.forEach(c => c.style.display = 'none');
        buttons.forEach(b => b.classList.remove('active'));

        document.getElementById(`${tab}Tab`).style.display = 'block';
        event.target.classList.add('active');
    };

    window.showProfileEditor = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const boughtItems = currentUser.inventory.map(id => shopItems.find(i => i.id === id)).filter(i => i);
        const boughtAvatars = boughtItems.filter(i => i.type === 'avatar');
        const boughtBackgrounds = boughtItems.filter(i => i.type === 'background');

        const allAvatars = [...boughtAvatars, ...unlockedRewards.filter(r => r[1].type === 'avatar').map(([_, r]) => ({ id: r.id, name: r.name, type: 'avatar', value: r.url }))];
        const allBackgrounds = [...boughtBackgrounds, ...unlockedRewards.filter(r => r[1].type === 'background').map(([_, r]) => ({ id: r.id, name: r.name, type: 'background', value: r.url }))];

        modal.innerHTML = `
            <div class="modal-card" style="max-width: 500px;">
                <h3 class="mb-1">Настройка профиля</h3>
                
                <h4>Аватары (${allAvatars.length})</h4>
                <div class="grid-3 mb-1">
                    ${allAvatars.map(av => `
                        <div class="reward-item ${currentUser.avatar === av.value ? 'selected' : ''}" 
                             onclick="equipProfileItem('avatar', '${av.id}', '${av.value}')">
                            <img src="${av.value}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                            <span style="font-size: 0.8rem;">${av.name}</span>
                        </div>
                    `).join('')}
                </div>
                
                <h4>Фоны (${allBackgrounds.length})</h4>
                <div class="grid-2 mb-1">
                    ${allBackgrounds.map(bg => `
                        <div class="reward-item ${currentUser.background === bg.value ? 'selected' : ''}" 
                             onclick="equipProfileItem('background', '${bg.id}', '${bg.value}')">
                            <div style="width: 100%; height: 80px; background-image: url(${bg.value}); background-size: cover; border-radius: 8px; margin-bottom: 0.5rem;"></div>
                            <span style="font-size: 0.8rem;">${bg.name}</span>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn btn-outline" style="width: 100%; margin-top: 1rem;" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);
    };

    window.equipProfileItem = (type, itemId, itemUrl) => {
        if (type === 'avatar') {
            currentUser.avatar = itemUrl;
        } else if (type === 'background') {
            currentUser.background = itemUrl;
        }

        const dbU = allUsers.find(u => u.id === currentUser.id);
        if (dbU) {
            dbU[type] = itemUrl;
        }
        save('ekb_users', allUsers);

        renderProfile();
        showToast('Профиль обновлён!', '✨');
    };

    window.showWithdrawModal = () => {
        if (currentUser.points < 100) return showToast('Минимум 100 монет для вывода', '❌');

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-card">
                <h3 class="mb-1">Вывод средств</h3>
                <p class="text-muted mb-1">Вывод ${currentUser.points} монет = ${(currentUser.points * 10).toLocaleString()} ₸</p>
                <input type="text" id="cardNumber" placeholder="Номер карты Visa/Mastercard" style="margin-bottom: 0.75rem;">
                <div class="grid-2">
                    <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    <button class="btn btn-success" id="confirmWithdrawBtn">Вывести</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#confirmWithdrawBtn').onclick = () => {
            const card = modal.querySelector('#cardNumber').value.trim();
            if (!card || card.length < 16) return showToast('Введите корректный номер карты', '❌');

            const amount = currentUser.points;
            currentUser.points = 0;
            const dbU = allUsers.find(u => u.id === currentUser.id);
            if (dbU) dbU.points = 0;
            save('ekb_users', allUsers);

            showToast(`Вывод ${amount * 10}₸ выполнен!`, '💰');
            modal.remove();
            renderProfile();
        };
    };
}

function renderMod() {
    if (!currentUser || currentUser.role !== 'moderator') return;
    const root = document.getElementById('appRoot');

    const pendingSubs = submissions.filter(s => s.status === 'pending');
    const pendingQuests = quests.filter(q => q.status === 'pending');

    root.innerHTML = `
                <h2><i class="fas fa-shield-alt"></i> Панель Модератора</h2>
                
                <div class="card">
                    <h3>📋 Заявки на выполнение (${pendingSubs.length})</h3>
                    ${pendingSubs.length === 0 ?
            '<p class="text-muted">Нет заявок на проверку.</p>' :
            pendingSubs.map(sub => {
                const q = quests.find(x => x.id === sub.questId);
                return `
                                <div class="list-item" style="margin-top: 1rem;">
                                    <div class="flex-between mb-1">
                                        <b>👤 ${sub.userName}</b>
                                        <span class="badge">Квест: ${q?.title || 'Удален'}</span>
                                    </div>
                                    <p class="mb-1"><i>"${sub.comment}"</i></p>
                                    <div class="grid-2">
                                        <button class="btn btn-primary" onclick="resolveSub('${sub.id}', true)">
                                            <i class="fas fa-check"></i> Одобрить
                                        </button>
                                        <button class="btn btn-outline" style="color: var(--danger); border-color: var(--danger);" 
                                                onclick="resolveSub('${sub.id}', false)">
                                            <i class="fas fa-times"></i> Отклонить
                                        </button>
                                    </div>
                                </div>
                            `;
            }).join('')
        }
                </div>

                <div class="card">
                    <h3>🆕 Новые квесты на модерацию (${pendingQuests.length})</h3>
                    ${pendingQuests.length === 0 ?
            '<p class="text-muted">Нет новых квестов.</p>' :
            pendingQuests.map(q => `
                            <div class="list-item" style="margin-top: 1rem;">
                                <h4>${q.title}</h4>
                                <p class="text-muted">${q.description}</p>
                                <p class="text-muted" style="font-size: 0.85rem;">
                                    <i class="fas fa-map-marker-alt"></i> ${q.address}
                                </p>
                                <div style="display: flex; gap: 8px; margin: 8px 0;">
                                    <span class="badge">XP: ${q.xpReward}</span>
                                    <span class="badge">🪙: ${q.coinReward}</span>
                                </div>
                                <div class="grid-2">
                                    <button class="btn btn-primary" onclick="approveQuest('${q.id}')">
                                        <i class="fas fa-check"></i> Одобрить
                                    </button>
                                    <button class="btn btn-outline" onclick="editQuest('${q.id}')">
                                        <i class="fas fa-edit"></i> Изменить
                                    </button>
                                </div>
                            </div>
                        `).join('')
        }
                </div>
            `;
}

// ==========================================
// ЛОГИКА ДЕЙСТВИЙ
// ==========================================
function buyItem(id) {
    const item = shopItems.find(i => i.id === id);
    if (!item) return;
    if (currentUser.points < item.price) return showToast('Недостаточно монет!', '💸');

    currentUser.points -= item.price;

    if (item.type === 'boost') {
        if (!currentUser.activeBoosts) currentUser.activeBoosts = [];
        currentUser.activeBoosts.push({ type: item.value, expires: Date.now() + 86400000 });
        showToast(`Буст ${item.name} активирован!`, '⚡');
    } else {
        if (currentUser.inventory.includes(id)) return showToast('Уже куплено', '⚠️');
        currentUser.inventory.push(id);
        equipItem(id);
        showToast('Покупка успешна!', '🛍️');
    }

    syncCurrentUser();
    renderShop();
}

function equipItem(id) {
    const item = shopItems.find(i => i.id === id);
    if (!item) return;
    if (item.type === 'avatar') currentUser.avatar = item.value;
    if (item.type === 'background') currentUser.background = item.value;
    if (item.type === 'frame') currentUser.frame = item.value;
    syncCurrentUser();
    renderShop();
    if (mapInstance) refreshMapMarkers();
    showToast('Экипировано', '✨');
}

function showBuyCoinsModal() {
    if (!currentUser) return showToast('Сначала войдите', '❌');
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="modal-card">
                    <h3 class="mb-1">Пополнить монеты</h3>
                    <p class="text-muted mb-1">Выберите пакет монет.</p>
                    <div style="margin-bottom: 1rem;">
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;" onclick="buyCoins(100, 1000)">100 🪙 за 1000₸</button>
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;" onclick="buyCoins(200, 2000)">200 🪙 за 2000₸</button>
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.5rem;" onclick="buyCoins(1000, 10000)">1000 🪙 за 10000₸</button>
                    </div>
                    <input type="text" id="cardNumber" placeholder="Номер карты Visa (пример: 4111 1111 1111 1111)" style="margin-bottom: 0.75rem;">
                    <div class="grid-2">
                        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-success" id="confirmBuyBtn">Купить</button>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmBuyBtn').onclick = () => {
        const card = modal.querySelector('#cardNumber').value.trim();
        if (!card) return showToast('Введите номер карты', '⚠️');
        // Имитация, не сохраняем данные
        showToast('Покупка имитирована, монеты добавлены', '💰');
        document.querySelector('.modal-overlay').remove();
    };
}

function buyCoins(amount, price) {
    if (!currentUser) return;
    currentUser.points += amount;
    syncCurrentUser();
    showToast(`Получено ${amount} 🪙`, '💰');
    document.querySelector('.modal-overlay').remove();
    renderCurrentPage();
}

function syncCurrentUser() {
    const dbU = allUsers.find(u => u.id === currentUser.id);
    if (dbU) {
        Object.assign(dbU, currentUser);
        save('ekb_users', allUsers);
    }
}

window.openQuestSubmit = (qId) => {
    if (!currentUser) return showToast('Сначала войдите', '❌');
    const q = quests.find(x => x.id === qId);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="modal-card">
                    <h3 class="mb-1">${q.title}</h3>
                    <p class="text-muted mb-1">Опиши выполнение задания</p>
                    <textarea id="subComment" rows="3" maxlength="220" placeholder="Я убрал весь мусор..."></textarea>
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin: 0.75rem 0;">
                        <button class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('subPhoto').click()">
                            <i class="fas fa-camera"></i> Добавить фото
                        </button>
                        <span id="subPhotoLabel" class="text-muted" style="font-size:0.85rem;">Фото не выбрано</span>
                    </div>
                    <input type="file" id="subPhoto" accept="image/*" style="display:none;">
                    <div id="subPhotoPreview" style="display:none; margin-bottom: 0.75rem;"></div>
                    <div class="grid-2">
                        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-primary" id="sendSubBtn">Отправить</button>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);

    const photoInput = modal.querySelector('#subPhoto');
    const photoLabel = modal.querySelector('#subPhotoLabel');
    const photoPreview = modal.querySelector('#subPhotoPreview');

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) {
            photoLabel.textContent = 'Фото не выбрано';
            photoPreview.style.display = 'none';
            photoPreview.innerHTML = '';
            return;
        }
        photoLabel.textContent = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            photoPreview.style.display = 'block';
            photoPreview.innerHTML = `<img src="${reader.result}" alt="Фото" style="width:100%; border-radius: 12px; max-height: 120px; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    });

    modal.querySelector('#sendSubBtn').onclick = () => {
        const comment = modal.querySelector('#subComment').value.trim();
        if (!comment) return showToast('Добавь описание!', '⚠️');

        const file = photoInput.files[0];
        const sendSubmission = (photoData) => {
            submissions.push({
                id: 'sub_' + Date.now(),
                questId: qId,
                userId: currentUser.id,
                userName: currentUser.name,
                comment,
                photo: photoData || '',
                status: 'pending',
                time: Date.now()
            });
            save('ekb_submissions', submissions);
            showToast('Отправлено на проверку', '✅');
            modal.remove();
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = () => sendSubmission(reader.result);
            reader.readAsDataURL(file);
        } else {
            sendSubmission('');
        }
    };
}

window.resolveSub = (subId, isApproved) => {
    const sub = submissions.find(s => s.id === subId);
    if (!sub) return;

    sub.status = isApproved ? 'approved' : 'rejected';
    save('ekb_submissions', submissions);

    if (isApproved) {
        const q = quests.find(x => x.id === sub.questId);
        if (q) {
            addRewards(sub.userId, q.xpReward, q.coinReward);
            const u = allUsers.find(user => user.id === sub.userId);
            if (u) {
                if (!u.completedQuests) u.completedQuests = [];
                u.completedQuests.push(q.id);
                save('ekb_users', allUsers);
            }

            // Удаляем квест после одобрения
            const questIndex = quests.findIndex(x => x.id === sub.questId);
            if (questIndex !== -1) {
                quests.splice(questIndex, 1);
                save('ekb_quests', quests);
                showToast('Квест выполнен и удалён с карты!', '🗑️');
            }

            // Обновляем карту если она открыта
            if (currentPage === 'map' && mapInstance) {
                refreshMapMarkers();
            }
        }
    }
    showToast(isApproved ? 'Одобрено' : 'Отклонено');
    renderMod();

    // Если модератор одобрил и мы на странице карты - обновляем
    if (currentPage === 'map') {
        renderMap();
    }
};

window.createNewQuest = () => {
    newQuestLocation = null;
    if (newQuestTempMarker) {
        if (markersLayer) markersLayer.removeLayer(newQuestTempMarker);
        newQuestTempMarker = null;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="modal-card" style="max-width: 600px;">
                    <h3 class="mb-1">Создать новый квест</h3>
                    <input type="text" id="questTitle" maxlength="50" placeholder="Название квеста (до 50 символов)">
                    <textarea id="questDesc" rows="3" maxlength="220" placeholder="Описание задания (до 220 символов)"></textarea>
                    <input type="file" id="questImage" style="file-upload-box" accept="image/*" style="margin-bottom: 0.75rem;">
                    <div id="questImagePreview" style="display:none; margin-bottom: 0.75rem;"></div>
                    <div id="selectedLocationInfo" class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.5rem;">Выберите адрес или место на карте.</div>
                    <button class="btn btn-secondary mb-1" id="pickQuestLocationBtn" style="width: 100%;">Выбрать место на карте</button>
                    <div id="questMapContainer" style="display: none; height: 300px; border-radius: 12px; margin-bottom: 0.75rem;"></div>
                    <select id="questAddress">
                        <option value="">Выберите адрес</option>
                        ${EKIBASTUZ_ADDRESSES.map(addr =>
        `<option value="${addr.name}|${addr.lat}|${addr.lng}">${addr.name}</option>`
    ).join('')}
                    </select>
                    <div class="grid-2">
                        <input type="number" id="questCoins" placeholder="Награда монет" value="50">
                    </div>
                    <label style="display: flex; align-items: center; gap: 8px; margin: 1rem 0;">
                        <input type="checkbox" id="questUrgent">
                        <span>Срочный квест</span>
                    </label>
                    <div class="grid-2">
                        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-primary" onclick="saveNewQuest()">Сохранить</button>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);

    const questImageInput = modal.querySelector('#questImage');
    const questImagePreview = modal.querySelector('#questImagePreview');

    questImageInput.addEventListener('change', () => {
        const file = questImageInput.files[0];
        if (!file) {
            questImagePreview.style.display = 'none';
            questImagePreview.innerHTML = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            questImagePreview.style.display = 'block';
            questImagePreview.innerHTML = `<img src="${reader.result}" alt="Фото квеста" style="width:100%; border-radius: 12px; max-height: 120px; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
    });

    let questMap = null;
    let questMarkersLayer = null;

    modal.querySelector('#pickQuestLocationBtn').onclick = () => {
        const mapContainer = modal.querySelector('#questMapContainer');
        if (mapContainer.style.display === 'none') {
            mapContainer.style.display = 'block';
            questMap = L.map('questMapContainer').setView(EKIBASTUZ_COORDS, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(questMap);
            questMarkersLayer = L.layerGroup().addTo(questMap);
            showToast('Кликните на карту, чтобы выбрать место', '📍');
            questMap.on('click', event => {
                newQuestLocation = event.latlng;
                if (newQuestTempMarker) questMarkersLayer.removeLayer(newQuestTempMarker);
                newQuestTempMarker = L.marker(event.latlng, {
                    icon: L.divIcon({
                        html: '<div class="quest-marker normal"></div>',
                        className: '',
                        iconSize: [42, 42],
                        iconAnchor: [21, 42]
                    })
                }).addTo(questMarkersLayer);
                modal.querySelector('#selectedLocationInfo').textContent = `Выбрано место: ${event.latlng.lat.toFixed(5)}, ${event.latlng.lng.toFixed(5)}`;
                mapContainer.style.display = 'none';
                questMap.remove();
                questMap = null;
            });
        } else {
            mapContainer.style.display = 'none';
            if (questMap) questMap.remove();
            questMap = null;
        }
    };
};

window.saveNewQuest = () => {
    const title = document.getElementById('questTitle').value.trim();
    const desc = document.getElementById('questDesc').value.trim();
    const addressData = document.getElementById('questAddress').value;
    const imageFile = document.getElementById('questImage').files[0];

    if (!title || !desc || (!addressData && !newQuestLocation)) {
        showToast('Заполните название, описание и место', '⚠️');
        return;
    }

    const finalTitle = title.slice(0, 50);
    const finalDesc = desc.slice(0, 220);

    // ФИКСИРОВАННАЯ НАГРАДА (только модератор сможет менять потом)
    const xp = 100;
    const coins = 50;
    const isUrgent = document.getElementById('questUrgent').checked;

    // Полная стоимость создания квеста
    const cost = 200; // Фиксированная цена за создание квеста

    if (currentUser.points < cost) {
        showToast(`Недостаточно монет для создания квеста — ${cost} 🪙`, '💸');
        return;
    }

    const createQuest = (imageData) => {
        let lat, lng, address;
        if (newQuestLocation) {
            lat = newQuestLocation.lat;
            lng = newQuestLocation.lng;
            address = 'Метка на карте';
        } else {
            [address, lat, lng] = addressData.split('|');
            lat = parseFloat(lat);
            lng = parseFloat(lng);
        }

        // СПИСЫВАЕМ ПОЛНУЮ СТОИМОСТЬ
        currentUser.points -= cost;
        syncCurrentUser();

        quests.push({
            id: 'q_' + Date.now(),
            title: finalTitle,
            description: finalDesc,
            xpReward: xp,
            coinReward: coins,
            lat,
            lng,
            address,
            creatorId: currentUser.id,
            status: 'pending', // На модерацию
            isUrgent,
            image: imageData || ''
        });

        save('ekb_quests', quests);
        showToast(`Квест создан за ${cost} 🪙 и отправлен на модерацию`, '✅');
        document.querySelector('.modal-overlay').remove();
        renderMap();
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => createQuest(reader.result);
        reader.readAsDataURL(imageFile);
    } else {
        createQuest('');
    }
};

window.approveQuest = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    // Модалка для модератора, где он может изменить награду
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3 class="mb-1">Одобрение квеста</h3>
            <p class="text-muted mb-1">${quest.title}</p>
            <label>Награда XP:</label>
            <input type="number" id="editXP" value="${quest.xpReward}" min="50" max="1000">
            <label>Награда монет:</label>
            <input type="number" id="editCoins" value="${quest.coinReward}" min="20" max="500">
            <div class="grid-2 mt-1">
                <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                <button class="btn btn-primary" id="confirmApproveBtn">Одобрить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#confirmApproveBtn').onclick = () => {
        const newXP = parseInt(modal.querySelector('#editXP').value) || quest.xpReward;
        const newCoins = parseInt(modal.querySelector('#editCoins').value) || quest.coinReward;

        quest.xpReward = newXP;
        quest.coinReward = newCoins;
        quest.status = 'active';
        save('ekb_quests', quests);

        showToast('Квест одобрен и появился на карте!', '✅');
        modal.remove();
        renderMod();

        if (currentPage === 'map' && mapInstance) {
            refreshMapMarkers();
        }
    };
};

window.editQuest = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="modal-card">
                    <h3 class="mb-1">Редактировать квест</h3>
                    <input type="text" id="editTitle" value="${quest.title}" placeholder="Название">
                    <textarea id="editDesc" rows="3" placeholder="Описание">${quest.description}</textarea>
                    <div class="grid-2">
                        <input type="number" id="editXP" value="${quest.xpReward}" placeholder="Награда XP">
                        <input type="number" id="editCoins" value="${quest.coinReward}" placeholder="Награда монет">
                    </div>
                    <div class="grid-2">
                        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-primary" onclick="saveEditedQuest('${questId}')">Сохранить</button>
                    </div>
                </div>
            `;
    document.body.appendChild(modal);
};

window.saveEditedQuest = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        quest.title = document.getElementById('editTitle').value;
        quest.description = document.getElementById('editDesc').value;
        quest.xpReward = parseInt(document.getElementById('editXP').value) || 100;
        quest.coinReward = parseInt(document.getElementById('editCoins').value) || 50;

        save('ekb_quests', quests);
        showToast('Изменения сохранены', '✅');
        document.querySelector('.modal-overlay').remove();
        renderMod();
    }
};

// ==========================================
// АВТОРИЗАЦИЯ
// ==========================================
function showAuthWall() {
    const root = document.getElementById('appRoot');
    root.innerHTML = `
                <div class="card text-center" style="margin-top: 2rem; padding: 3rem 1rem;">
                    <div class="avatar-lg mb-1">
                        <img src="https://picsum.photos/seed/guest/100/100" alt="Гость">
                    </div>
                    <h2>Добро пожаловать в ECO JuniorCode</h2>
                    <p class="text-muted mb-1">Войдите, чтобы выполнять квесты и получать награды</p>
                    <button class="btn btn-primary" onclick="showLoginModal()">
                        <i class="fas fa-sign-in-alt"></i> Войти / Регистрация
                    </button>
                </div>
            `;
}

window.showLoginModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
                <div class="modal-card" style="max-width: 400px;">
                    <div class="tabs" style="margin-bottom: 1.5rem;">
                        <button class="tab-btn active" id="loginTab" onclick="switchAuthTab('login')">Вход</button>
                        <button class="tab-btn" id="registerTab" onclick="switchAuthTab('register')">Регистрация</button>
                    </div>
                    
                    <div id="loginForm">
                        <h2 class="mb-1 text-center">Вход в систему</h2>
                        <input type="text" id="authLogin" maxlength="32" placeholder="Логин или Email">
                        <input type="password" id="authPass" maxlength="32" placeholder="Пароль">
                        <button class="btn btn-primary mb-1" style="width: 100%;" id="authBtn">Войти</button>
                    </div>
                    
                    <div id="registerForm" style="display: none;">
                        <h2 class="mb-1 text-center">Регистрация</h2>
                        <input type="text" id="regName" maxlength="32" placeholder="Имя">
                        <input type="email" id="regEmail" maxlength="32" placeholder="Email (@mai.ru)">
                        <input type="password" id="regPass" maxlength="32" placeholder="Пароль">
                        <input type="password" id="regPassConfirm" maxlength="32" placeholder="Подтвердите пароль">
                        <button class="btn btn-success mb-1" style="width: 100%;" id="regBtn">Зарегистрироваться</button>
                    </div>
                    
                    <div class="text-center text-muted" style="font-size: 0.8rem;">
                        Модератор: moderationforsitebeta67 / 12345676767aoao
                    </div>
                </div>
            `;
    document.body.appendChild(modal);

    window.switchAuthTab = (tab) => {
        const loginForm = modal.querySelector('#loginForm');
        const registerForm = modal.querySelector('#registerForm');
        const loginTab = modal.querySelector('#loginTab');
        const registerTab = modal.querySelector('#registerTab');

        if (tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    };

    modal.querySelector('#authBtn').onclick = () => {
        modal.querySelector('#authBtn').onclick = () => {
            const l = modal.querySelector('#authLogin').value.trim();
            const p = modal.querySelector('#authPass').value.trim();
            if (!l || !p) return showToast('Заполните поля');

            let user = allUsers.find(u => (u.login === l || u.email === l) && u.password === p);

            if (!user) {
                return showToast('Неверный логин или пароль', '❌');
            } else {
                user.isOnline = true;
                saveUserSession(user); // ← ДОБАВЬ ЭТУ СТРОКУ
                showToast('Успешный вход!', '🔓');
            }

            currentUser = user;
            updateNavForRole();
            modal.remove();

            if (mapInstance) {
                mapInstance.setView([currentUser.location.lat, currentUser.location.lng], 14);
                refreshMapMarkers();
            }
            renderCurrentPage();
        };
        const l = modal.querySelector('#authLogin').value.trim();
        const p = modal.querySelector('#authPass').value.trim();
        if (!l || !p) return showToast('Заполните поля');

        let user = allUsers.find(u => (u.login === l || u.email === l) && u.password === p);

        if (!user) {
            return showToast('Неверный логин или пароль', '❌');
        } else {
            user.isOnline = true;
            showToast('Успешный вход!', '🔓');
        }

        currentUser = user;
        updateNavForRole();
        modal.remove();

        if (mapInstance) {
            mapInstance.setView([currentUser.location.lat, currentUser.location.lng], 14);
            refreshMapMarkers();
        }
        renderCurrentPage();
    };

    modal.querySelector('#regBtn').onclick = () => {
        modal.querySelector('#regBtn').onclick = () => {
            const name = modal.querySelector('#regName').value.trim();
            const email = modal.querySelector('#regEmail').value.trim();
            const pass = modal.querySelector('#regPass').value.trim();
            const passConfirm = modal.querySelector('#regPassConfirm').value.trim();

            if (!name || !email || !pass || !passConfirm) return showToast('Заполните все поля', '❌');
            if (pass !== passConfirm) return showToast('Пароли не совпадают', '❌');
            if (!email.includes('@mai.ru')) return showToast('Email должен быть @mai.ru', '❌');
            if (allUsers.find(u => u.email === email)) return showToast('Email уже зарегистрирован', '❌');

            const user = {
                id: 'u_' + Date.now(),
                name: name,
                email: email,
                login: email,
                password: pass,
                points: 50,
                xp: 0,
                level: 1,
                avatar: 'texture/avv1.jfif',
                background: '',
                completedQuests: [],
                location: EKIBASTUZ_COORDS,
                role: 'user',
                inventory: [],
                activeBoosts: [],
                frame: '',
                isOnline: true
            };
            allUsers.push(user);
            save('ekb_users', allUsers);
            saveUserSession(user); // ← ДОБАВЬ ЭТУ СТРОКУ
            showToast('Аккаунт создан!', '🎉');

            currentUser = user;
            updateNavForRole();
            modal.remove();

            if (mapInstance) {
                mapInstance.setView([currentUser.location.lat, currentUser.location.lng], 14);
                refreshMapMarkers();
            }
            renderCurrentPage();
        };
        const name = modal.querySelector('#regName').value.trim();
        const email = modal.querySelector('#regEmail').value.trim();
        const pass = modal.querySelector('#regPass').value.trim();
        const passConfirm = modal.querySelector('#regPassConfirm').value.trim();

        if (!name || !email || !pass || !passConfirm) return showToast('Заполните все поля', '❌');
        if (pass !== passConfirm) return showToast('Пароли не совпадают', '❌');
        if (!email.includes('@mai.ru')) return showToast('Email должен быть @mai.ru', '❌');
        if (allUsers.find(u => u.email === email)) return showToast('Email уже зарегистрирован', '❌');

        const user = {
            id: 'u_' + Date.now(),
            name: name,
            email: email,
            login: email,
            password: pass,
            points: 50,
            xp: 0,
            level: 1,
            avatar: `https://picsum.photos/seed/${email}/100/100`,
            background: '',
            completedQuests: [],
            location: EKIBASTUZ_COORDS,
            role: 'user',
            inventory: [],
            activeBoosts: [],
            frame: '',
            isOnline: true
        };
        allUsers.push(user);
        save('ekb_users', allUsers);
        showToast('Аккаунт создан!', '🎉');

        currentUser = user;
        updateNavForRole();
        modal.remove();

        if (mapInstance) {
            mapInstance.setView([currentUser.location.lat, currentUser.location.lng], 14);
            refreshMapMarkers();
        }
        renderCurrentPage();
    };
}

window.logout = () => {
    if (currentUser) {
        currentUser.isOnline = false;
        const dbU = allUsers.find(u => u.id === currentUser.id);
        if (dbU) dbU.isOnline = false;
        save('ekb_users', allUsers);
        clearUserSession(); // ← ДОБАВЬ ЭТУ СТРОКУ
    }

    currentUser = null;
    updateNavForRole();
    currentPage = 'map';
    updateNavUI();
    renderCurrentPage();
    showToast('Вы вышли из аккаунта', '👋');
};

// ==========================================
// НАВИГАЦИЯ
// ==========================================
function updateNavForRole() {
    const nav = document.getElementById('bottomNav');
    const modBtn = nav.querySelector('[data-page="mod"]');

    if (currentUser?.role === 'moderator') {
        if (!modBtn) {
            const btn = document.createElement('button');
            btn.className = 'bottom-nav-btn';
            btn.dataset.page = 'mod';
            btn.innerHTML = '<i class="fas fa-shield-alt"></i><span>Модер.</span>';
            btn.onclick = () => navigateTo('mod');
            nav.appendChild(btn);
        }
    } else {
        if (modBtn) modBtn.remove();
    }
}

function updateNavUI() {
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        if (btn.dataset.page === currentPage) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function navigateTo(page) {
    currentPage = page;
    updateNavUI();
    renderCurrentPage();
}

function renderCurrentPage() {
    const root = document.getElementById('appRoot');
    root.style.animation = 'none';
    root.offsetHeight;
    root.style.animation = 'fadeIn 0.3s ease';

    if (currentPage === 'map') renderMap();
    else if (currentPage === 'quests') renderQuests();
    else if (currentPage === 'donations') renderDonations();
    else if (currentPage === 'shop') renderShop();
    else if (currentPage === 'profile') renderProfile();
    else if (currentPage === 'mod') renderMod();
}

// Биндинг навигации
document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

window.onload = () => {
    initData();

    // Загружаем сохранённого пользователя
    const savedUser = loadUserSession();
    if (savedUser) {
        currentUser = savedUser;
        updateNavForRole();
        showToast('Добро пожаловать обратно, ' + currentUser.name + '!', '👋');
    }

    simulateOnlineUsers();
    renderCurrentPage();

    setTimeout(() => {
        showToast('Добро пожаловать в ECO JuniorCode! 🌱', '🏙️');
    }, 1000);
};
