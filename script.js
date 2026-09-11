// ============================================================
// Whisper — script.js
// Part 1: helpers, config, state, i18n, utils, modals, theme, auth, crop
// ============================================================

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const on = (sel, evt, fn) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.addEventListener(evt, fn);
    return el;
};

const firebaseConfig = {
    apiKey: "AIzaSyB_J_H7sLMSiknI7ukqtYPvd6F9pz0wnkY",
    authDomain: "chatapp-8ecb0.firebaseapp.com",
    databaseURL: "https://chatapp-8ecb0-default-rtdb.firebaseio.com/",
    projectId: "chatapp-8ecb0",
    storageBucket: "chatapp-8ecb0.firebasestorage.app",
    messagingSenderId: "393002965681",
    appId: "1:393002965681:web:fa6ad2bac0850f915090",
    measurementId: "G-BM0XDEMFC3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const usersRef = db.ref('users');
const friendRequestsRef = db.ref('friendRequests');
const friendsRef = db.ref('friends');
const dmsRef = db.ref('dms');
const groupsRef = db.ref('groups');
const presenceRef = db.ref('presence');
const typingRef = db.ref('typing');
const unreadRef = db.ref('unread');
const mutedRef = db.ref('muted');
const pinnedRef = db.ref('pinned');
const draftsRef = db.ref('drafts');
const reactionsRef = db.ref('reactions');
const nicknamesRef = db.ref('nicknames');
const blockedRef = db.ref('blocked');
const reportsRef = db.ref('reports');
const deletedRef = db.ref('deleted');
const typingPreviewRef = db.ref('typingPreview');
const favoritesRef = db.ref('favorites');

// STATE
let currentUser = null;
let username = '';
let displayName = '';
let userId = '';
let currentProfile = null;
let currentDmUser = null;
let currentGroup = null;
let currentProfileViewUid = null;
let currentLanguage = 'en';

let friends = [];
let friendsData = {};
let nicknames = {};
let blockedUsers = {};
let favoriteUsers = {};
let pendingRequests = [];
let onlineUsers = {};
let unreadCounts = {};
let userGroups = {};
let groupsData = {};
let mutedChats = {};
let pinnedChats = {};
let lastMessages = {};
let isLoggedIn = false;
let isInitializing = false;
let notifSoundEnabled = true;
let typingEnabled = true;
let dateSeparatorsEnabled = true;
let reactionsEnabled = true;
let enterToSend = true;

let pendingFile = null;
let pendingType = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;
let isRecording = false;
let recordingTarget = null;

let groupPendingFile = null;
let groupPendingType = null;

let editState = { avatar: '', banner: '' };
let groupEditPhoto = null;
let dmLastMsgs = [];
let groupLastMsgs = [];

let dmReplyTo = null;
let groupReplyTo = null;
let dmEditingId = null;
let groupEditingId = null;

let _lastPresenceHash = '';
let _lastUnreadHash = '';
let _lastRailHash = '';
let _lastFriendsHash = '';
let _lastMutedHash = '';
let _lastPinnedHash = '';
let _lastFavoritesHash = '';
const _lastMsgListeners = {};
let _sendingFriendRequest = false;
let _contextMenuTarget = null;
let _contextMenuType = null;

let dmReactions = {};
let groupReactions = {};
let currentReactionMsgEl = null;

let deletedConversations = {};
let typingPreviewState = {};
let deletedDms = {};

// ============================================================
// I18N
// ============================================================
const TRANSLATIONS = {
    en: {
        tagline: 'A quiet place to talk.', logIn: 'Log In', logOut: 'Log Out', createAccount: 'Create Account',
        loginBtn: 'Log In', signupBtn: 'Create Account', forgotBtn: 'Send Reset Link',
        forgotPassword: 'Forgot password?', createAccountLink: 'Create account',
        backToLogin: 'Back to login', haveAccount: 'Already have an account? Log in',
        friends: 'Friends', conversations: 'Conversations', noConversations: 'No conversations yet',
        searchConversations: 'Search conversations...', online: 'Online', all: 'All', pending: 'Pending', addFriend: 'Add Friend',
        addAFriend: 'Add a friend', addFriendDesc: 'Search by username. Usernames are lowercase and unique.',
        sendRequest: 'Send Request', writeMessage: 'Write a message...', searchMessages: 'Search messages...',
        account: 'Account', notifications: 'Notifications', language: 'Language',
        blocked: 'Blocked', recentlyDeleted: 'Recently Deleted', about: 'About',
        displayName: 'Display Name', username: 'Username', email: 'Email', bio: 'Bio',
        edit: 'Edit', export: 'Export', clear: 'Clear', delete: 'Delete',
        save: 'Save', cancel: 'Cancel', ok: 'OK', close: 'Close', confirm: 'Confirm',
        myProfile: 'My Profile', darkMode: 'Dark Mode', lightMode: 'Light Mode',
        message: 'Message', addToFavorites: 'Add to favorites',
        removeFromFavorites: 'Remove from favorites', unfriend: 'Unfriend',
        editProfile: 'Edit Profile', joined: 'Joined',
        newGroup: 'New Group', groupName: 'Group name', members: 'Members',
        create: 'Create', nameYourGroup: 'Name your group', pickFriends: 'Pick friends to include',
        viewProfile: 'View Profile', markAsRead: 'Mark as read', pin: 'Pin', mute: 'Mute',
        removeFriend: 'Remove friend', deleteConversation: 'Delete conversation',
        searchInChat: 'Search in chat', viewFullProfile: 'View full profile',
        blockUser: 'Block user', unblockUser: 'Unblock user',
        reportUser: 'Report user', copyUsername: 'Copy username',
        exportMyData: 'Export my data', exportDesc: 'Download a JSON copy of your profile',
        clearAllDrafts: 'Clear all drafts', clearDraftsDesc: 'Remove saved unsent messages',
        dangerZone: 'Danger Zone', deleteAccount: 'Delete account',
        deleteAccountDesc: 'Permanently remove your account and data',
        messageSounds: 'Message sounds', messageSoundsDesc: 'Play a sound on new messages',
        typingIndicators: 'Typing indicators', typingDesc: 'Show when someone is typing',
        messageReactions: 'Message reactions', reactionsDesc: 'Show reaction options on hover',
        enterToSend: 'Enter to send', enterDesc: 'Enter sends, Shift+Enter = new line',
        compactMode: 'Compact mode', compactDesc: 'Tighter spacing',
        dateSeparators: 'Date separators', dateSepDesc: 'Show "Today" / "Yesterday"',
        interfaceLanguage: 'Interface language', pickLanguage: 'Pick how Whisper looks and reads',
        blockedUsers: 'Blocked Users', blockedDesc: "Users you've blocked can't message you or see your profile.",
        deletedDesc: 'Deleted conversations are kept for 30 days. Restore them or delete permanently.',
        aboutDesc: 'A quiet chat app. No noise, no glow, just conversations.',
        profile: 'Profile', options: 'Options', nickname: 'Nickname', nicknameDesc: 'Only you will see this',
        disappearingMessages: 'Disappearing messages', privacySafety: 'Privacy & safety', manageSafety: 'Manage your safety',
        nothingHere: 'Nothing here yet', welcomeDesc: 'Find a friend by their username to start a quiet conversation.',
        changeBanner: 'Change banner', changeGroupPhoto: 'Change group photo',
        addMembers: 'Add Members', add: 'Add', private: 'Private',
        adjustImage: 'Adjust image', adjustPhoto: 'Adjust profile photo', adjustBanner: 'Adjust banner',
        adjustGroupPhoto: 'Adjust group photo',
        dragToReposition: 'Drag to reposition · Pinch or slider to zoom'
    },
    ar: {
        tagline: 'مكان هادئ للحديث.', logIn: 'تسجيل الدخول', logOut: 'تسجيل الخروج', createAccount: 'إنشاء حساب',
        loginBtn: 'تسجيل الدخول', signupBtn: 'إنشاء حساب', forgotBtn: 'إرسال رابط الاستعادة',
        forgotPassword: 'هل نسيت كلمة المرور؟', createAccountLink: 'إنشاء حساب',
        backToLogin: 'العودة لتسجيل الدخول', haveAccount: 'لديك حساب بالفعل؟ تسجيل الدخول',
        friends: 'الأصدقاء', conversations: 'المحادثات', noConversations: 'لا توجد محادثات',
        searchConversations: 'ابحث في المحادثات...', online: 'متصل', all: 'الكل', pending: 'قيد الانتظار', addFriend: 'إضافة صديق',
        addAFriend: 'أضف صديقاً', addFriendDesc: 'ابحث باسم المستخدم.',
        sendRequest: 'إرسال الطلب', writeMessage: 'اكتب رسالة...', searchMessages: 'ابحث في الرسائل...',
        account: 'الحساب', notifications: 'الإشعارات', language: 'اللغة',
        blocked: 'المحظورون', recentlyDeleted: 'المحذوفة حديثاً', about: 'حول',
        displayName: 'الاسم المعروض', username: 'اسم المستخدم', email: 'البريد الإلكتروني', bio: 'نبذة',
        edit: 'تعديل', export: 'تصدير', clear: 'مسح', delete: 'حذف',
        save: 'حفظ', cancel: 'إلغاء', ok: 'موافق', close: 'إغلاق', confirm: 'تأكيد',
        myProfile: 'ملفي الشخصي', darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح',
        message: 'رسالة', addToFavorites: 'إضافة للمفضلة',
        removeFromFavorites: 'إزالة من المفضلة', unfriend: 'إزالة صديق',
        editProfile: 'تعديل الملف', joined: 'انضم',
        newGroup: 'مجموعة جديدة', groupName: 'اسم المجموعة', members: 'الأعضاء',
        create: 'إنشاء', nameYourGroup: 'سمّ مجموعتك', pickFriends: 'اختر أصدقاء',
        viewProfile: 'عرض الملف الشخصي', markAsRead: 'تحديد كمقروء', pin: 'تثبيت', mute: 'كتم',
        removeFriend: 'إزالة صديق', deleteConversation: 'حذف المحادثة',
        searchInChat: 'البحث في المحادثة', viewFullProfile: 'عرض الملف الكامل',
        blockUser: 'حظر المستخدم', unblockUser: 'إلغاء الحظر',
        reportUser: 'الإبلاغ عن المستخدم', copyUsername: 'نسخ اسم المستخدم',
        exportMyData: 'تصدير بياناتي', exportDesc: 'تنزيل نسخة JSON من ملفك',
        clearAllDrafts: 'مسح جميع المسودات', clearDraftsDesc: 'إزالة الرسائل غير المرسلة',
        dangerZone: 'منطقة الخطر', deleteAccount: 'حذف الحساب',
        deleteAccountDesc: 'حذف حسابك وبياناتك نهائياً',
        messageSounds: 'أصوات الرسائل', messageSoundsDesc: 'تشغيل صوت عند وصول رسائل جديدة',
        typingIndicators: 'مؤشرات الكتابة', typingDesc: 'إظهار عندما يكتب شخص ما',
        messageReactions: 'تفاعلات الرسائل', reactionsDesc: 'إظهار خيارات التفاعل',
        enterToSend: 'إرسال بـ Enter', enterDesc: 'Enter للإرسال، Shift+Enter لسطر جديد',
        compactMode: 'الوضع المضغوط', compactDesc: 'مسافات أقل',
        dateSeparators: 'فواصل التواريخ', dateSepDesc: 'عرض "اليوم" / "أمس"',
        interfaceLanguage: 'لغة الواجهة', pickLanguage: 'اختر كيف يبدو Whisper',
        blockedUsers: 'المستخدمون المحظورون', blockedDesc: 'لا يمكن للمحظورين مراسلتك أو رؤية ملفك.',
        deletedDesc: 'تُحفظ المحادثات المحذوفة لمدة 30 يوماً.',
        aboutDesc: 'تطبيق دردشة هادئ. بدون ضوضاء.',
        profile: 'الملف الشخصي', options: 'خيارات', nickname: 'اللقب', nicknameDesc: 'أراك فقط',
        disappearingMessages: 'الرسائل المؤقتة', privacySafety: 'الخصوصية والأمان', manageSafety: 'إدارة الأمان',
        nothingHere: 'لا يوجد شيء بعد', welcomeDesc: 'ابحث عن صديق باسم المستخدم لبدء محادثة.',
        changeBanner: 'تغيير الغلاف', changeGroupPhoto: 'تغيير صورة المجموعة',
        addMembers: 'إضافة أعضاء', add: 'إضافة', private: 'خاص',
        adjustImage: 'ضبط الصورة', adjustPhoto: 'ضبط الصورة الشخصية', adjustBanner: 'ضبط الغلاف',
        adjustGroupPhoto: 'ضبط صورة المجموعة',
        dragToReposition: 'اسحب للتحريك · استخدم المنزلق للتكبير'
    }
};

// Fill remaining languages with English defaults
['fr','es','de','it','pt','ru','zh','ja','ko','tr','nl','pl'].forEach(lang => {
    if (!TRANSLATIONS[lang]) TRANSLATIONS[lang] = Object.assign({}, TRANSLATIONS.en);
});

function t(key) {
    const lang = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    return lang[key] || TRANSLATIONS.en[key] || key;
}

function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = 'en';
    currentLanguage = lang;
    localStorage.setItem('whisper_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', lang === 'ar');

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (key) el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.dataset.i18nTitle;
        if (key) el.title = t(key);
    });

    const sel = document.getElementById('languageSelect');
    if (sel) sel.value = lang;

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.textContent = t('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.textContent = t('signupBtn');
    const forgotBtn = document.getElementById('forgotBtn');
    if (forgotBtn) forgotBtn.textContent = t('forgotBtn');

    const tm = document.getElementById('themeMenuItem');
    if (tm) {
        const span = tm.querySelector('span');
        const isDark = document.body.classList.contains('theme-dark');
        if (span) span.textContent = isDark ? t('lightMode') : t('darkMode');
    }

    if (typeof renderAllFriends === 'function' && friends.length) renderAllFriends();
    if (typeof renderRailDms === 'function' && isLoggedIn) renderRailDms();
}

// ============================================================
// UTILS
// ============================================================
const AVATAR_COLORS = ['#4a8b7a','#3d7a68','#5c9b86','#2f6b5c','#4a7a8b','#3d6a7a','#5c8a9b','#2f5b6b','#7a4a8b','#6b3d7a','#8b5c9b','#5b2f6b'];

function getColor(name) {
    let hash = 0;
    const str = name || '?';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitial(name) {
    if (!name) return '?';
    const arr = Array.from(name);
    return arr[0] ? arr[0].toUpperCase() : '?';
}
function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}
function displayNameFor(uid, fallback) { return nicknames[uid] || fallback || 'Unknown'; }
function formatTime(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function formatDuration(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
}
function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}
function dmKey(a, b) { return [a, b].sort().join('_'); }
function timeAgo(ts) {
    const diff = Date.now() - ts;
    const s = Math.floor(diff / 1000);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    const w = Math.floor(d / 7);
    const mo = Math.floor(d / 30);
    const y = Math.floor(d / 365);
    if (s < 30) return 'just now';
    if (m < 1) return `${s}s ago`;
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    if (w < 5) return `${w}w ago`;
    if (mo < 12) return `${mo}mo ago`;
    return `${y}y ago`;
}
function dateLabel(ts) {
    const d = new Date(ts), today = new Date(), yest = new Date();
    yest.setDate(yest.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function dayKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function shortTime(ts) {
    if (!ts || typeof ts !== 'number' || !isFinite(ts) || isNaN(ts)) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - ts;
    if (diff < 0) return formatTime(ts);
    if (diff < 86400000) return formatTime(ts);
    if (diff < 7 * 86400000) return d.toLocaleDateString(undefined, { weekday: 'short' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function statusLabel(uid) {
    const p = onlineUsers[uid];
    if (!p || !p.online) {
        if (p && p.lastSeen) return `Active ${timeAgo(p.lastSeen)}`;
        return 'Offline';
    }
    return 'Active now';
}
function isUserOnline(uid) { return !!(onlineUsers[uid] && onlineUsers[uid].online); }
function isChatMuted(k) { return !!mutedChats[k]; }
function isChatPinned(k) { return !!pinnedChats[k]; }
function isUserFavorited(uid) { return !!favoriteUsers[uid]; }
function isUserBlocked(uid) { return !!blockedUsers[uid]; }
function generateWaveBars() {
    let html = '';
    for (let i = 0; i < 28; i++) html += `<div class="voice-bar" style="height:${4 + Math.round(Math.random() * 16)}px;"></div>`;
    return html;
}
function previewText(msg) {
    if (!msg) return '';
    if (msg.type === 'image') return '📷 Photo';
    if (msg.type === 'file') return '📎 ' + (msg.fileName || 'File');
    if (msg.type === 'voice') return '🎤 Voice message';
    return msg.text || '';
}

// ============================================================
// TOASTS
// ============================================================
function showToast(title, message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
        <div class="toast-icon"><i class="fas fa-bell"></i></div>
        <div>
            <div class="toast-title">${escapeHtml(title)}</div>
            <div class="toast-message">${escapeHtml(message || '')}</div>
        </div>
    `;
    const tc = document.getElementById('toastContainer');
    if (tc) tc.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
}
function playNotifSound() {
    if (!notifSoundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 660; osc.type = 'sine';
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(); osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
}

// ============================================================
// CUSTOM MODAL
// ============================================================
function showModal(opts) {
    return new Promise(resolve => {
        const overlay = document.getElementById('customModal');
        const box = document.getElementById('customModalBox');
        if (!overlay || !box) { resolve(window.confirm(opts.title || 'Are you sure?')); return; }

        const iconHtml = opts.icon ? `<div class="custom-modal-icon ${opts.danger ? 'danger' : ''}"><i class="${opts.icon}"></i></div>` : '';
        const inputHtml = opts.input ? `<input class="custom-modal-input" id="customModalInput" type="text" placeholder="${escapeHtml(opts.inputPlaceholder || '')}" value="${escapeHtml(opts.inputValue || '')}" />` : '';
        const confirmClass = opts.danger ? 'custom-modal-btn danger' : 'custom-modal-btn primary';
        const confirmText = opts.confirmText || 'OK';
        const cancelHtml = opts.hideCancel ? '' : `<button class="custom-modal-btn secondary" id="customModalCancel">${opts.cancelText || 'Cancel'}</button>`;

        box.innerHTML = `
            ${iconHtml}
            <div class="custom-modal-title">${escapeHtml(opts.title || '')}</div>
            ${opts.text ? `<div class="custom-modal-text">${opts.text}</div>` : ''}
            ${inputHtml}
            <div class="custom-modal-actions">
                ${cancelHtml}
                <button class="${confirmClass}" id="customModalConfirm">${escapeHtml(confirmText)}</button>
            </div>
        `;
        overlay.classList.add('open');
        const input = document.getElementById('customModalInput');
        if (input) setTimeout(() => input.focus(), 100);

        const cleanup = () => { overlay.classList.remove('open'); box.innerHTML = ''; };
        document.getElementById('customModalConfirm').onclick = () => {
            const v = input ? input.value.trim() : true;
            cleanup(); resolve(v);
        };
        const cancelBtn = document.getElementById('customModalCancel');
        if (cancelBtn) cancelBtn.onclick = () => { cleanup(); resolve(false); };
        overlay.onclick = e => { if (e.target === overlay) { cleanup(); resolve(false); } };
        if (input) input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const v = input.value.trim();
                cleanup(); resolve(v);
            }
        });
    });
}

// ============================================================
// THEME
// ============================================================
function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('whisper_theme', theme);
    const tt = document.getElementById('themeToggle');
    if (tt) tt.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    const tm = document.getElementById('themeMenuItem');
    if (tm) {
        const span = tm.querySelector('span');
        if (span) span.textContent = theme === 'dark' ? t('lightMode') : t('darkMode');
        const icon = tm.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}
function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
}
(function initTheme() {
    const saved = localStorage.getItem('whisper_theme') || 'light';
    applyTheme(saved);
})();

// ============================================================
// AUTH FORM UI
// ============================================================
function showAuthMessage(text, type = 'info') {
    const el = document.getElementById('authMessage');
    if (!el) return;
    el.textContent = text;
    el.className = `auth-message ${type}`;
    el.style.display = 'block';
    if (type !== 'error') setTimeout(() => el.style.display = 'none', 6000);
}
function clearAuthMessage() {
    const el = document.getElementById('authMessage');
    if (!el) return;
    el.textContent = ''; el.className = 'auth-message'; el.style.display = 'none';
}
function showLoginForm() {
    document.getElementById('authTitle').textContent = 'Whisper';
    document.getElementById('authSubtitle').textContent = t('tagline');
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
    clearAuthMessage();
}
function showSignupForm() {
    document.getElementById('authTitle').textContent = t('createAccount');
    document.getElementById('authSubtitle').textContent = t('tagline');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'flex';
    document.getElementById('forgotForm').style.display = 'none';
    clearAuthMessage();
}
function showForgotForm() {
    document.getElementById('authTitle').textContent = 'Reset Password';
    document.getElementById('authSubtitle').textContent = t('tagline');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'flex';
    clearAuthMessage();
}

on('#toSignupLink', 'click', e => { e.preventDefault(); showSignupForm(); });
on('#toLoginLink', 'click', e => { e.preventDefault(); showLoginForm(); });
on('#forgotLink', 'click', e => { e.preventDefault(); showForgotForm(); });
on('#backToLoginLink', 'click', e => { e.preventDefault(); showLoginForm(); });

// ============================================================
// CROP MODAL — Simplified bulletproof version
// Uses object-fit:cover on the img; transform for pan/zoom
// ============================================================
let _cropState = {
    img: null,
    naturalW: 0,
    naturalH: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    frameW: 0,
    frameH: 0,
    stageW: 0,
    stageH: 0,
    coverScale: 1,
    aspect: 1,
    resolve: null,
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0
};

function openCropModal(imageDataUrl, aspectRatio, title) {
    return new Promise(resolve => {
        const overlay = document.getElementById('cropModal');
        const stage = document.getElementById('cropStage');
        const imgEl = document.getElementById('cropImage');
        const frameEl = document.getElementById('cropFrame');
        const zoomEl = document.getElementById('cropZoom');
        const titleEl = document.getElementById('cropTitle');
        if (!overlay || !stage || !imgEl || !frameEl) { resolve(imageDataUrl); return; }

        titleEl.textContent = title || t('adjustImage');
        _cropState.aspect = aspectRatio;
        _cropState.resolve = resolve;
        _cropState.scale = 1;
        _cropState.offsetX = 0;
        _cropState.offsetY = 0;
        _cropState.dragging = false;

        // Show modal first so stage has dimensions
        overlay.classList.add('open');

        // Wait for actual layout
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const stageW = stage.clientWidth;
                const stageH = stage.clientHeight;
                _cropState.stageW = stageW;
                _cropState.stageH = stageH;

                // Compute crop frame size
                let frameW = stageW * 0.8;
                let frameH = frameW / aspectRatio;
                if (frameH > stageH * 0.8) {
                    frameH = stageH * 0.8;
                    frameW = frameH * aspectRatio;
                }
                _cropState.frameW = frameW;
                _cropState.frameH = frameH;

                frameEl.style.width = frameW + 'px';
                frameEl.style.height = frameH + 'px';
                frameEl.style.left = ((stageW - frameW) / 2) + 'px';
                frameEl.style.top = ((stageH - frameH) / 2) + 'px';
                frameEl.style.borderRadius = aspectRatio === 1 ? '50%' : '8px';

                // Load image
                const img = new Image();
                img.onload = () => {
                    _cropState.img = img;
                    _cropState.naturalW = img.naturalWidth;
                    _cropState.naturalH = img.naturalHeight;

                    // coverScale: how much the image is scaled up by object-fit:cover
                    // (rendered size at scale=1)
                    _cropState.coverScale = Math.max(stageW / img.naturalWidth, stageH / img.naturalHeight);

                    imgEl.src = imageDataUrl;
                    imgEl.style.transform = 'translate(0px, 0px) scale(1)';
                    imgEl.style.transformOrigin = 'center center';

                    zoomEl.min = '1';
                    zoomEl.max = '4';
                    zoomEl.value = '1';

                    updateCropTransform();
                };
                img.onerror = () => {
                    console.error('Crop: image failed to load');
                    if (_cropState.resolve) _cropState.resolve(null);
                    _cropState.resolve = null;
                };
                img.src = imageDataUrl;

                attachCropHandlers();
            });
        });
    });
}

function updateCropTransform() {
    const imgEl = document.getElementById('cropImage');
    if (!imgEl) return;
    imgEl.style.transform = `translate(${_cropState.offsetX}px, ${_cropState.offsetY}px) scale(${_cropState.scale})`;
}

function attachCropHandlers() {
    const stage = document.getElementById('cropStage');
    const zoomEl = document.getElementById('cropZoom');
    if (!stage || !zoomEl) return;

    stage.onmousedown = null;
    stage.onmousemove = null;
    stage.onmouseup = null;
    stage.onmouseleave = null;
    stage.ontouchstart = null;
    stage.ontouchmove = null;
    stage.ontouchend = null;
    zoomEl.oninput = null;

    const startDrag = (x, y) => {
        _cropState.dragging = true;
        _cropState.startX = x;
        _cropState.startY = y;
        _cropState.startOffsetX = _cropState.offsetX;
        _cropState.startOffsetY = _cropState.offsetY;
    };
    const moveDrag = (x, y) => {
        if (!_cropState.dragging) return;
        let nx = _cropState.startOffsetX + (x - _cropState.startX);
        let ny = _cropState.startOffsetY + (y - _cropState.startY);

        // Clamp so the frame stays inside the (scaled) image.
        const maxX = (_cropState.frameW * (_cropState.scale - 1)) / 2;
        const maxY = (_cropState.frameH * (_cropState.scale - 1)) / 2;
        nx = Math.max(-maxX, Math.min(maxX, nx));
        ny = Math.max(-maxY, Math.min(maxY, ny));

        _cropState.offsetX = nx;
        _cropState.offsetY = ny;
        updateCropTransform();
    };
    const endDrag = () => { _cropState.dragging = false; };

    stage.onmousedown = e => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
    stage.onmousemove = e => moveDrag(e.clientX, e.clientY);
    stage.onmouseup = endDrag;
    stage.onmouseleave = endDrag;

    stage.ontouchstart = e => {
        if (e.touches.length === 1) {
            const tg = e.touches[0];
            startDrag(tg.clientX, tg.clientY);
        }
    };
    stage.ontouchmove = e => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const tg = e.touches[0];
            moveDrag(tg.clientX, tg.clientY);
        }
    };
    stage.ontouchend = endDrag;

    zoomEl.oninput = () => {
        const z = parseFloat(zoomEl.value);
        _cropState.scale = z;

        const maxX = (_cropState.frameW * (z - 1)) / 2;
        const maxY = (_cropState.frameH * (z - 1)) / 2;
        _cropState.offsetX = Math.max(-maxX, Math.min(maxX, _cropState.offsetX));
        _cropState.offsetY = Math.max(-maxY, Math.min(maxY, _cropState.offsetY));

        updateCropTransform();
    };
}

on('#cropCancelBtn', 'click', () => {
    const overlay = document.getElementById('cropModal');
    if (overlay) overlay.classList.remove('open');
    if (_cropState.resolve) _cropState.resolve(null);
    _cropState.resolve = null;
    _cropState.img = null;
});

on('#cropSaveBtn', 'click', () => {
    if (!_cropState.img) {
        if (_cropState.resolve) _cropState.resolve(null);
        _cropState.resolve = null;
        return;
    }

    const stageW = _cropState.stageW;
    const stageH = _cropState.stageH;
    const frameW = _cropState.frameW;
    const frameH = _cropState.frameH;
    const scale = _cropState.scale;
    const offsetX = _cropState.offsetX;
    const offsetY = _cropState.offsetY;
    const natW = _cropState.naturalW;
    const natH = _cropState.naturalH;
    const coverScale = _cropState.coverScale;

    // The image with object-fit:cover fills the stage.
    // Rendered size at scale=1:
    const renderedW = natW * coverScale;
    const renderedH = natH * coverScale;

    // Total scale applied to the natural image
    const totalScale = coverScale * scale;

    // Frame center in stage coordinates (relative to stage center)
    // (frame is centered, offset by 0 since frame is centered in stage)
    // Sample point = center of stage = (0,0)

    // The image is centered in the stage, then shifted by offsetX/offsetY, then scaled.
    // We want the crop region centered on the frame (which is centered in the stage).
    // Frame center in stage coords:
    const frameCenterStageX = (frameW / 2) - (stageW / 2);
    const frameCenterStageY = (frameH / 2) - (stageH / 2);

    // Image center after transform is at (offsetX, offsetY) in stage coords (relative to stage center)
    // Sample point relative to image center:
    const relX = (frameCenterStageX - offsetX) / totalScale;
    const relY = (frameCenterStageY - offsetY) / totalScale;

    // Convert to natural image coordinates
    const cropCenterX = natW / 2 + relX;
    const cropCenterY = natH / 2 + relY;

    // Crop region size in natural pixels
    const cropW = frameW / totalScale;
    const cropH = frameH / totalScale;

    let cropX = cropCenterX - cropW / 2;
    let cropY = cropCenterY - cropH / 2;

    // Clamp to image bounds
    cropX = Math.max(0, Math.min(natW - cropW, cropX));
    cropY = Math.max(0, Math.min(natH - cropH, cropY));

    // Output dimensions (cap at 512)
    let outW = cropW;
    let outH = cropH;
    const maxOut = 512;
    if (outW > maxOut || outH > maxOut) {
        const r = Math.min(maxOut / outW, maxOut / outH);
        outW = Math.round(outW * r);
        outH = Math.round(outH * r);
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(_cropState.img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    const result = canvas.toDataURL('image/jpeg', 0.85);

    const overlay = document.getElementById('cropModal');
    if (overlay) overlay.classList.remove('open');
    if (_cropState.resolve) _cropState.resolve(result);
    _cropState.resolve = null;
    _cropState.img = null;
});

on('#cropZoomIn', 'click', () => {
    const z = document.getElementById('cropZoom');
    if (!z) return;
    z.value = Math.min(4, parseFloat(z.value) + 0.25);
    z.dispatchEvent(new Event('input'));
});
on('#cropZoomOut', 'click', () => {
    const z = document.getElementById('cropZoom');
    if (!z) return;
    z.value = Math.max(1, parseFloat(z.value) - 0.25);
    z.dispatchEvent(new Event('input'));
});

// ============================================================
// SIGNUP
// ============================================================
on('#signupBtn', 'click', async () => {
    clearAuthMessage();
    const email = document.getElementById('signupEmail').value.trim();
    const uname = document.getElementById('signupUsername').value.trim().toLowerCase();
    const dname = document.getElementById('signupDisplayName').value.trim();
    const pass = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const btn = document.getElementById('signupBtn');

    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthMessage('Email is not valid.', 'error');
    if (!uname) return showAuthMessage('Please enter a username.', 'error');
    if (uname.length < 3 || uname.length > 14) return showAuthMessage('Username must be 3–14 characters.', 'error');
    if (!/^[a-z0-9_]+$/.test(uname)) return showAuthMessage('Username: lowercase letters, numbers, underscores only.', 'error');
    if (!dname) return showAuthMessage('Please enter a display name.', 'error');
    if (dname.length > 20) return showAuthMessage('Display name must be 20 characters or less.', 'error');
    if (!pass) return showAuthMessage('Please enter a password.', 'error');
    if (pass.length < 6) return showAuthMessage('Password must be at least 6 characters.', 'error');
    if (pass !== confirm) return showAuthMessage('Passwords do not match.', 'error');

    btn.disabled = true; btn.textContent = 'Creating...';
    try {
        const snap = await usersRef.child('usernames').child(uname).once('value');
        if (snap.exists()) throw new Error('USERNAME_TAKEN');
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        const user = cred.user;

        await new Promise(resolve => {
            let done = false;
            const unsub = auth.onAuthStateChanged(u => {
                if (u && u.uid === user.uid) { unsub(); if (!done) { done = true; resolve(); } }
            });
            setTimeout(() => { if (!done) { done = true; resolve(); } }, 3000);
        });

        await user.getIdToken(true);
        await new Promise(r => setTimeout(r, 300));

        await usersRef.child('usernames').child(uname).set(user.uid);
        await usersRef.child(user.uid).set({
            uid: user.uid, email, username: uname, displayName: dname,
            usernameChangedAt: Date.now(),
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            avatar: '', banner: '', bio: ''
        });
    } catch (err) {
        console.error('SIGNUP ERROR:', err.code, err.message);
        let msg = 'Failed to create account.';
        if (err.code === 'auth/email-already-in-use') msg = 'That email is already registered.';
        else if (err.code === 'auth/invalid-email') msg = 'That email is not valid.';
        else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
        else if (err.code === 'auth/operation-not-allowed') msg = 'Email/password sign-up is disabled.';
        else if (err.code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        else if (err.message === 'USERNAME_TAKEN') msg = 'That username is already taken.';
        else if ((err.message || '').includes('PERMISSION_DENIED')) msg = 'Database rules blocked this. Try a different username.';
        else msg = `Failed: ${err.code || err.message}`;
        showAuthMessage(msg, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = t('signupBtn');
    }
});

// LOGIN
on('#loginBtn', 'click', async () => {
    clearAuthMessage();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    if (!pass) return showAuthMessage('Please enter your password.', 'error');
    btn.disabled = true; btn.textContent = 'Logging in...';
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (err) {
        let msg = 'Failed to log in.';
        if (err.code === 'auth/user-not-found') msg = 'No account with that email.';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
        else if (err.code === 'auth/invalid-credential') msg = 'Email or password is incorrect.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
        showAuthMessage(msg, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = t('loginBtn');
    }
});

on('#loginPassword', 'keydown', e => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });
on('#signupConfirm', 'keydown', e => { if (e.key === 'Enter') document.getElementById('signupBtn').click(); });

// FORGOT
on('#forgotBtn', 'click', async () => {
    clearAuthMessage();
    const email = document.getElementById('forgotEmail').value.trim();
    const btn = document.getElementById('forgotBtn');
    if (!email) return showAuthMessage('Please enter your email.', 'error');
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthMessage('Reset link sent. Check your inbox.', 'success');
        setTimeout(() => showLoginForm(), 3000);
    } catch (err) {
        showAuthMessage('Failed to send reset link.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = t('forgotBtn');
    }
});

// ============================================================
// AUTH STATE
// ============================================================
auth.onAuthStateChanged(async user => {
    if (isInitializing) return;
    if (user) {
        if (isLoggedIn && currentUser && currentUser.uid === user.uid) return;
        isInitializing = true;
        try {
            currentUser = user;
            userId = user.uid;
            await handleLogin(user);
            isLoggedIn = true;
        } finally { isInitializing = false; }
    } else {
        if (!isLoggedIn && !currentUser) return;
        isInitializing = true;
        try { handleLogout(); isLoggedIn = false; } finally { isInitializing = false; }
    }
});

async function handleLogin(user) {
    try {
        const snap = await usersRef.child(user.uid).once('value');
        const data = snap.val();
        if (data) {
            username = data.username || user.email.split('@')[0].toLowerCase();
            displayName = data.displayName || data.username || username;
            if (!data.displayName) await usersRef.child(user.uid).update({ displayName });
            currentProfile = {
                username, displayName,
                bio: data.bio || '', avatar: data.avatar || '', banner: data.banner || '',
                joined: data.createdAt || Date.now(),
                usernameChangedAt: data.usernameChangedAt || 0
            };
        } else {
            username = user.email.split('@')[0].toLowerCase();
            displayName = username;
            currentProfile = { username, displayName, bio: '', avatar: '', banner: '', joined: Date.now(), usernameChangedAt: 0 };
            await usersRef.child(user.uid).set({
                uid: user.uid, email: user.email, username, displayName,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                usernameChangedAt: Date.now(),
                avatar: '', banner: '', bio: ''
            });
        }
        updateUserBadge();
        updateSettingsUser();
        document.body.classList.add('logged-in');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('chatApp').style.display = 'grid';
        setPresence(true);
        listenMuted(); listenPinned(); listenNicknames(); listenBlocked();
        listenDeleted(); listenFavorites();
        listenFriends(); listenFriendRequests(); listenPresence();
        listenUnread(); listenGroups(); listenSelfProfile();
        listenTypingPreview();
        switchView('friends');
    } catch (err) {
        console.error('[Auth]', err);
        await auth.signOut();
    }
}

function handleLogout() {
    setPresence(false);
    currentUser = null; username = ''; displayName = ''; userId = '';
    currentProfile = null; currentDmUser = null; currentGroup = null;
    currentProfileViewUid = null;
    friends = []; friendsData = {}; unreadCounts = {}; userGroups = {};
    groupsData = {}; mutedChats = {}; pinnedChats = {}; lastMessages = {};
    nicknames = {}; blockedUsers = {}; favoriteUsers = {};
    deletedConversations = {}; typingPreviewState = {}; deletedDms = {};
    dmReplyTo = null; groupReplyTo = null; dmEditingId = null; groupEditingId = null;
    dmReactions = {}; groupReactions = {};
    _lastPresenceHash = ''; _lastUnreadHash = ''; _lastRailHash = '';
    _lastFriendsHash = ''; _lastMutedHash = ''; _lastPinnedHash = '';
    _lastFavoritesHash = '';
    _contextMenuTarget = null; _contextMenuType = null;
    Object.keys(_lastMsgListeners).forEach(k => {
        try { _lastMsgListeners[k].ref.off('child_added', _lastMsgListeners[k].cb); } catch (e) {}
        try { _lastMsgListeners[k].ref.off('child_changed', _lastMsgListeners[k].cb); } catch (e) {}
        delete _lastMsgListeners[k];
    });
    document.getElementById('chatApp').style.display = 'none';
    document.getElementById('loginScreen').classList.remove('hidden');
    document.body.classList.remove('logged-in');
    showLoginForm();
}

function setPresence(online) {
    if (!userId) return;
    const ref = presenceRef.child(userId);
    if (online) {
        ref.set({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
        ref.onDisconnect().set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
    } else {
        ref.set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
    }
}

function updateUserBadge() {
    const ua = document.getElementById('userAvatar');
    const ama = document.getElementById('accountMenuAvatar');
    const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
    if (currentProfile && currentProfile.avatar) {
        [ua, ama].forEach(a => {
            if (!a) return;
            a.style.backgroundImage = `url('${currentProfile.avatar}')`;
            a.style.backgroundSize = 'cover';
            a.style.backgroundPosition = 'center';
            a.textContent = '';
        });
    } else {
        [ua, ama].forEach(a => {
            if (!a) return;
            a.style.backgroundImage = '';
            a.style.background = bg;
            a.textContent = getInitial(displayName);
        });
    }
    const ud = document.getElementById('usernameDisplay');
    if (ud) ud.textContent = displayName;
    const amd = document.getElementById('accountMenuDisplayName');
    if (amd) amd.textContent = displayName;
    const amu = document.getElementById('accountMenuUsername');
    if (amu) amu.textContent = '@' + username;
    const us = document.getElementById('userStatus');
    if (us) us.textContent = 'Online';
}

function updateSettingsUser() {
    const a = document.getElementById('settingsUserAvatar');
    if (!a) return;
    if (currentProfile && currentProfile.avatar) {
        a.style.backgroundImage = `url('${currentProfile.avatar}')`;
        a.style.backgroundSize = 'cover';
        a.style.backgroundPosition = 'center';
        a.textContent = '';
    } else {
        const bg = `linear-gradient(135deg, ${getColor(displayName)}, ${getColor(displayName)}cc)`;
        a.style.backgroundImage = '';
        a.style.background = bg;
        a.textContent = getInitial(displayName);
    }
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('settingsUserName', displayName);
    setTxt('settingsUserUsername', '@' + username);
    setTxt('infoDisplayName', displayName);
    setTxt('infoUsername', '@' + username);
    setTxt('infoEmail', currentUser ? currentUser.email : '');
    setTxt('infoBio', currentProfile && currentProfile.bio ? currentProfile.bio : 'No bio yet');
}

function switchView(name) {
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    const nf = document.getElementById('navFriends');
    if (nf) nf.classList.toggle('active', name === 'friends');
    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === (currentDmUser && currentDmUser.uid)) ||
        (el.dataset.gid === (currentGroup && currentGroup.id))
    ));
}

on('#navFriends', 'click', () => switchView('friends'));
on('#welcomeAddBtn', 'click', () => {
    switchView('friends');
    const tb = document.querySelector('.tab[data-tab="add"]');
    if (tb) tb.click();
});

$$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.tab').forEach(x => x.classList.toggle('active', x === tab));
        $$('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
        if (tab.dataset.tab === 'add') setTimeout(() => {
            const i = document.getElementById('userSearchInput');
            if (i) i.focus();
        }, 100);
    });
});

let _draftTimer = null;
function setupDraftAutosave(inputEl, keyFn) {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
        clearTimeout(_draftTimer);
        _draftTimer = setTimeout(async () => {
            const key = keyFn();
            if (!key || !userId) return;
            const val = inputEl.value;
            if (val) await draftsRef.child(userId).child(key).set(val);
            else await draftsRef.child(userId).child(key).remove();
        }, 500);
    });
}
async function loadDraft(key, inputEl) {
    if (!key || !userId || !inputEl) return;
    try {
        const snap = await draftsRef.child(userId).child(key).once('value');
        const val = snap.val();
        if (val) inputEl.value = val;
    } catch (e) {}
}
async function clearDraft(key) {
    if (!key || !userId) return;
    try { await draftsRef.child(userId).child(key).remove(); } catch (e) {}
}

(function initLanguage() {
    const saved = localStorage.getItem('whisper_lang') || 'en';
    applyLanguage(saved);
})();

console.log('%c✧ Whisper', 'font-size:20px;font-weight:bold;color:#4a8b7a;');
console.log('A quiet place to talk.');

// END OF PART 1 — CONTINUE WITH PART 2 BELOW THIS LINE// ============================================================
// LISTENERS
// ============================================================
function listenPresence() {
    presenceRef.on('value', snap => {
        onlineUsers = snap.val() || {};
        const hash = Object.keys(onlineUsers).sort().map(k => {
            const p = onlineUsers[k];
            return `${k}:${p.online ? 1 : 0}:${p.lastSeen || 0}`;
        }).join('|');
        if (hash === _lastPresenceHash) return;
        _lastPresenceHash = hash;
        renderAllFriends();
        renderRailDms();
        if (currentDmUser) updateDmHeader();
    });
    setInterval(() => {
        renderAllFriends();
        if (currentDmUser) { updateDmHeader(); updateChatProfileStatus(); }
    }, 60000);
}
function listenUnread() {
    unreadRef.child(userId).on('value', snap => {
        unreadCounts = snap.val() || {};
        const h = JSON.stringify(unreadCounts);
        if (h === _lastUnreadHash) return;
        _lastUnreadHash = h;
        renderRailDms();
    });
}
function listenMuted() {
    mutedRef.child(userId).on('value', snap => {
        mutedChats = snap.val() || {};
        const h = JSON.stringify(mutedChats);
        if (h === _lastMutedHash) return;
        _lastMutedHash = h; _lastRailHash = '';
        renderRailDms();
    });
}
function listenPinned() {
    pinnedRef.child(userId).on('value', snap => {
        pinnedChats = snap.val() || {};
        const h = JSON.stringify(pinnedChats);
        if (h === _lastPinnedHash) return;
        _lastPinnedHash = h; _lastRailHash = '';
        renderRailDms();
    });
}
function listenNicknames() {
    nicknamesRef.child(userId).on('value', snap => {
        nicknames = snap.val() || {};
        _lastRailHash = '';
        renderRailDms(); renderAllFriends();
        if (currentDmUser) updateDmHeader();
    });
}
function listenBlocked() {
    blockedRef.child(userId).on('value', snap => {
        blockedUsers = snap.val() || {};
        _lastRailHash = '';
        renderRailDms();
        renderAllFriends();
        renderBlockedList();
        if (currentDmUser && blockedUsers[currentDmUser.uid]) {
            currentDmUser = null;
            switchView('friends');
        }
    });
}
function listenFavorites() {
    favoritesRef.child(userId).on('value', snap => {
        favoriteUsers = snap.val() || {};
        const h = JSON.stringify(favoriteUsers);
        if (h === _lastFavoritesHash) return;
        _lastFavoritesHash = h;
        _lastRailHash = '';
        renderRailDms(); renderAllFriends();
        if (currentProfileViewUid) refreshUserProfileActions(currentProfileViewUid);
    });
}
function listenDeleted() {
    deletedRef.child(userId).on('value', snap => {
        deletedConversations = snap.val() || {};
        renderDeletedList();
    });
}
function listenTypingPreview() {
    typingPreviewRef.child(userId).on('value', snap => {
        typingPreviewState = snap.val() || {};
        _lastRailHash = '';
        renderRailDms();
    });
}
function listenGroups() {
    groupsRef.orderByChild('members/' + userId).equalTo(true).on('value', async snap => {
        const data = snap.val() || {};
        userGroups = data; groupsData = {};
        Object.keys(data).forEach(gid => { groupsData[gid] = data[gid]; });
        _lastRailHash = '';
        renderRailDms(); listenLastMessages();
        if (currentGroup && data[currentGroup.id]) {
            currentGroup = { id: currentGroup.id, ...data[currentGroup.id] };
            updateGroupHeader();
        }
    });
}

const _friendProfileListeners = {};
function listenFriendProfiles() {
    Object.keys(_friendProfileListeners).forEach(uid => {
        if (!friends.includes(uid)) {
            try { usersRef.child(uid).off('value', _friendProfileListeners[uid]); } catch (e) {}
            delete _friendProfileListeners[uid];
        }
    });
    friends.forEach(uid => {
        if (_friendProfileListeners[uid]) return;
        const handler = snap => {
            const data = snap.val();
            if (!data) return;

            const prev = friendsData[uid];
            const changed = !prev ||
                prev.avatar !== data.avatar ||
                prev.banner !== data.banner ||
                prev.displayName !== data.displayName ||
                prev.username !== data.username ||
                prev.bio !== data.bio;
            if (!changed) return;

            friendsData[uid] = data;

            renderAllFriends();
            _lastRailHash = '';
            renderRailDms();

            if (currentDmUser && currentDmUser.uid === uid) updateDmHeader();

            const cpView = document.querySelector('.view[data-view="chatProfile"]');
            if (currentDmUser && currentDmUser.uid === uid && cpView && cpView.classList.contains('active')) {
                openChatProfile();
            }

            if (currentProfileViewUid === uid) {
                renderUserProfilePage(uid, data);
                buildUserProfileActions(uid, displayNameFor(uid, data.displayName || data.username), data);
                updateBlockLabels(uid);
            }
        };
        _friendProfileListeners[uid] = handler;
        usersRef.child(uid).on('value', handler);
    });
}

function listenSelfProfile() {
    usersRef.child(userId).on('value', snap => {
        const data = snap.val();
        if (!data) return;

        currentProfile = Object.assign({}, currentProfile || {}, {
            username: data.username || (currentProfile && currentProfile.username) || '',
            displayName: data.displayName || (currentProfile && currentProfile.displayName) || '',
            bio: data.bio || '',
            avatar: data.avatar || '',
            banner: data.banner || '',
            joined: data.createdAt || (currentProfile && currentProfile.joined) || Date.now(),
            usernameChangedAt: data.usernameChangedAt || (currentProfile && currentProfile.usernameChangedAt) || 0
        });
        displayName = currentProfile.displayName;
        username = currentProfile.username;

        updateUserBadge();
        updateSettingsUser();

        if (currentProfileViewUid === userId) {
            renderUserProfilePage(userId, {
                username: currentProfile.username,
                displayName: currentProfile.displayName,
                bio: currentProfile.bio,
                avatar: currentProfile.avatar,
                banner: currentProfile.banner,
                createdAt: currentProfile.joined
            });
        }

        if (currentDmUser && currentDmUser.uid === userId) updateDmHeader();
    });
}

function renderUserProfilePage(uid, data) {
    const bannerEl = document.getElementById('upBanner');
    const avatarEl = document.getElementById('upAvatar');
    const nameEl = document.getElementById('upDisplayName');
    const unameEl = document.getElementById('upUsername');
    const joinedEl = document.getElementById('upJoined');
    const bioEl = document.getElementById('upBio');
    if (!bannerEl) return;

    const dname = displayNameFor(uid, data.displayName || data.username || 'Unknown');
    const color = getColor(data.displayName || data.username);

    if (data.banner) {
        bannerEl.style.backgroundImage = 'url(\'' + data.banner + '\')';
        bannerEl.style.background = '';
        bannerEl.style.backgroundSize = 'cover';
        bannerEl.style.backgroundPosition = 'center';
    } else {
        bannerEl.style.backgroundImage = '';
        bannerEl.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
    }

    if (data.avatar) {
        avatarEl.style.backgroundImage = 'url(\'' + data.avatar + '\')';
        avatarEl.style.background = '';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
        avatarEl.textContent = getInitial(dname);
    }

    nameEl.textContent = dname;
    unameEl.textContent = '@' + (data.username || 'unknown');

    const joined = data.createdAt || Date.now();
    const joinedStr = new Date(joined).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    joinedEl.innerHTML = '<i class="fas fa-calendar"></i> ' + t('joined') + ' ' + escapeHtml(joinedStr);
    bioEl.textContent = data.bio || 'No bio yet';
}

function listenLastMessages() {
    friends.forEach(uid => {
        if (deletedDms[uid]) return;
        const key = dmKey(userId, uid);
        const listenKey = 'dm_' + key;
        if (_lastMsgListeners[listenKey]) return;
        const ref = dmsRef.child(key).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                if (!m.timestamp || typeof m.timestamp !== 'number') return;
                if (deletedDms[uid]) return;
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') delete m.data;
                lastMessages[listenKey] = m;
            });
            _lastRailHash = ''; renderRailDms();
        };
        ref.on('child_added', cb); ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });
    Object.keys(userGroups).forEach(gid => {
        const listenKey = 'group_' + gid;
        if (_lastMsgListeners[listenKey]) return;
        const ref = groupsRef.child(gid).child('messages').limitToLast(1);
        const cb = snap => {
            snap.forEach(child => {
                const m = child.val() || {};
                if (!m.timestamp || typeof m.timestamp !== 'number') return;
                if (m.type === 'image' || m.type === 'voice' || m.type === 'file') delete m.data;
                lastMessages[listenKey] = m;
            });
            _lastRailHash = ''; renderRailDms();
        };
        ref.on('child_added', cb); ref.on('child_changed', cb);
        _lastMsgListeners[listenKey] = { ref, cb };
    });
}

// ============================================================
// FRIENDS
// ============================================================
function listenFriends() {
    friendsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        const newFriends = Object.keys(data);
        const hash = newFriends.slice().sort().join(',');
        if (hash === _lastFriendsHash) return;
        _lastFriendsHash = hash;
        const toFetch = newFriends.filter(uid => !friendsData[uid]);
        friends = newFriends;
        Object.keys(friendsData).forEach(uid => {
            if (!newFriends.includes(uid)) delete friendsData[uid];
        });
        if (toFetch.length > 0) {
            const results = await Promise.all(toFetch.map(uid =>
                usersRef.child(uid).once('value').then(s => ({ uid, data: s.val() }))
            ));
            results.forEach(r => { if (r.data) friendsData[r.uid] = r.data; });
        }
        listenFriendProfiles();
        renderAllFriends();
        _lastRailHash = '';
        renderRailDms();
        listenLastMessages();
        if (friends.length === 0 && pendingRequests.length === 0 && Object.keys(userGroups).length === 0) {
            switchView('welcome');
        }
    });
}
function listenFriendRequests() {
    friendRequestsRef.child(userId).on('value', async snap => {
        const data = snap.val() || {};
        pendingRequests = [];
        for (const uid of Object.keys(data)) {
            const u = await usersRef.child(uid).once('value');
            if (u.exists()) pendingRequests.push(Object.assign({ uid }, u.val(), { requestAt: data[uid].at }));
        }
        renderPending(); updatePendingBadge();
    });
}

// ============================================================
// FRIEND ACTIONS
// ============================================================
async function sendFriendRequest(targetUid) {
    if (_sendingFriendRequest) return;
    if (targetUid === userId) {
        showModal({ title: "That's you", text: 'You cannot add yourself.', icon: 'fas fa-info-circle', confirmText: 'OK' });
        return;
    }
    _sendingFriendRequest = true;
    showToast('Sending', 'Please wait...');
    try {
        const [f, s, r] = await Promise.all([
            friendsRef.child(userId).child(targetUid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(targetUid).once('value'),
            friendRequestsRef.child(userId).child(targetUid).once('value')
        ]);
        if (f.exists()) { showToast('Already friends', 'You are already connected.'); return; }
        if (s.exists()) { showToast('Already sent', 'You already sent them a request.'); return; }
        if (r.exists()) { await acceptFriendRequest(targetUid); return; }
        const updates = {};
        updates['friendRequests/' + targetUid + '/' + userId] = { at: firebase.database.ServerValue.TIMESTAMP };
        updates['friendRequests/sent_' + userId + '/' + targetUid] = { at: firebase.database.ServerValue.TIMESTAMP };
        await friendRequestsRef.root.update(updates);
        showToast('Request sent', 'Waiting for them to accept.');
        const sr = document.getElementById('searchResults');
        if (sr) sr.style.display = 'none';
        const ui = document.getElementById('userSearchInput');
        if (ui) ui.value = '';
    } catch (err) {
        showToast('Failed', 'Could not send request.');
    } finally {
        _sendingFriendRequest = false;
    }
}
async function acceptFriendRequest(fromUid) {
    try {
        const updates = {};
        updates['friends/' + userId + '/' + fromUid] = true;
        updates['friends/' + fromUid + '/' + userId] = true;
        updates['friendRequests/' + userId + '/' + fromUid] = null;
        updates['friendRequests/sent_' + fromUid + '/' + userId] = null;
        updates['friendRequests/' + fromUid + '/' + userId] = null;
        updates['friendRequests/sent_' + userId + '/' + fromUid] = null;
        await friendsRef.root.update(updates);
        showToast('Friend added', 'You are now connected.');
        if (currentProfileViewUid === fromUid) refreshUserProfileActions(fromUid);
    } catch (err) {
        console.error('acceptFriendRequest failed:', err);
        showToast('Failed', 'Could not accept request.');
    }
}
async function declineFriendRequest(fromUid) {
    try {
        const updates = {};
        updates['friendRequests/' + userId + '/' + fromUid] = null;
        updates['friendRequests/sent_' + fromUid + '/' + userId] = null;
        updates['friendRequests/' + fromUid + '/' + userId] = null;
        updates['friendRequests/sent_' + userId + '/' + fromUid] = null;
        await friendRequestsRef.root.update(updates);
        showToast('Declined', 'Request removed.');
    } catch (err) {
        console.error('declineFriendRequest failed:', err);
    }
}
async function removeFriend(uid) {
    const u = friendsData[uid];
    const dname = displayNameFor(uid, (u && (u.displayName || u.username)) || 'this friend');
    const ok = await showModal({
        title: 'Remove friend?',
        text: 'You will no longer be connected with ' + escapeHtml(dname) + '.',
        icon: 'fas fa-user-minus',
        danger: true,
        confirmText: 'Remove'
    });
    if (!ok) return;
    const updates = {};
    updates['friends/' + userId + '/' + uid] = null;
    updates['friends/' + uid + '/' + userId] = null;
    await friendsRef.root.update(updates);
    try { await nicknamesRef.child(userId).child(uid).remove(); } catch (e) {}
    showToast('Friend removed', 'You are no longer connected.');
    if (currentProfileViewUid === uid) refreshUserProfileActions(uid);
}
async function toggleFavorite(uid) {
    if (!uid || uid === userId) return;
    const fav = isUserFavorited(uid);
    try {
        if (fav) await favoritesRef.child(userId).child(uid).remove();
        else await favoritesRef.child(userId).child(uid).set(true);
        showToast(fav ? 'Removed from favorites' : 'Added to favorites', '');
    } catch (err) {
        showToast('Failed', 'Could not update favorites.');
    }
}

// ============================================================
// USER SEARCH
// ============================================================
async function searchUsers() {
    const input = document.getElementById('userSearchInput');
    const query = input.value.trim().toLowerCase();
    const sr = document.getElementById('searchResults');
    const srl = document.getElementById('searchResultsList');
    if (!query) { sr.style.display = 'none'; return; }
    srl.innerHTML = '<div class="empty-message">Searching...</div>';
    sr.style.display = 'block';
    try {
        const snap = await usersRef.child('usernames').child(query).once('value');
        if (!snap.exists()) {
            srl.innerHTML = '<div class="empty-message"><strong>No one found</strong>No user has that username.</div>';
            return;
        }
        const uid = snap.val();
        const [uSnap, sentSnap, recvSnap] = await Promise.all([
            usersRef.child(uid).once('value'),
            friendRequestsRef.child('sent_' + userId).child(uid).once('value'),
            friendRequestsRef.child(userId).child(uid).once('value')
        ]);
        const userData = uSnap.val();
        if (!userData) {
            srl.innerHTML = '<div class="empty-message">User profile not found.</div>';
            return;
        }
        srl.innerHTML = '';
        srl.appendChild(renderUserCard(uid, userData, {
            isSelf: uid === userId,
            isFriend: friends.includes(uid),
            isSent: sentSnap.exists(),
            isRecv: recvSnap.exists(),
            showStatus: true
        }));
    } catch (err) {
        srl.innerHTML = '<div class="empty-message">Search failed.</div>';
    }
}
on('#searchBtn', 'click', searchUsers);
on('#userSearchInput', 'keydown', e => { if (e.key === 'Enter') searchUsers(); });

// ============================================================
// USER CARD
// ============================================================
function renderUserCard(uid, userData, opts) {
    opts = opts || {};
    const isSelf = opts.isSelf, isFriend = opts.isFriend, isSent = opts.isSent, isRecv = opts.isRecv, showStatus = opts.showStatus;
    const dname = displayNameFor(uid, userData.displayName || userData.username || 'Unknown');
    const uname = userData.username || 'unknown';
    const color = getColor(userData.displayName || uname);
    const online = isUserOnline(uid);
    const status = online ? 'online' : 'offline';
    const div = document.createElement('div');
    div.className = 'user-card';

    const avatarHtml = userData.avatar
        ? '<div class="user-card-avatar" style="background-image: url(\'' + userData.avatar + '\');" data-action="profile" data-uid="' + uid + '"><div class="dot ' + status + '"></div></div>'
        : '<div class="user-card-avatar" style="background: linear-gradient(135deg, ' + color + ', ' + color + 'cc);" data-action="profile" data-uid="' + uid + '">' + escapeHtml(getInitial(dname)) + '<div class="dot ' + status + '"></div></div>';

    const statusText = showStatus
        ? '<div class="user-card-status ' + status + '">@' + escapeHtml(uname) + ' · ' + statusLabel(uid) + '</div>'
        : '';

    let actionsHtml = '';
    if (isSelf) actionsHtml = '<span style="font-size:0.75rem;color:var(--ink-muted);padding:0 8px;font-weight:500;">You</span>';
    else if (isFriend) actionsHtml = '<button class="user-card-btn dm" data-action="dm" data-uid="' + uid + '" title="Message"><i class="fas fa-comment"></i></button>';
    else if (isRecv) actionsHtml = '<button class="user-card-btn accept" data-action="accept" data-uid="' + uid + '" title="Accept"><i class="fas fa-check"></i></button><button class="user-card-btn decline" data-action="decline" data-uid="' + uid + '" title="Decline"><i class="fas fa-times"></i></button>';
    else if (isSent) actionsHtml = '<span class="user-card-btn" style="color:var(--warning);cursor:default;"><i class="fas fa-clock"></i></span>';
    else actionsHtml = '<button class="user-card-btn" data-action="add" data-uid="' + uid + '" title="Add friend"><i class="fas fa-user-plus"></i></button>';

    div.innerHTML = avatarHtml +
        '<div class="user-card-info">' +
            '<div class="user-card-name" data-action="profile" data-uid="' + uid + '">' + escapeHtml(dname) + '</div>' +
            statusText +
        '</div>' +
        '<div class="user-card-actions">' + actionsHtml + '</div>';

    div.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const targetUid = btn.dataset.uid;
            if (action === 'add') sendFriendRequest(targetUid);
            else if (action === 'accept') acceptFriendRequest(targetUid);
            else if (action === 'decline') declineFriendRequest(targetUid);
            else if (action === 'dm') openDM(targetUid, displayNameFor(targetUid, userData.displayName || userData.username), userData);
            else if (action === 'profile') openUserProfile(targetUid);
        });
    });
    return div;
}

// ============================================================
// RIBBONS
// ============================================================
function renderRibbon(container, uids) {
    if (!container) return;
    container.innerHTML = '';
    if (uids.length === 0) return;
    uids.forEach(uid => {
        if (blockedUsers[uid]) return;
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const online = isUserOnline(uid);
        const status = online ? 'online' : 'offline';
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'friend-tile';
        tile.dataset.uid = uid;

        const avatarInner = u.avatar
            ? '<div class="friend-tile-avatar" style="background-image:url(\'' + u.avatar + '\');"><div class="dot ' + status + '"></div></div>'
            : '<div class="friend-tile-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(dname)) + '<div class="dot ' + status + '"></div></div>';

        tile.innerHTML = avatarInner + '<div class="friend-tile-name">' + escapeHtml(dname) + '</div>';
        tile.addEventListener('click', () => openDM(uid, dname, u));
        tile.addEventListener('contextmenu', e => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, uid, 'dm');
        });
        container.appendChild(tile);
    });
}
function renderAllFriends() {
    const online = friends.filter(uid => isUserOnline(uid) && !blockedUsers[uid]);
    renderRibbon(document.getElementById('onlineRibbon'), online);
    const ol = document.getElementById('onlineList');
    if (ol) {
        ol.innerHTML = '';
        if (friends.filter(u => !blockedUsers[u]).length === 0) {
            ol.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Search for someone by username to get started.</div>';
        } else if (online.length === 0) {
            ol.innerHTML = '<div class="empty-message">No one is active right now.</div>';
        } else {
            online.forEach(uid => {
                if (blockedUsers[uid]) return;
                const u = friendsData[uid];
                if (u) ol.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
            });
        }
    }
    renderRibbon(document.getElementById('allRibbon'), friends);
    const al = document.getElementById('allList');
    if (al) {
        al.innerHTML = '';
        const visibleFriends = friends.filter(u => !blockedUsers[u]);
        if (visibleFriends.length === 0) {
            al.innerHTML = '<div class="empty-message"><strong>No friends yet</strong>Add someone using the Add Friend tab.</div>';
        } else {
            visibleFriends.forEach(uid => {
                const u = friendsData[uid];
                if (u) al.appendChild(renderUserCard(uid, u, { isFriend: true, showStatus: true }));
            });
        }
    }
}
function renderPending() {
    const pl = document.getElementById('pendingList');
    if (!pl) return;
    pl.innerHTML = '';
    if (pendingRequests.length === 0) {
        pl.innerHTML = '<div class="empty-message">No pending requests.</div>';
        return;
    }
    pendingRequests.forEach(u => {
        pl.appendChild(renderUserCard(u.uid, u, { isRecv: true, showStatus: true }));
    });
}
function updatePendingBadge() {
    const count = pendingRequests.length;
    const pb = document.getElementById('pendingBadge');
    const ptb = document.getElementById('pendingTabBadge');
    if (count > 0) {
        if (pb) { pb.textContent = count; pb.style.display = 'flex'; }
        if (ptb) ptb.textContent = count;
    } else {
        if (pb) pb.style.display = 'none';
        if (ptb) ptb.textContent = '0';
    }
}

// ============================================================
// RAIL RENDER
// ============================================================
async function renderRailDms() {
    const hashParts = [];
    for (const uid of friends) {
        if (deletedDms[uid]) continue;
        if (blockedUsers[uid]) continue;
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        const typing = typingPreviewState['dm_' + dmKey(userId, uid)];
        hashParts.push(uid + '|' + displayNameFor(uid, u.displayName) + '|' + (u.avatar ? '1' : '0') + '|' + (isUserOnline(uid) ? '1' : '0') + '|' + (unreadCounts['dm_' + uid] || 0) + '|' + (isChatMuted('dm_' + uid) ? 'M' : '') + '|' + (isChatPinned('dm_' + uid) ? 'P' : '') + '|' + (isUserFavorited(uid) ? 'F' : '') + '|' + ((lm && (lm.text || lm.type)) || '').slice(0, 20) + '|' + ((lm && lm.timestamp) || 0) + '|' + (typing || ''));
    }
    for (const gid of Object.keys(userGroups)) {
        const lm = lastMessages['group_' + gid];
        hashParts.push(gid + '|' + (userGroups[gid].name || '') + '|' + (userGroups[gid].photo ? '1' : '0') + '|' + (unreadCounts['group_' + gid] || 0) + '|' + (isChatMuted('group_' + gid) ? 'M' : '') + '|' + (isChatPinned('group_' + gid) ? 'P' : '') + '|' + ((lm && (lm.text || lm.type)) || '').slice(0, 20) + '|' + ((lm && lm.timestamp) || 0));
    }
    const newHash = hashParts.join(';');
    if (newHash === _lastRailHash) return;
    _lastRailHash = newHash;

    const dmList = document.getElementById('dmList');
    if (!dmList) return;
    const prevScroll = dmList.scrollTop;
    dmList.innerHTML = '';

    if (friends.filter(u => !blockedUsers[u]).length === 0 && Object.keys(userGroups).length === 0) {
        dmList.innerHTML = '<div class="dm-empty">' + t('noConversations') + '</div>';
        return;
    }
    const items = [];
    for (const uid of friends) {
        if (deletedDms[uid]) continue;
        if (blockedUsers[uid]) continue;
        const u = friendsData[uid];
        if (!u) continue;
        const lm = lastMessages['dm_' + dmKey(userId, uid)];
        items.push({
            type: 'dm', uid, data: u, lm,
            sort: (lm && lm.timestamp) || 0,
            pinned: isChatPinned('dm_' + uid),
            favorite: isUserFavorited(uid)
        });
    }
    for (const gid of Object.keys(userGroups)) {
        const g = userGroups[gid];
        if (!g) continue;
        const lm = lastMessages['group_' + gid];
        items.push({
            type: 'group', gid, data: g, lm,
            sort: (lm && lm.timestamp) || 0,
            pinned: isChatPinned('group_' + gid),
            favorite: false
        });
    }
    items.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return (b.sort || 0) - (a.sort || 0);
    });
    for (const item of items) {
        const el = document.createElement('button');
        el.type = 'button';
        if (item.type === 'dm') {
            const u = item.data;
            const dname = displayNameFor(item.uid, u.displayName || u.username);
            const color = getColor(u.displayName || u.username);
            const online = isUserOnline(item.uid);
            const unread = unreadCounts['dm_' + item.uid] || 0;
            const muted = isChatMuted('dm_' + item.uid);
            const pinned = isChatPinned('dm_' + item.uid);
            const typingKey = 'dm_' + dmKey(userId, item.uid);
            const isTyping = !!typingPreviewState[typingKey];
            el.dataset.uid = item.uid;

            const avatarHtml = u.avatar
                ? '<div class="dm-item-avatar" style="background-image:url(\'' + u.avatar + '\');">' + (online ? '<div class="dm-dot online"></div>' : '') + '</div>'
                : '<div class="dm-item-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(dname)) + (online ? '<div class="dm-dot online"></div>' : '') + '</div>';

            let preview = '';
            if (isTyping) preview = 'typing';
            else if (item.lm) {
                preview = previewText(item.lm);
                if (item.lm.userId === userId) preview = 'You: ' + preview;
            }
            const timeStr = (item.lm && item.lm.timestamp) ? shortTime(item.lm.timestamp) : '';
            let badgeText = '';
            if (unread > 0 && !muted) badgeText = unread > 99 ? '99+' : unread + '+';

            const flags = [];
            if (pinned) flags.push('<span class="dm-item-flag pin" title="Pinned"><i class="fas fa-thumbtack"></i></span>');
            if (muted) flags.push('<span class="dm-item-flag" title="Muted"><i class="fas fa-bell-slash"></i></span>');
            if (item.favorite) flags.push('<span class="dm-item-flag fav" title="Favorite"><i class="fas fa-star"></i></span>');
            const flagsHtml = flags.length ? '<span class="dm-item-flags">' + flags.join('') + '</span>' : '';

            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (pinned ? ' pinned' : '');
            el.innerHTML =
                avatarHtml +
                '<div class="dm-item-body">' +
                    '<div class="dm-item-top">' +
                        '<span class="dm-item-name-row">' +
                            '<span class="dm-item-name">' + escapeHtml(dname) + '</span>' +
                            flagsHtml +
                        '</span>' +
                        '<span class="dm-item-time">' + timeStr + '</span>' +
                    '</div>' +
                    '<div class="dm-item-preview' + (isTyping ? ' typing' : '') + '">' + (isTyping ? 'typing' : escapeHtml(preview)) + '</div>' +
                '</div>' +
                (badgeText ? '<span class="dm-item-badge">' + badgeText + '</span>' : '');

            el.addEventListener('click', () => openDM(item.uid, dname, u));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, item.uid, 'dm');
            });
        } else {
            const g = item.data;
            const unread = unreadCounts['group_' + item.gid] || 0;
            const muted = isChatMuted('group_' + item.gid);
            const pinned = isChatPinned('group_' + item.gid);
            el.dataset.gid = item.gid;
            let preview = '';
            if (item.lm) preview = (item.lm.displayName || item.lm.user || 'Someone') + ': ' + previewText(item.lm);
            const timeStr = (item.lm && item.lm.timestamp) ? shortTime(item.lm.timestamp) : '';
            let avatarHtml;
            if (g.photo) avatarHtml = '<div class="dm-item-avatar group-avatar" style="background-image:url(\'' + g.photo + '\');"></div>';
            else avatarHtml = '<div class="dm-item-avatar group-avatar"><i class="fas fa-users" style="font-size:0.8rem;"></i></div>';
            let badgeText = '';
            if (unread > 0 && !muted) badgeText = unread > 99 ? '99+' : unread + '+';

            const flags = [];
            if (pinned) flags.push('<span class="dm-item-flag pin" title="Pinned"><i class="fas fa-thumbtack"></i></span>');
            if (muted) flags.push('<span class="dm-item-flag" title="Muted"><i class="fas fa-bell-slash"></i></span>');
            const flagsHtml = flags.length ? '<span class="dm-item-flags">' + flags.join('') + '</span>' : '';

            el.className = 'dm-item' + ((unread > 0 && !muted) ? ' unread' : '') + (pinned ? ' pinned' : '');
            el.innerHTML =
                avatarHtml +
                '<div class="dm-item-body">' +
                    '<div class="dm-item-top">' +
                        '<span class="dm-item-name-row">' +
                            '<span class="dm-item-name">' + escapeHtml(g.name || 'Group') + '</span>' +
                            flagsHtml +
                        '</span>' +
                        '<span class="dm-item-time">' + timeStr + '</span>' +
                    '</div>' +
                    '<div class="dm-item-preview">' + escapeHtml(preview) + '</div>' +
                '</div>' +
                (badgeText ? '<span class="dm-item-badge">' + badgeText + '</span>' : '');

            el.addEventListener('click', () => openGroup(item.gid));
            el.addEventListener('contextmenu', e => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, item.gid, 'group');
            });
        }
        dmList.appendChild(el);
    }
    $$('.dm-item').forEach(el => el.classList.toggle('active',
        (el.dataset.uid === (currentDmUser && currentDmUser.uid)) ||
        (el.dataset.gid === (currentGroup && currentGroup.id))));
    dmList.scrollTop = prevScroll;
}

// ============================================================
// CONTEXT MENU
// ============================================================
function showContextMenu(x, y, id, type) {
    _contextMenuTarget = id;
    _contextMenuType = type;
    const cm = document.getElementById('contextMenu');
    if (!cm) return;
    const maxX = window.innerWidth - 220 - 8, maxY = window.innerHeight - 320 - 8;
    cm.style.left = Math.min(x, maxX) + 'px';
    cm.style.top = Math.min(y, maxY) + 'px';
    const key = type === 'dm' ? 'dm_' + id : 'group_' + id;
    const pinLabel = document.getElementById('ctxPinLabel');
    const muteLabel = document.getElementById('ctxMuteLabel');
    if (pinLabel) pinLabel.textContent = isChatPinned(key) ? 'Unpin' : t('pin');
    if (muteLabel) muteLabel.textContent = isChatMuted(key) ? 'Unmute' : t('mute');
    const removeBtn = cm.querySelector('[data-action="remove"]');
    if (removeBtn) removeBtn.style.display = type === 'dm' ? 'flex' : 'none';
    cm.classList.add('open');
}

document.querySelectorAll('#contextMenu .context-item').forEach(item => {
    item.addEventListener('click', async e => {
        e.stopPropagation();
        const action = item.dataset.action;
        const id = _contextMenuTarget;
        const type = _contextMenuType;
        document.getElementById('contextMenu').classList.remove('open');
        if (!id) return;
        const key = type === 'dm' ? 'dm_' + id : 'group_' + id;
        if (action === 'profile') { if (type === 'dm') openUserProfile(id); }
        else if (action === 'mark-read') {
            try { await unreadRef.child(userId).child(key).remove(); showToast('Marked read', 'Conversation cleared.'); } catch (err) {}
        } else if (action === 'pin') {
            try {
                const wasPinned = isChatPinned(key);
                if (wasPinned) await pinnedRef.child(userId).child(key).remove();
                else await pinnedRef.child(userId).child(key).set(true);
                showToast(wasPinned ? 'Unpinned' : 'Pinned', wasPinned ? 'Back to normal.' : 'Moved to top.');
            } catch (err) { showToast('Failed', 'Could not update pin.'); }
        } else if (action === 'mute') {
            try {
                const wasMuted = isChatMuted(key);
                if (wasMuted) await mutedRef.child(userId).child(key).remove();
                else await mutedRef.child(userId).child(key).set(true);
                showToast(wasMuted ? 'Unmuted' : 'Muted', wasMuted ? 'Notifications on.' : 'Notifications off.');
            } catch (err) { showToast('Failed', 'Could not update mute.'); }
        } else if (action === 'remove') {
            if (type === 'dm') removeFriend(id);
        } else if (action === 'delete') {
            if (type === 'dm') await deleteDmConversation(id);
            else await deleteGroupConversation(id);
        }
    });
});

// ============================================================
// DELETE CONVERSATION
// ============================================================
async function deleteDmConversation(uid) {
    const u = friendsData[uid];
    const dname = displayNameFor(uid, (u && (u.displayName || u.username)) || 'this person');
    const ok = await showModal({
        title: 'Delete conversation?',
        text: 'Messages with ' + escapeHtml(dname) + ' will be removed. You can restore from Settings → Recently Deleted for 30 days.',
        icon: 'fas fa-trash',
        danger: true,
        confirmText: 'Delete'
    });
    if (!ok) return;

    deletedDms[uid] = true;
    _lastRailHash = '';
    renderRailDms();

    try {
        const key = dmKey(userId, uid);
        const lm = lastMessages['dm_' + key];
        await deletedRef.child(userId).child('dm_' + key).set({
            type: 'dm',
            otherUid: uid,
            otherName: (u && (u.displayName || u.username)) || 'Unknown',
            otherAvatar: (u && u.avatar) || '',
            lastText: lm ? previewText(lm) : '',
            lastTs: (lm && lm.timestamp) || Date.now(),
            deletedAt: firebase.database.ServerValue.TIMESTAMP
        });
        await dmsRef.child(key).remove();
        await reactionsRef.child(key).remove();
        await unreadRef.child(userId).child('dm_' + uid).remove();
        await unreadRef.child(uid).child('dm_' + userId).remove();
        delete lastMessages['dm_' + key];
        _lastRailHash = '';
        if (currentDmUser && currentDmUser.uid === uid) {
            currentDmUser = null;
            switchView('friends');
        }
        renderRailDms();
        showToast('Deleted', 'Conversation removed. Restore from Settings.');
    } catch (err) {
        console.error('delete conversation failed:', err);
        showToast('Failed', 'Could not delete conversation.');
        delete deletedDms[uid];
        _lastRailHash = '';
        renderRailDms();
    }
}
async function deleteGroupConversation(gid) {
    const ok = await showModal({
        title: 'Leave group?',
        text: 'You will no longer see messages from this group.',
        icon: 'fas fa-sign-out-alt',
        danger: true,
        confirmText: 'Leave'
    });
    if (!ok) return;
    await groupsRef.child(gid).child('members').child(userId).remove();
    _lastRailHash = '';
    if (currentGroup && currentGroup.id === gid) {
        currentGroup = null;
        switchView('friends');
    }
    renderRailDms();
    showToast('Left group', 'You are no longer a member.');
}

// ============================================================
// RECENTLY DELETED
// ============================================================
function renderDeletedList() {
    const list = document.getElementById('deletedList');
    if (!list) return;
    const keys = Object.keys(deletedConversations);
    const now = Date.now();
    const THIRTY_DAYS = 30 * 86400000;
    const toPurge = [];
    keys.forEach(k => {
        const d = deletedConversations[k];
        if (d.deletedAt && (now - d.deletedAt) > THIRTY_DAYS) toPurge.push(k);
    });
    toPurge.forEach(k => { deletedRef.child(userId).child(k).remove(); });

    const liveKeys = keys.filter(k => !toPurge.includes(k));
    if (liveKeys.length === 0) {
        list.innerHTML = '<div class="empty-message">No deleted conversations.</div>';
        return;
    }
    list.innerHTML = '';
    liveKeys.sort((a, b) => (deletedConversations[b].deletedAt || 0) - (deletedConversations[a].deletedAt || 0));
    liveKeys.forEach(k => {
        const d = deletedConversations[k];
        const color = getColor(d.otherName || d.otherUid);
        const el = document.createElement('div');
        el.className = 'deleted-conv';
        el.innerHTML =
            (d.otherAvatar
                ? '<div class="deleted-conv-avatar" style="background-image:url(\'' + d.otherAvatar + '\');"></div>'
                : '<div class="deleted-conv-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(d.otherName || '?')) + '</div>') +
            '<div class="deleted-conv-info">' +
                '<div class="deleted-conv-name">' + escapeHtml(d.otherName || 'Conversation') + '</div>' +
                '<div class="deleted-conv-meta">Deleted ' + timeAgo(d.deletedAt || Date.now()) + (d.lastText ? ' · last: ' + escapeHtml(d.lastText.slice(0, 40)) : '') + '</div>' +
            '</div>' +
            '<div class="deleted-conv-actions">' +
                '<button class="deleted-conv-btn restore"><i class="fas fa-rotate-left"></i> Restore</button>' +
                '<button class="deleted-conv-btn purge"><i class="fas fa-trash"></i></button>' +
            '</div>';
        el.querySelector('.restore').addEventListener('click', async () => {
            if (k.indexOf('dm_') === 0 && d.otherUid) {
                delete deletedDms[d.otherUid];
                const listenKey = 'dm_' + dmKey(userId, d.otherUid);
                if (_lastMsgListeners[listenKey]) {
                    try {
                        _lastMsgListeners[listenKey].ref.off('child_added', _lastMsgListeners[listenKey].cb);
                        _lastMsgListeners[listenKey].ref.off('child_changed', _lastMsgListeners[listenKey].cb);
                    } catch (e) {}
                    delete _lastMsgListeners[listenKey];
                }
                listenLastMessages();
            }
            await deletedRef.child(userId).child(k).remove();
            _lastRailHash = '';
            renderRailDms();
            showToast('Restored', 'Conversation is back in your list.');
        });
        el.querySelector('.purge').addEventListener('click', async () => {
            const ok = await showModal({
                title: 'Delete permanently?',
                text: 'This cannot be undone.',
                icon: 'fas fa-trash',
                danger: true,
                confirmText: 'Delete Forever'
            });
            if (!ok) return;
            await deletedRef.child(userId).child(k).remove();
            showToast('Deleted', 'Removed permanently.');
        });
        list.appendChild(el);
    });
}

// END OF PART 2 — CONTINUE WITH PART 3 BELOW THIS LINE// ============================================================
// DM / GROUP HEADERS
// ============================================================
function updateDmHeader() {
    if (!currentDmUser) return;
    const u = friendsData[currentDmUser.uid];
    if (!u) return;
    const dname = displayNameFor(currentDmUser.uid, u.displayName || u.username);
    const color = getColor(u.displayName || u.username);
    const hn = document.getElementById('dmHeaderName');
    const ha = document.getElementById('dmHeaderAvatar');
    const hs = document.getElementById('dmHeaderStatus');
    if (hn) hn.textContent = dname;
    if (ha) {
        if (u.avatar) {
            ha.style.backgroundImage = 'url(\'' + u.avatar + '\')';
            ha.style.backgroundSize = 'cover';
            ha.style.backgroundPosition = 'center';
            ha.textContent = '';
        } else {
            ha.style.backgroundImage = '';
            ha.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
            ha.textContent = getInitial(dname);
        }
    }
    if (hs) {
        hs.textContent = statusLabel(currentDmUser.uid);
        hs.className = 'dm-header-status ' + (isUserOnline(currentDmUser.uid) ? 'online' : '');
    }
}
function updateGroupHeader() {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;
    const hn = document.getElementById('groupHeaderName');
    const hm = document.getElementById('groupHeaderMembers');
    const ha = document.getElementById('groupHeaderAvatar');
    if (hn) hn.textContent = g.name || 'Group';
    const mc = Object.keys(g.members || {}).length;
    if (hm) hm.textContent = mc + ' member' + (mc > 1 ? 's' : '');
    if (ha) {
        if (g.photo) {
            ha.style.backgroundImage = 'url(\'' + g.photo + '\')';
            ha.style.backgroundSize = 'cover';
            ha.style.backgroundPosition = 'center';
            ha.innerHTML = '';
        } else {
            ha.style.backgroundImage = '';
            ha.style.background = 'linear-gradient(135deg, #6ec2a8, #4a8b7a)';
            ha.innerHTML = '<i class="fas fa-users"></i>';
        }
    }
}
function clearDmReply() { dmReplyTo = null; const p = document.getElementById('dmReplyPreview'); if (p) p.style.display = 'none'; }
function clearGroupReply() { groupReplyTo = null; const p = document.getElementById('groupReplyPreview'); if (p) p.style.display = 'none'; }
function cancelDmEdit() { dmEditingId = null; const b = document.getElementById('dmEditBar'); if (b) b.style.display = 'none'; const i = document.getElementById('dmInput'); if (i) i.value = ''; }
function cancelGroupEdit() { groupEditingId = null; const b = document.getElementById('groupEditBar'); if (b) b.style.display = 'none'; const i = document.getElementById('groupInput'); if (i) i.value = ''; }

// ============================================================
// OPEN DM
// ============================================================
async function openDM(uid, dname, userData) {
    currentDmUser = { uid, displayName: dname };
    currentGroup = null;
    if (!friendsData[uid] && userData) friendsData[uid] = userData;
    updateDmHeader();
    switchView('dm');
    const sb = document.getElementById('dmSearchBar');
    if (sb) sb.style.display = 'none';
    clearDmReply();
    cancelDmEdit();
    await unreadRef.child(userId).child('dm_' + uid).remove();
    if (window._dmCurrentListener) {
        try { window._dmCurrentListener.ref.off('child_added', window._dmCurrentListener.cb); } catch (e) {}
    }
    if (window._dmReactionsListener) {
        try { window._dmReactionsListener.ref.off('value', window._dmReactionsListener.cb); } catch (e) {}
    }
    const dmMessages = document.getElementById('dmMessages');
    dmMessages.innerHTML = '';
    dmLastMsgs = [];
    dmReactions = {};
    const key = dmKey(userId, uid);
    const ref = dmsRef.child(key).child('messages');
    const rRef = reactionsRef.child(key);
    const rCb = snap => {
        dmReactions = snap.val() || {};
        updateAllReactionsIn(dmMessages, dmReactions);
    };
    rRef.on('value', rCb);
    window._dmReactionsListener = { ref: rRef, cb: rCb };
    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        if (msg.userId !== userId && blockedUsers[msg.userId]) return;
        msg._id = snap.key;
        const existing = dmMessages.querySelector('[data-msg-id="' + snap.key + '"]');
        if (existing) {
            const textEl = existing.querySelector('.msg-text');
            if (textEl && msg.text != null) textEl.textContent = msg.text;
            existing.dataset.msgText = msg.text || '';
            const header = existing.querySelector('.msg-header');
            if (msg.edited && !header.querySelector('.msg-edited')) {
                const s = document.createElement('span');
                s.className = 'msg-edited';
                s.textContent = '(edited)';
                header.appendChild(s);
            }
            return;
        }
        dmLastMsgs.push(msg);
        renderDmMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('dm_' + uid)) playNotifSound();
        }
    };
    ref.limitToLast(80).on('child_added', cb);
    window._dmCurrentListener = { ref, cb };

    typingRef.child(key).on('value', snap => {
        const tObj = snap.val();
        const typing = document.getElementById('dmTyping');
        if (!typing) return;
        if (!tObj) { typing.textContent = ''; return; }
        const typers = Object.keys(tObj).filter(k => k !== userId);
        if (typers.length > 0) {
            typing.innerHTML = escapeHtml(dname) + ' is typing<span>.</span><span>.</span><span>.</span>';
        } else {
            typing.textContent = '';
        }
    });

    await loadDraft('dm_' + uid, document.getElementById('dmInput'));
    const di = document.getElementById('dmInput');
    if (di) di.focus();
    _lastRailHash = '';
    renderRailDms();
}

// ============================================================
// CHAT PROFILE TAB
// ============================================================
function openChatProfile() {
    if (!currentDmUser) return;
    const u = friendsData[currentDmUser.uid];
    if (!u) return;
    const dname = displayNameFor(currentDmUser.uid, u.displayName || u.username);
    const cpa = document.getElementById('chatProfileAvatar');
    if (u.avatar) {
        cpa.style.backgroundImage = 'url(\'' + u.avatar + '\')';
        cpa.style.backgroundSize = 'cover';
        cpa.style.backgroundPosition = 'center';
        cpa.textContent = '';
    } else {
        const color = getColor(u.displayName || u.username);
        cpa.style.backgroundImage = '';
        cpa.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
        cpa.textContent = getInitial(dname);
    }
    document.getElementById('chatProfileName').textContent = dname;
    updateChatProfileStatus();
    document.getElementById('cpNicknameValue').textContent = nicknames[currentDmUser.uid] || 'No nickname';
    const key = 'dm_' + currentDmUser.uid;
    const muted = isChatMuted(key);
    const muteBtn = document.getElementById('cpActionMute');
    if (muteBtn) {
        const i = muteBtn.querySelector('i');
        const s = muteBtn.querySelector('span');
        if (i) i.className = muted ? 'fas fa-bell-slash' : 'fas fa-bell';
        if (s) s.textContent = muted ? 'Unmute' : t('mute');
    }
    switchView('chatProfile');
}
function updateChatProfileStatus() {
    if (!currentDmUser) return;
    const el = document.getElementById('chatProfileStatus');
    if (!el) return;
    el.textContent = statusLabel(currentDmUser.uid);
    el.classList.toggle('offline', !isUserOnline(currentDmUser.uid));
}

on('#dmHeaderClickable', 'click', () => { if (currentDmUser) openChatProfile(); });
on('#groupHeaderClickable', 'click', () => { if (currentGroup) openGroupSettings(); });
on('#chatProfileBack', 'click', () => { if (currentDmUser) switchView('dm'); else switchView('friends'); });
on('#cpActionProfile', 'click', () => { if (currentDmUser) openUserProfile(currentDmUser.uid); });
on('#cpActionSearch', 'click', () => {
    if (!currentDmUser) return;
    switchView('dm');
    document.getElementById('dmSearchBar').style.display = 'flex';
    document.getElementById('dmSearchInput').focus();
});
on('#cpActionMute', 'click', async () => {
    if (!currentDmUser) return;
    const key = 'dm_' + currentDmUser.uid;
    const wasMuted = isChatMuted(key);
    if (wasMuted) await mutedRef.child(userId).child(key).remove();
    else await mutedRef.child(userId).child(key).set(true);
    showToast(wasMuted ? 'Unmuted' : 'Muted', wasMuted ? 'Notifications on.' : 'Notifications off.');
    openChatProfile();
});
on('#cpActionOptions', 'click', e => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const m = document.getElementById('chatOptionsMenu');
    m.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
    m.style.top = (rect.bottom + 6) + 'px';
    updateChatOptionsLabels();
    m.classList.add('open');
});

// CHAT OPTIONS MENU
function updateChatOptionsLabels() {
    if (!currentDmUser) return;
    const uid = currentDmUser.uid;
    const isBlocked = !!blockedUsers[uid];
    const label = document.getElementById('chatBlockLabel');
    const btn = document.getElementById('chatBlockBtn');
    if (label) label.textContent = isBlocked ? t('unblockUser') : t('blockUser');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) icon.className = isBlocked ? 'fas fa-unlock' : 'fas fa-ban';
        btn.classList.toggle('danger', !isBlocked);
    }
}

document.querySelectorAll('#chatOptionsMenu .context-item').forEach(item => {
    item.addEventListener('click', async e => {
        e.stopPropagation();
        document.getElementById('chatOptionsMenu').classList.remove('open');
        const action = item.dataset.cpAction;
        const uid = currentDmUser ? currentDmUser.uid : null;
        if (!uid) return;
        if (action === 'search') {
            switchView('dm');
            document.getElementById('dmSearchBar').style.display = 'flex';
            document.getElementById('dmSearchInput').focus();
        } else if (action === 'view-profile') openUserProfile(uid);
        else if (action === 'block') {
            const isBlocked = !!blockedUsers[uid];
            if (isBlocked) {
                await blockedRef.child(userId).child(uid).remove();
                showToast('Unblocked', 'They can message you again.');
            } else {
                const ok = await showModal({
                    title: 'Block user?',
                    text: 'You will no longer receive messages from them.',
                    icon: 'fas fa-ban',
                    danger: true,
                    confirmText: 'Block'
                });
                if (!ok) return;
                await blockedRef.child(userId).child(uid).set(true);
                showToast('Blocked', 'They can no longer message you.');
                const dmMessages = document.getElementById('dmMessages');
                if (dmMessages) dmMessages.innerHTML = '';
                if (currentDmUser && currentDmUser.uid === uid) {
                    currentDmUser = null;
                    switchView('friends');
                }
            }
            _lastRailHash = '';
            renderRailDms();
            renderAllFriends();
        } else if (action === 'report') {
            const reason = await showModal({
                title: 'Report user',
                text: 'Why are you reporting this user?',
                icon: 'fas fa-flag',
                input: true,
                inputPlaceholder: 'Describe the issue...',
                confirmText: 'Submit'
            });
            if (!reason) return;
            await reportsRef.push({
                reporter: userId,
                reported: uid,
                reason: String(reason),
                at: firebase.database.ServerValue.TIMESTAMP
            });
            showToast('Reported', 'Thank you. We will review this.');
        } else if (action === 'delete') {
            await deleteDmConversation(uid);
        }
    });
});

on('#cpRowNickname', 'click', () => {
    if (!currentDmUser) return;
    document.getElementById('nicknameInput').value = nicknames[currentDmUser.uid] || '';
    document.getElementById('nicknameModal').classList.add('open');
    setTimeout(() => {
        const n = document.getElementById('nicknameInput');
        if (n) n.focus();
    }, 100);
});
on('#nicknameClose', 'click', () => document.getElementById('nicknameModal').classList.remove('open'));
on('#nicknameSaveBtn', 'click', async () => {
    if (!currentDmUser) return;
    const uid = currentDmUser.uid;
    const val = document.getElementById('nicknameInput').value.trim();
    if (val) await nicknamesRef.child(userId).child(uid).set(val);
    else await nicknamesRef.child(userId).child(uid).remove();
    document.getElementById('nicknameModal').classList.remove('open');
    showToast('Nickname saved', 'Updated for you only.');
    openChatProfile();
});
on('#nicknameClearBtn', 'click', async () => {
    if (!currentDmUser) return;
    await nicknamesRef.child(userId).child(currentDmUser.uid).remove();
    document.getElementById('nicknameInput').value = '';
    document.getElementById('nicknameModal').classList.remove('open');
    showToast('Nickname cleared', 'Display name restored.');
    openChatProfile();
});
on('#cpRowDisappearing', 'click', () => showToast('Coming soon', 'Disappearing messages will arrive in a future update.'));
on('#cpRowPrivacy', 'click', () => showToast('Privacy', 'Open Settings → Blocked to manage blocked users.'));

// ============================================================
// USER PROFILE PAGE
// ============================================================
async function openUserProfile(uid) {
    if (!uid) return;
    currentProfileViewUid = uid;
    switchView('userProfile');

    const bannerEl = document.getElementById('upBanner');
    const avatarEl = document.getElementById('upAvatar');
    const nameEl = document.getElementById('upDisplayName');
    const unameEl = document.getElementById('upUsername');
    const joinedEl = document.getElementById('upJoined');
    const bioEl = document.getElementById('upBio');
    const actionsEl = document.getElementById('upActions');

    bannerEl.style.backgroundImage = '';
    bannerEl.style.background = 'linear-gradient(135deg, #6ec2a8, #4a8b7a)';
    avatarEl.style.backgroundImage = '';
    avatarEl.style.background = 'linear-gradient(135deg, #6ec2a8, #4a8b7a)';
    avatarEl.textContent = '…';
    nameEl.textContent = '…';
    unameEl.textContent = '@…';
    joinedEl.innerHTML = '<i class="fas fa-calendar"></i> ' + t('joined') + ' recently';
    bioEl.textContent = 'No bio yet';
    actionsEl.innerHTML = '';

    // If cached (friend or self), render immediately
    let data = null;
    if (uid === userId && currentProfile) {
        data = {
            username: currentProfile.username,
            displayName: currentProfile.displayName,
            bio: currentProfile.bio,
            avatar: currentProfile.avatar,
            banner: currentProfile.banner,
            createdAt: currentProfile.joined
        };
    } else if (friendsData[uid]) {
        data = friendsData[uid];
    }

    if (data) {
        renderUserProfilePage(uid, data);
        buildUserProfileActions(uid, displayNameFor(uid, data.displayName || data.username), data);
        updateBlockLabels(uid);
    }

    // Fetch latest from DB
    try {
        const snap = await usersRef.child(uid).once('value');
        const fresh = snap.val();
        if (!fresh) {
            nameEl.textContent = 'User not found';
            return;
        }
        if (uid !== userId) friendsData[uid] = fresh;
        renderUserProfilePage(uid, fresh);
        buildUserProfileActions(uid, displayNameFor(uid, fresh.displayName || fresh.username), fresh);
        updateBlockLabels(uid);
    } catch (err) {
        console.error('openUserProfile:', err);
        if (!data) nameEl.textContent = 'Error loading profile';
    }
}

function buildUserProfileActions(uid, dname, data) {
    const actionsEl = document.getElementById('upActions');
    if (!actionsEl) return;
    actionsEl.innerHTML = '';

    const isSelf = uid === userId;
    const isFriend = friends.includes(uid);
    const isFav = isUserFavorited(uid);

    if (isSelf) {
        const editBtn = document.createElement('button');
        editBtn.className = 'up-action-btn primary';
        editBtn.innerHTML = '<i class="fas fa-pen"></i> ' + t('editProfile');
        editBtn.onclick = () => openEditProfile();
        actionsEl.appendChild(editBtn);
        const menuBtn = document.getElementById('userProfileMenuBtn');
        if (menuBtn) menuBtn.style.display = 'none';
        return;
    }

    const menuBtn = document.getElementById('userProfileMenuBtn');
    if (menuBtn) menuBtn.style.display = '';

    const msgBtn = document.createElement('button');
    msgBtn.className = 'up-action-btn primary';
    msgBtn.innerHTML = '<i class="fas fa-comment"></i> ' + t('message');
    msgBtn.onclick = () => {
        switchView('dm');
        openDM(uid, dname, data);
    };
    actionsEl.appendChild(msgBtn);

    const favBtn = document.createElement('button');
    favBtn.className = 'up-action-btn' + (isFav ? ' favorited' : '');
    favBtn.innerHTML = isFav
        ? '<i class="fas fa-star"></i> ' + t('removeFromFavorites')
        : '<i class="far fa-star"></i> ' + t('addToFavorites');
    favBtn.onclick = async () => {
        await toggleFavorite(uid);
        refreshUserProfileActions(uid);
    };
    actionsEl.appendChild(favBtn);

    if (isFriend) {
        const unfriendBtn = document.createElement('button');
        unfriendBtn.className = 'up-action-btn danger';
        unfriendBtn.innerHTML = '<i class="fas fa-user-minus"></i> ' + t('unfriend');
        unfriendBtn.onclick = async () => {
            await removeFriend(uid);
            refreshUserProfileActions(uid);
        };
        actionsEl.appendChild(unfriendBtn);
    } else {
        friendRequestsRef.child(userId).child(uid).once('value').then(recvSnap => {
            friendRequestsRef.child('sent_' + userId).child(uid).once('value').then(sentSnap => {
                if (recvSnap.exists()) {
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'up-action-btn primary';
                    acceptBtn.innerHTML = '<i class="fas fa-check"></i> Accept';
                    acceptBtn.onclick = async () => {
                        await acceptFriendRequest(uid);
                        refreshUserProfileActions(uid);
                    };
                    actionsEl.appendChild(acceptBtn);
                } else if (sentSnap.exists()) {
                    const pendingBtn = document.createElement('button');
                    pendingBtn.className = 'up-action-btn';
                    pendingBtn.disabled = true;
                    pendingBtn.innerHTML = '<i class="fas fa-clock"></i> Pending';
                    actionsEl.appendChild(pendingBtn);
                } else {
                    const addBtn = document.createElement('button');
                    addBtn.className = 'up-action-btn';
                    addBtn.innerHTML = '<i class="fas fa-user-plus"></i> Add Friend';
                    addBtn.onclick = async () => {
                        await sendFriendRequest(uid);
                        refreshUserProfileActions(uid);
                    };
                    actionsEl.appendChild(addBtn);
                }
            });
        });
    }
}

function refreshUserProfileActions(uid) {
    if (!uid) return;
    usersRef.child(uid).once('value').then(snap => {
        const data = snap.val();
        if (!data) return;
        const dname = displayNameFor(uid, data.displayName || data.username);
        buildUserProfileActions(uid, dname, data);
        const favLabel = document.getElementById('upFavoriteLabel');
        if (favLabel) favLabel.textContent = isUserFavorited(uid) ? t('removeFromFavorites') : t('addToFavorites');
        updateBlockLabels(uid);
    });
}

function updateBlockLabels(uid) {
    if (!uid) return;
    const isBlocked = !!blockedUsers[uid];
    const label = document.getElementById('profileBlockLabel');
    const btn = document.getElementById('profileBlockBtn');
    if (label) label.textContent = isBlocked ? t('unblockUser') : t('blockUser');
    if (btn) {
        const icon = btn.querySelector('i');
        if (icon) icon.className = isBlocked ? 'fas fa-unlock' : 'fas fa-ban';
        btn.classList.toggle('danger', !isBlocked);
    }
}

on('#userProfileBack', 'click', () => {
    currentProfileViewUid = null;
    if (currentDmUser) switchView('dm');
    else switchView('friends');
});

on('#userProfileMenuBtn', 'click', e => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const m = document.getElementById('userProfileMenu');
    m.style.left = Math.min(rect.right - 210, window.innerWidth - 220) + 'px';
    m.style.top = (rect.bottom + 6) + 'px';
    const favLabel = document.getElementById('upFavoriteLabel');
    if (favLabel && currentProfileViewUid) {
        favLabel.textContent = isUserFavorited(currentProfileViewUid) ? t('removeFromFavorites') : t('addToFavorites');
    }
    updateBlockLabels(currentProfileViewUid);
    m.classList.add('open');
});

document.querySelectorAll('#userProfileMenu .context-item').forEach(item => {
    item.addEventListener('click', async e => {
        e.stopPropagation();
        document.getElementById('userProfileMenu').classList.remove('open');
        const action = item.dataset.upAction;
        const uid = currentProfileViewUid;
        if (!uid) return;
        const u = friendsData[uid] || {};

        if (action === 'message') {
            switchView('dm');
            openDM(uid, displayNameFor(uid, u.displayName || u.username), u);
        } else if (action === 'favorite') {
            await toggleFavorite(uid);
            refreshUserProfileActions(uid);
        } else if (action === 'copy') {
            const uname = u.username || '';
            try {
                await navigator.clipboard.writeText('@' + uname);
                showToast('Copied', 'Username copied.');
            } catch (err) {
                showToast('Could not copy', '');
            }
        } else if (action === 'block') {
            const isBlocked = !!blockedUsers[uid];
            if (isBlocked) {
                await blockedRef.child(userId).child(uid).remove();
                showToast('Unblocked', 'They can message you again.');
            } else {
                const ok = await showModal({
                    title: 'Block user?',
                    text: 'You will no longer receive messages from them.',
                    icon: 'fas fa-ban',
                    danger: true,
                    confirmText: 'Block'
                });
                if (!ok) return;
                await blockedRef.child(userId).child(uid).set(true);
                showToast('Blocked', 'They can no longer message you.');
                if (currentDmUser && currentDmUser.uid === uid) {
                    currentDmUser = null;
                    switchView('friends');
                }
            }
            _lastRailHash = '';
            renderRailDms();
            renderAllFriends();
            refreshUserProfileActions(uid);
        } else if (action === 'report') {
            const reason = await showModal({
                title: 'Report user',
                text: 'Why are you reporting this user?',
                icon: 'fas fa-flag',
                input: true,
                inputPlaceholder: 'Describe the issue...',
                confirmText: 'Submit'
            });
            if (!reason) return;
            await reportsRef.push({
                reporter: userId,
                reported: uid,
                reason: String(reason),
                at: firebase.database.ServerValue.TIMESTAMP
            });
            showToast('Reported', 'Thank you.');
        }
    });
});

// ============================================================
// MESSAGE HTML BUILDER
// ============================================================
function buildMessageHTML(msg) {
    const isOwn = msg.userId === userId;
    const time = formatTime(msg.timestamp);
    const senderData = isOwn ? (currentProfile || {}) : (friendsData[msg.userId] || msg);
    const color = getColor(msg.displayName || msg.user);
    const senderAvatar = (senderData && senderData.avatar) || msg.avatar || '';
    let avatarStyle, avatarContent;
    if (senderAvatar) {
        avatarStyle = 'background-image: url(\'' + senderAvatar + '\'); background-size: cover; background-position: center;';
        avatarContent = '';
    } else {
        avatarStyle = 'background: linear-gradient(135deg, ' + color + ', ' + color + 'cc);';
        avatarContent = getInitial(msg.displayName || msg.user);
    }
    let contentHtml = '';
    if (msg.type === 'image') contentHtml = '<div class="msg-media" data-action="lightbox" data-src="' + msg.data + '"><img src="' + msg.data + '" loading="lazy" /></div>';
    else if (msg.type === 'file') contentHtml = '<a class="msg-file" href="' + msg.data + '" download="' + escapeHtml(msg.fileName || 'file') + '"><i class="fas fa-file"></i><div class="file-info"><span class="file-name">' + escapeHtml(msg.fileName || 'File') + '</span><span class="file-size">' + formatBytes(msg.fileSize || 0) + '</span></div></a>';
    else if (msg.type === 'voice') contentHtml = '<div class="msg-voice"><button class="voice-play" data-action="voice" data-src="' + msg.data + '"><i class="fas fa-play"></i></button><div class="voice-wave">' + generateWaveBars() + '</div><span class="voice-time">' + formatDuration(msg.duration || 0) + '</span></div>';
    else contentHtml = '<div class="msg-text">' + escapeHtml(msg.text || '') + '</div>';
    return { isOwn, time, avatarStyle, avatarContent, contentHtml };
}
function buildQuoteHtml(replyTo) {
    if (!replyTo) return '';
    return '<div class="msg-quote" data-action="scroll-to" data-quote-id="' + escapeHtml(replyTo.id || '') + '"><div class="msg-quote-body"><span class="msg-quote-name">' + escapeHtml(replyTo.name || 'Unknown') + '</span><span class="msg-quote-text">' + escapeHtml(replyTo.text || '') + '</span></div></div>';
}
function buildReactionsHtml(messageId, reactionsMap) {
    const r = reactionsMap[messageId];
    if (!r) return '';
    const entries = Object.entries(r);
    if (entries.length === 0) return '';
    let html = '<div class="msg-reactions">';
    for (const entry of entries) {
        const emoji = entry[0], users = entry[1];
        const uids = Object.keys(users || {});
        if (uids.length === 0) continue;
        const mine = uids.includes(userId);
        html += '<button class="reaction-chip' + (mine ? ' mine' : '') + '" data-action="toggle-reaction" data-emoji="' + emoji + '" data-msg-id="' + messageId + '"><span>' + emoji + '</span><span class="reaction-count">' + uids.length + '</span></button>';
    }
    html += '</div>';
    return html;
}
function updateAllReactionsIn(container, reactionsMap) {
    if (!container) return;
    container.querySelectorAll('.message').forEach(el => {
        const id = el.dataset.msgId;
        const existing = el.querySelector('.msg-reactions');
        const newHtml = buildReactionsHtml(id, reactionsMap);
        if (existing) existing.remove();
        if (newHtml) {
            const c = el.querySelector('.msg-content');
            if (c) c.insertAdjacentHTML('beforeend', newHtml);
        }
    });
}

// ============================================================
// RENDER MESSAGES
// ============================================================
function renderDmMessage(msg) {
    if (msg.userId !== userId && blockedUsers[msg.userId]) return;
    const built = buildMessageHTML(msg);
    const { isOwn, time, avatarStyle, avatarContent, contentHtml } = built;
    const dmMessages = document.getElementById('dmMessages');
    if (!dmMessages) return;
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');

    if (dateSeparatorsEnabled) {
        const last = dmMessages.lastElementChild;
        const lastTs = last ? last.dataset.ts : null;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            dmMessages.appendChild(sep);
        }
    }
    const quoteHtml = buildQuoteHtml(msg.replyTo);
    const reactionsHtml = buildReactionsHtml(msg._id, dmReactions);
    const editedMark = msg.edited ? '<span class="msg-edited">(edited)</span>' : '';

    div.dataset.ts = msg.timestamp;
    div.dataset.msgId = msg._id || '';
    div.dataset.msgType = msg.type || 'text';
    div.dataset.msgText = msg.text || '';
    div.dataset.msgFileName = msg.fileName || '';
    div.dataset.source = 'dm';

    div.innerHTML =
        '<div class="msg-avatar" style="' + avatarStyle + '">' + avatarContent + '</div>' +
        '<div class="msg-content">' +
            '<div class="msg-header"><span class="name">' + escapeHtml(msg.displayName || msg.user) + '</span><span class="time">' + time + '</span>' + editedMark + '</div>' +
            quoteHtml + contentHtml + reactionsHtml +
        '</div>' +
        '<div class="msg-actions">' +
            '<button class="msg-action-btn react-btn" data-msg-action="react" title="React"><i class="fas fa-face-smile"></i></button>' +
            '<button class="msg-action-btn" data-msg-action="reply" title="Reply"><i class="fas fa-reply"></i></button>' +
            '<button class="msg-action-btn" data-msg-action="copy" title="Copy"><i class="fas fa-copy"></i></button>' +
            (isOwn ? '<button class="msg-action-btn" data-msg-action="edit" title="Edit"><i class="fas fa-pen"></i></button>' : '') +
            (isOwn ? '<button class="msg-action-btn danger" data-msg-action="delete" title="Delete"><i class="fas fa-trash"></i></button>' : '') +
        '</div>';

    dmMessages.appendChild(div);
    const nearBottom = dmMessages.scrollHeight - dmMessages.scrollTop - dmMessages.clientHeight < 120;
    if (nearBottom || msg.userId === userId) dmMessages.scrollTop = dmMessages.scrollHeight;
}
function renderGroupMessage(msg) {
    if (msg.userId !== userId && blockedUsers[msg.userId]) return;
    const built = buildMessageHTML(msg);
    const { isOwn, time, avatarStyle, avatarContent, contentHtml } = built;
    const gm = document.getElementById('groupMessages');
    if (!gm) return;
    const div = document.createElement('div');
    div.className = 'message' + (isOwn ? ' own' : '');

    if (dateSeparatorsEnabled) {
        const last = gm.lastElementChild;
        const lastTs = last ? last.dataset.ts : null;
        if (!lastTs || dayKey(parseInt(lastTs)) !== dayKey(msg.timestamp)) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateLabel(msg.timestamp);
            gm.appendChild(sep);
        }
    }
    const quoteHtml = buildQuoteHtml(msg.replyTo);
    const reactionsHtml = buildReactionsHtml(msg._id, groupReactions);
    const editedMark = msg.edited ? '<span class="msg-edited">(edited)</span>' : '';

    div.dataset.ts = msg.timestamp;
    div.dataset.msgId = msg._id || '';
    div.dataset.msgType = msg.type || 'text';
    div.dataset.msgText = msg.text || '';
    div.dataset.msgFileName = msg.fileName || '';
    div.dataset.source = 'group';

    div.innerHTML =
        '<div class="msg-avatar" style="' + avatarStyle + '">' + avatarContent + '</div>' +
        '<div class="msg-content">' +
            '<div class="msg-header"><span class="name">' + escapeHtml(msg.displayName || msg.user) + '</span><span class="time">' + time + '</span>' + editedMark + '</div>' +
            quoteHtml + contentHtml + reactionsHtml +
        '</div>' +
        '<div class="msg-actions">' +
            '<button class="msg-action-btn react-btn" data-msg-action="react" title="React"><i class="fas fa-face-smile"></i></button>' +
            '<button class="msg-action-btn" data-msg-action="reply" title="Reply"><i class="fas fa-reply"></i></button>' +
            '<button class="msg-action-btn" data-msg-action="copy" title="Copy"><i class="fas fa-copy"></i></button>' +
            (isOwn ? '<button class="msg-action-btn" data-msg-action="edit" title="Edit"><i class="fas fa-pen"></i></button>' : '') +
            (isOwn ? '<button class="msg-action-btn danger" data-msg-action="delete" title="Delete"><i class="fas fa-trash"></i></button>' : '') +
        '</div>';

    gm.appendChild(div);
    const nearBottom = gm.scrollHeight - gm.scrollTop - gm.clientHeight < 120;
    if (nearBottom || msg.userId === userId) gm.scrollTop = gm.scrollHeight;
}

// ============================================================
// DELEGATED MESSAGE CLICKS
// ============================================================
document.addEventListener('click', async e => {
    const lightboxEl = e.target.closest('[data-action="lightbox"]');
    if (lightboxEl) { e.stopPropagation(); window.openLightbox(lightboxEl.dataset.src); return; }
    const voiceEl = e.target.closest('[data-action="voice"]');
    if (voiceEl) { e.stopPropagation(); window.playVoice(voiceEl, voiceEl.dataset.src); return; }

    const chip = e.target.closest('[data-action="toggle-reaction"]');
    if (chip) {
        e.stopPropagation();
        const parentMsg = chip.closest('.message');
        const source = parentMsg ? parentMsg.dataset.source : null;
        await toggleReaction(source, chip.dataset.msgId, chip.dataset.emoji);
        return;
    }
    const quoteEl = e.target.closest('[data-action="scroll-to"]');
    if (quoteEl) {
        const qid = quoteEl.dataset.quoteId;
        if (!qid) return;
        const target = document.querySelector('.message[data-msg-id="' + qid + '"]');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const old = target.style.background;
            target.style.background = 'var(--accent-wash)';
            setTimeout(() => { target.style.background = old; }, 900);
        }
        return;
    }
    const btn = e.target.closest('[data-msg-action]');
    if (!btn) return;
    const msgEl = btn.closest('.message');
    if (!msgEl) return;
    const action = btn.dataset.msgAction;
    const source = msgEl.dataset.source;
    const msgId = msgEl.dataset.msgId;
    const msgText = msgEl.dataset.msgText;
    const msgFileName = msgEl.dataset.msgFileName;
    const msgType = msgEl.dataset.msgType;

    if (action === 'copy') {
        const text = msgText || msgFileName || ('[' + msgType + ']');
        let copied = false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                copied = true;
            }
        } catch (err) {}
        if (!copied) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); copied = true; } catch (err2) {}
            ta.remove();
        }
        showToast(copied ? 'Copied' : 'Could not copy', copied ? 'Message copied to clipboard.' : 'Your browser blocked clipboard access.');
    } else if (action === 'reply') {
        const nameEl = msgEl.querySelector('.msg-header .name');
        const name = nameEl ? nameEl.textContent : 'Unknown';
        const quoteText = msgText || previewText({ type: msgType, fileName: msgFileName, text: msgText });
        const replyObj = { id: msgId, name: name, text: quoteText };
        if (source === 'dm') {
            dmReplyTo = replyObj;
            document.getElementById('dmReplyName').textContent = name;
            document.getElementById('dmReplyText').textContent = quoteText;
            document.getElementById('dmReplyPreview').style.display = 'flex';
            document.getElementById('dmInput').focus();
        } else {
            groupReplyTo = replyObj;
            document.getElementById('groupReplyName').textContent = name;
            document.getElementById('groupReplyText').textContent = quoteText;
            document.getElementById('groupReplyPreview').style.display = 'flex';
            document.getElementById('groupInput').focus();
        }
    } else if (action === 'edit') {
        if (msgType !== 'text') { showToast('Cannot edit', 'Only text messages can be edited.'); return; }
        if (source === 'dm') {
            cancelDmEdit();
            dmEditingId = msgId;
            document.getElementById('dmEditBar').style.display = 'flex';
            document.getElementById('dmEditText').textContent = msgText;
            document.getElementById('dmInput').value = msgText;
            document.getElementById('dmInput').focus();
        } else {
            cancelGroupEdit();
            groupEditingId = msgId;
            document.getElementById('groupEditBar').style.display = 'flex';
            document.getElementById('groupEditText').textContent = msgText;
            document.getElementById('groupInput').value = msgText;
            document.getElementById('groupInput').focus();
        }
    } else if (action === 'react') {
        if (!reactionsEnabled) return;
        currentReactionMsgEl = msgEl;
        const rect = btn.getBoundingClientRect();
        const rp = document.getElementById('reactionPicker');
        rp.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
        rp.style.top = (rect.top - 46) + 'px';
        rp.classList.add('open');
    } else if (action === 'delete') {
        const ok = await showModal({
            title: 'Delete message?',
            text: 'This deletes the message for everyone in the conversation.',
            icon: 'fas fa-trash',
            danger: true,
            confirmText: 'Delete'
        });
        if (!ok) return;
        try {
            if (source === 'dm' && currentDmUser) {
                const key = dmKey(userId, currentDmUser.uid);
                await dmsRef.child(key).child('messages').child(msgId).remove();
                await reactionsRef.child(key).child(msgId).remove();
            } else if (source === 'group' && currentGroup) {
                await groupsRef.child(currentGroup.id).child('messages').child(msgId).remove();
                await reactionsRef.child('group_' + currentGroup.id).child(msgId).remove();
            }
            msgEl.remove();
            showToast('Deleted', 'Message removed.');
        } catch (err) {
            showToast('Failed', 'Could not delete message.');
        }
    }
});

// REACTIONS
async function toggleReaction(source, msgId, emoji) {
    if (!msgId) return;
    let ref;
    if (source === 'dm' && currentDmUser) ref = reactionsRef.child(dmKey(userId, currentDmUser.uid)).child(msgId).child(emoji);
    else if (source === 'group' && currentGroup) ref = reactionsRef.child('group_' + currentGroup.id).child(msgId).child(emoji);
    else return;
    const snap = await ref.child(userId).once('value');
    if (snap.exists()) await ref.child(userId).remove();
    else await ref.child(userId).set(true);
}
document.querySelectorAll('#reactionPicker .reaction-option').forEach(opt => {
    opt.addEventListener('click', async e => {
        e.stopPropagation();
        if (!currentReactionMsgEl) return;
        const emoji = opt.dataset.emoji;
        const source = currentReactionMsgEl.dataset.source;
        const msgId = currentReactionMsgEl.dataset.msgId;
        document.getElementById('reactionPicker').classList.remove('open');
        await toggleReaction(source, msgId, emoji);
    });
});

// ============================================================
// SEND DM
// ============================================================
async function sendDm() {
    const dmInput = document.getElementById('dmInput');
    const text = dmInput.value.trim();
    if (!text && !pendingFile) return;

    if (currentDmUser && blockedUsers[currentDmUser.uid]) {
        showToast('Blocked', 'You have blocked this user. Unblock to send messages.');
        return;
    }

    if (dmEditingId) {
        if (!text) return;
        try {
            const key = dmKey(userId, currentDmUser.uid);
            await dmsRef.child(key).child('messages').child(dmEditingId).update({
                text: text, edited: true, editedAt: Date.now()
            });
            const el = document.querySelector('.message[data-msg-id="' + dmEditingId + '"]');
            if (el) {
                const tEl = el.querySelector('.msg-text');
                if (tEl) tEl.textContent = text;
                el.dataset.msgText = text;
                const h = el.querySelector('.msg-header');
                if (!h.querySelector('.msg-edited')) {
                    const s = document.createElement('span');
                    s.className = 'msg-edited';
                    s.textContent = '(edited)';
                    h.appendChild(s);
                }
            }
            cancelDmEdit();
            showToast('Edited', 'Message updated.');
        } catch (e) { showToast('Failed', 'Could not edit message.'); }
        return;
    }
    if (pendingFile) { sendDmMedia(); return; }

    const key = dmKey(userId, currentDmUser.uid);
    const msg = {
        user: username, displayName: displayName, text: text,
        color: getColor(displayName),
        avatar: (currentProfile && currentProfile.avatar) || '',
        timestamp: Date.now(), userId: userId, type: 'text'
    };
    if (dmReplyTo) msg.replyTo = dmReplyTo;
    dmInput.value = '';
    dmInput.focus();
    stopTyping();
    clearDraft('dm_' + currentDmUser.uid);
    clearDmReply();
    try {
        await dmsRef.child(key).child('messages').push(msg);
        await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
    } catch (e) {}
}
async function sendDmMedia() {
    if (!pendingFile) return;
    if (pendingFile.size > 5000 * 1024) {
        showModal({ title: 'File too large', text: 'Files must be under 5 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        const key = dmKey(userId, currentDmUser.uid);
        const msg = {
            type: pendingType, user: username, displayName: displayName,
            color: getColor(displayName),
            avatar: (currentProfile && currentProfile.avatar) || '',
            timestamp: Date.now(), userId: userId,
            fileName: pendingFile.name, fileSize: pendingFile.size,
            data: reader.result
        };
        if (dmReplyTo) msg.replyTo = dmReplyTo;
        clearPreview();
        clearDmReply();
        try {
            await dmsRef.child(key).child('messages').push(msg);
            await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
        } catch (e) {}
    };
    reader.readAsDataURL(pendingFile);
}
on('#dmSendBtn', 'click', sendDm);
on('#dmInput', 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
        e.preventDefault();
        sendDm();
    }
});
on('#dmSearchClose', 'click', () => {
    document.getElementById('dmSearchBar').style.display = 'none';
    document.getElementById('dmSearchInput').value = '';
    filterMessages(document.getElementById('dmMessages'), '');
});
on('#dmSearchInput', 'input', e => filterMessages(document.getElementById('dmMessages'), e.target.value.trim().toLowerCase()));
on('#dmReplyCancel', 'click', clearDmReply);
on('#dmEditCancel', 'click', cancelDmEdit);
setupDraftAutosave(document.getElementById('dmInput'), () => currentDmUser ? 'dm_' + currentDmUser.uid : null);

// ============================================================
// GROUPS
// ============================================================
async function openGroup(gid) {
    const g = userGroups[gid];
    if (!g) return;
    currentGroup = Object.assign({ id: gid }, g);
    currentDmUser = null;
    updateGroupHeader();
    clearGroupReply();
    cancelGroupEdit();
    switchView('group');
    document.getElementById('groupSearchBar').style.display = 'none';
    await unreadRef.child(userId).child('group_' + gid).remove();
    if (window._groupCurrentListener) {
        try { window._groupCurrentListener.ref.off('child_added', window._groupCurrentListener.cb); } catch (e) {}
    }
    if (window._groupReactionsListener) {
        try { window._groupReactionsListener.ref.off('value', window._groupReactionsListener.cb); } catch (e) {}
    }
    const gm = document.getElementById('groupMessages');
    gm.innerHTML = '';
    groupLastMsgs = [];
    groupReactions = {};
    const ref = groupsRef.child(gid).child('messages');
    const rRef = reactionsRef.child('group_' + gid);
    const rCb = snap => {
        groupReactions = snap.val() || {};
        updateAllReactionsIn(gm, groupReactions);
    };
    rRef.on('value', rCb);
    window._groupReactionsListener = { ref: rRef, cb: rCb };
    const cb = snap => {
        const msg = snap.val();
        if (!msg) return;
        msg._id = snap.key;
        const existing = gm.querySelector('[data-msg-id="' + snap.key + '"]');
        if (existing) {
            const textEl = existing.querySelector('.msg-text');
            if (textEl && msg.text != null) textEl.textContent = msg.text;
            existing.dataset.msgText = msg.text || '';
            const header = existing.querySelector('.msg-header');
            if (msg.edited && !header.querySelector('.msg-edited')) {
                const s = document.createElement('span');
                s.className = 'msg-edited';
                s.textContent = '(edited)';
                header.appendChild(s);
            }
            return;
        }
        groupLastMsgs.push(msg);
        renderGroupMessage(msg);
        if (msg.userId !== userId) {
            if (!isChatMuted('group_' + gid)) playNotifSound();
        }
    };
    ref.limitToLast(80).on('child_added', cb);
    window._groupCurrentListener = { ref, cb };
    await loadDraft('group_' + gid, document.getElementById('groupInput'));
    document.getElementById('groupInput').focus();
    _lastRailHash = '';
    renderRailDms();
}

async function sendGroupMessage() {
    const gi = document.getElementById('groupInput');
    const text = gi.value.trim();
    if (!currentGroup) return;

    if (groupEditingId) {
        if (!text) return;
        try {
            await groupsRef.child(currentGroup.id).child('messages').child(groupEditingId).update({
                text: text, edited: true, editedAt: Date.now()
            });
            const el = document.querySelector('.message[data-msg-id="' + groupEditingId + '"]');
            if (el) {
                const tEl = el.querySelector('.msg-text');
                if (tEl) tEl.textContent = text;
                el.dataset.msgText = text;
                const h = el.querySelector('.msg-header');
                if (!h.querySelector('.msg-edited')) {
                    const s = document.createElement('span');
                    s.className = 'msg-edited';
                    s.textContent = '(edited)';
                    h.appendChild(s);
                }
            }
            cancelGroupEdit();
            showToast('Edited', 'Message updated.');
        } catch (e) { showToast('Failed', 'Could not edit message.'); }
        return;
    }
    if (!text) return;

    const msg = {
        user: username, displayName: displayName, text: text,
        color: getColor(displayName),
        avatar: (currentProfile && currentProfile.avatar) || '',
        timestamp: Date.now(), userId: userId, type: 'text'
    };
    if (groupReplyTo) msg.replyTo = groupReplyTo;
    gi.value = '';
    gi.focus();
    clearDraft('group_' + currentGroup.id);
    clearGroupReply();
    try {
        await groupsRef.child(currentGroup.id).child('messages').push(msg);
        const g = userGroups[currentGroup.id];
        if (g && g.members) {
            for (const m of Object.keys(g.members)) {
                if (m !== userId) {
                    await unreadRef.child(m).child('group_' + currentGroup.id).transaction(c => (c || 0) + 1);
                }
            }
        }
    } catch (e) {}
}
on('#groupSendBtn', 'click', sendGroupMessage);
on('#groupInput', 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
        e.preventDefault();
        sendGroupMessage();
    }
});

// ============================================================
// NEW GROUP MODAL
// ============================================================
on('#newGroupBtn', 'click', () => {
    if (friends.length < 1) {
        showModal({ title: 'No friends yet', text: 'Add some friends before creating a group.', icon: 'fas fa-user-group', confirmText: 'OK', hideCancel: true });
        return;
    }
    document.getElementById('groupNameInput').value = '';
    const gp = document.getElementById('groupPicker');
    gp.innerHTML = '';
    friends.forEach(uid => {
        if (blockedUsers[uid]) return;
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML =
            '<div class="group-picker-checkbox"><i class="fas fa-check"></i></div>' +
            (u.avatar
                ? '<div class="group-picker-avatar" style="background-image:url(\'' + u.avatar + '\');"></div>'
                : '<div class="group-picker-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(dname)) + '</div>') +
            '<span class="group-picker-name">' + escapeHtml(dname) + '</span>';
        item.addEventListener('click', () => item.classList.toggle('selected'));
        gp.appendChild(item);
    });
    document.getElementById('newGroupModal').classList.add('open');
});
on('#newGroupClose', 'click', () => document.getElementById('newGroupModal').classList.remove('open'));
on('#newGroupCancelBtn', 'click', () => document.getElementById('newGroupModal').classList.remove('open'));
on('#newGroupCreateBtn', 'click', async () => {
    const name = document.getElementById('groupNameInput').value.trim();
    if (!name) {
        showModal({ title: 'Missing name', text: 'Please enter a group name.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const selected = Array.from(document.querySelectorAll('#groupPicker .group-picker-item.selected')).map(i => i.dataset.uid);
    if (selected.length === 0) {
        showModal({ title: 'No members', text: 'Pick at least one friend for the group.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = document.getElementById('newGroupCreateBtn');
    btn.disabled = true;
    btn.textContent = 'Creating...';
    try {
        const members = {};
        members[userId] = true;
        selected.forEach(uid => { members[uid] = true; });
        const gid = groupsRef.push().key;
        await groupsRef.child(gid).set({
            name: name,
            owner: userId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            members: members
        });
        document.getElementById('newGroupModal').classList.remove('open');
        showToast('Group created', name + ' is ready.');
        setTimeout(() => openGroup(gid), 300);
    } catch (e) {
        showModal({ title: 'Failed', text: 'Could not create the group. Try again.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
    } finally {
        btn.disabled = false;
        btn.textContent = t('create');
    }
});

// ============================================================
// GROUP SETTINGS
// ============================================================
function openGroupSettings() {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;
    const isOwner = g.owner === userId;
    document.getElementById('groupSettingsHint').textContent = isOwner
        ? 'You are the owner. You can rename and change the photo.'
        : 'Only the group owner can rename or change the photo.';
    document.getElementById('groupSettingsNameInput').value = g.name || '';
    document.getElementById('groupSettingsNameInput').disabled = !isOwner;
    groupEditPhoto = g.photo || '';
    const av = document.getElementById('groupSettingsAvatar');
    if (g.photo) {
        av.style.backgroundImage = 'url(\'' + g.photo + '\')';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    } else {
        av.style.backgroundImage = '';
        av.style.background = 'linear-gradient(135deg, #6ec2a8, #4a8b7a)';
        av.innerHTML = '<i class="fas fa-users"></i><div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    }
    const bg = document.getElementById('groupSettingsBannerGradient');
    if (g.photo) bg.style.backgroundImage = 'url(\'' + g.photo + '\')';
    else {
        bg.style.backgroundImage = '';
        bg.style.background = 'linear-gradient(135deg, #6ec2a8, #4a8b7a)';
    }
    document.getElementById('groupSettingsModal').classList.add('open');
}
on('#groupSettingsClose', 'click', () => document.getElementById('groupSettingsModal').classList.remove('open'));
on('#groupSettingsCancelBtn', 'click', () => document.getElementById('groupSettingsModal').classList.remove('open'));
on('#groupSettingsAvatar', 'click', () => {
    if (!currentGroup) return;
    if (userGroups[currentGroup.id].owner !== userId) { showToast('Not owner', 'Only the owner can change the photo.'); return; }
    document.getElementById('groupPhotoInput').click();
});
on('#groupSettingsBanner', 'click', () => {
    if (!currentGroup) return;
    if (userGroups[currentGroup.id].owner !== userId) { showToast('Not owner', 'Only the owner can change the photo.'); return; }
    document.getElementById('groupPhotoInput').click();
});
on('#groupPhotoInput', 'change', async () => {
    const f = document.getElementById('groupPhotoInput').files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
        showModal({ title: 'Image too large', text: 'Please choose an image under 5 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        const cropped = await openCropModal(reader.result, 1, t('adjustGroupPhoto'));
        if (!cropped) return;
        groupEditPhoto = cropped;
        const av = document.getElementById('groupSettingsAvatar');
        av.style.backgroundImage = 'url(\'' + cropped + '\')';
        av.style.backgroundSize = 'cover';
        av.style.backgroundPosition = 'center';
        av.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
        document.getElementById('groupSettingsBannerGradient').style.backgroundImage = 'url(\'' + cropped + '\')';
    };
    reader.readAsDataURL(f);
    document.getElementById('groupPhotoInput').value = '';
});
on('#groupSettingsSaveBtn', 'click', async () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (g.owner !== userId) { showToast('Not owner', 'Only the owner can make changes.'); return; }
    const newName = document.getElementById('groupSettingsNameInput').value.trim();
    if (!newName) {
        showModal({ title: 'Missing name', text: 'Group name cannot be empty.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = document.getElementById('groupSettingsSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        await groupsRef.child(currentGroup.id).update({ name: newName, photo: groupEditPhoto || '' });
        document.getElementById('groupSettingsModal').classList.remove('open');
        showToast('Saved', 'Group updated.');
    } catch (e) { showToast('Failed', 'Could not save group.'); }
    finally { btn.disabled = false; btn.textContent = t('save'); }
});

// ============================================================
// GROUP MEMBERS
// ============================================================
on('#groupMembersClose', 'click', () => document.getElementById('groupMembersModal').classList.remove('open'));
on('#groupAddMembersBtn', 'click', () => {
    if (!currentGroup) return;
    const g = userGroups[currentGroup.id];
    if (!g) return;
    const memberUids = Object.keys(g.members || {});
    const candidates = friends.filter(uid => !memberUids.includes(uid) && !blockedUsers[uid]);
    if (candidates.length === 0) {
        showModal({ title: 'No one to add', text: 'All your friends are already in this group.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const amp = document.getElementById('addMembersPicker');
    amp.innerHTML = '';
    candidates.forEach(uid => {
        const u = friendsData[uid];
        if (!u) return;
        const dname = displayNameFor(uid, u.displayName || u.username);
        const color = getColor(u.displayName || u.username);
        const item = document.createElement('div');
        item.className = 'group-picker-item';
        item.dataset.uid = uid;
        item.innerHTML =
            '<div class="group-picker-checkbox"><i class="fas fa-check"></i></div>' +
            (u.avatar
                ? '<div class="group-picker-avatar" style="background-image:url(\'' + u.avatar + '\');"></div>'
                : '<div class="group-picker-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(dname)) + '</div>') +
            '<span class="group-picker-name">' + escapeHtml(dname) + '</span>';
        item.addEventListener('click', () => item.classList.toggle('selected'));
        amp.appendChild(item);
    });
    document.getElementById('addMembersModal').classList.add('open');
});
on('#addMembersClose', 'click', () => document.getElementById('addMembersModal').classList.remove('open'));
on('#addMembersCancelBtn', 'click', () => document.getElementById('addMembersModal').classList.remove('open'));
on('#addMembersConfirmBtn', 'click', async () => {
    if (!currentGroup) return;
    const selected = Array.from(document.querySelectorAll('#addMembersPicker .group-picker-item.selected')).map(i => i.dataset.uid);
    if (selected.length === 0) {
        showModal({ title: 'No selection', text: 'Pick at least one friend.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = document.getElementById('addMembersConfirmBtn');
    btn.disabled = true;
    btn.textContent = 'Adding...';
    try {
        const gid = currentGroup.id;
        const updates = {};
        selected.forEach(uid => { updates['members/' + uid] = true; });
        await groupsRef.child(gid).update(updates);
        for (const uid of selected) {
            await unreadRef.child(uid).child('group_' + gid).transaction(c => (c || 0) + 1);
        }
        document.getElementById('addMembersModal').classList.remove('open');
        showToast('Members added', selected.length + ' friend' + (selected.length > 1 ? 's' : '') + ' joined.');
    } catch (e) { showToast('Failed', 'Could not add members.'); }
    finally { btn.disabled = false; btn.textContent = t('add'); }
});

on('#groupSearchClose', 'click', () => {
    document.getElementById('groupSearchBar').style.display = 'none';
    document.getElementById('groupSearchInput').value = '';
    filterMessages(document.getElementById('groupMessages'), '');
});
on('#groupSearchInput', 'input', e => filterMessages(document.getElementById('groupMessages'), e.target.value.trim().toLowerCase()));
on('#groupReplyCancel', 'click', clearGroupReply);
on('#groupEditCancel', 'click', cancelGroupEdit);
setupDraftAutosave(document.getElementById('groupInput'), () => currentGroup ? 'group_' + currentGroup.id : null);

// ============================================================
// FILTER
// ============================================================
function filterMessages(container, query) {
    if (!container) return;
    container.querySelectorAll('.message').forEach(m => {
        const textEl = m.querySelector('.msg-text');
        const text = (textEl ? textEl.textContent : '').toLowerCase();
        if (!query) {
            m.style.display = '';
            m.classList.remove('search-hit');
        } else if (text.includes(query)) {
            m.style.display = '';
            m.classList.add('search-hit');
        } else {
            m.style.display = 'none';
            m.classList.remove('search-hit');
        }
    });
}

// ============================================================
// EMOJI PICKER
// ============================================================
const EMOJI_CATEGORIES = {
    smileys: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓'],
    gestures: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤝','🙏','✍️','💪','🦾','🖕','🤌','🤏','👏','🙌','👐','🤲','🤜','🤛','✊','👊','🫰','🫱','🫲','🫳','🫴'],
    hearts: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','💋','🫀','💐','🌹','🌷','🌺','🌸','🌼','🌻'],
    animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦗','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐠','🐟','🐡','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
    food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯'],
    objects: ['💡','🔦','🕯️','🔑','🗝️','🔒','🔓','🔨','🪓','⛏️','⚒️','🛠️','🗡️','⚔️','🔫','🛡️','🚬','⚰️','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔔','📣','📢','📯','🎙️','🎚️','🎛️','🎤','🎧','📻','🎷','🪗','🎸','🎹','🎺','🎻','🪕','🥁','🪘','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮','🎥','🎞️','📽️','🎬','📺','📷','📸','📹','📼','🔍','🔎','🏮','🪔']
};
function renderEmojiCategory(cat) {
    const list = EMOJI_CATEGORIES[cat] || [];
    const grid = document.getElementById('emojiGrid');
    if (!grid) return;
    grid.innerHTML = list.map(e => '<button class="emoji-item" data-emoji="' + e + '">' + e + '</button>').join('');
    grid.querySelectorAll('.emoji-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.emoji;
            const target = document.activeElement;
            const dmInput = document.getElementById('dmInput');
            const groupInput = document.getElementById('groupInput');
            if (target && (target === dmInput || target === groupInput)) {
                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const val = target.value;
                target.value = val.slice(0, start) + emoji + val.slice(end);
                target.selectionStart = target.selectionEnd = start + emoji.length;
                target.focus();
            } else if (currentGroup && !currentDmUser) {
                if (groupInput) { groupInput.value += emoji; groupInput.focus(); }
            } else if (currentDmUser) {
                if (dmInput) { dmInput.value += emoji; dmInput.focus(); }
            }
        });
    });
}
document.querySelectorAll('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderEmojiCategory(tab.dataset.cat);
    });
});
function openEmojiPicker(anchorBtn) {
    if (!anchorBtn) return;
    const rect = anchorBtn.getBoundingClientRect();
    const ep = document.getElementById('emojiPicker');
    if (!ep) return;
    const isAr = document.body.classList.contains('lang-ar');
    if (isAr) {
        ep.style.right = Math.min(window.innerWidth - rect.right - 240, window.innerWidth - 340) + 'px';
        ep.style.left = 'auto';
    } else {
        ep.style.left = Math.min(rect.left - 240, window.innerWidth - 340) + 'px';
        ep.style.right = 'auto';
    }
    ep.classList.toggle('open');
    if (ep.classList.contains('open')) {
        renderEmojiCategory('smileys');
        document.querySelectorAll('.emoji-tab').forEach(t => t.classList.toggle('active', t.dataset.cat === 'smileys'));
    }
}
on('#dmEmojiBtn', 'click', e => { e.stopPropagation(); openEmojiPicker(document.getElementById('dmEmojiBtn')); });
on('#groupEmojiBtn', 'click', e => { e.stopPropagation(); openEmojiPicker(document.getElementById('groupEmojiBtn')); });

// ============================================================
// ATTACHMENTS
// ============================================================
function clearPreview() {
    pendingFile = null;
    pendingType = null;
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewContent').innerHTML = '';
    document.getElementById('dmImageInput').value = '';
    document.getElementById('dmFileInput').value = '';
}
function clearGroupPreview() {
    groupPendingFile = null;
    groupPendingType = null;
    document.getElementById('groupUploadPreview').style.display = 'none';
    document.getElementById('groupPreviewContent').innerHTML = '';
    document.getElementById('groupImageInput').value = '';
    document.getElementById('groupFileInput').value = '';
}
function showPreview(file, type) {
    const up = document.getElementById('uploadPreview');
    up.style.display = 'flex';
    const pc = document.getElementById('previewContent');
    pc.innerHTML = '';
    if (type === 'image') {
        const r = new FileReader();
        r.onload = () => {
            pc.innerHTML = '<img src="' + r.result + '" /><div class="preview-info"><span class="preview-name">' + escapeHtml(file.name) + '</span><span class="preview-size">' + formatBytes(file.size) + '</span></div>';
        };
        r.readAsDataURL(file);
    } else {
        pc.innerHTML = '<div class="preview-file"><i class="fas fa-file"></i></div><div class="preview-info"><span class="preview-name">' + escapeHtml(file.name) + '</span><span class="preview-size">' + formatBytes(file.size) + '</span></div>';
    }
}
function showGroupPreview(file, type) {
    const up = document.getElementById('groupUploadPreview');
    up.style.display = 'flex';
    const pc = document.getElementById('groupPreviewContent');
    pc.innerHTML = '';
    if (type === 'image') {
        const r = new FileReader();
        r.onload = () => {
            pc.innerHTML = '<img src="' + r.result + '" /><div class="preview-info"><span class="preview-name">' + escapeHtml(file.name) + '</span><span class="preview-size">' + formatBytes(file.size) + '</span></div>';
        };
        r.readAsDataURL(file);
    } else {
        pc.innerHTML = '<div class="preview-file"><i class="fas fa-file"></i></div><div class="preview-info"><span class="preview-name">' + escapeHtml(file.name) + '</span><span class="preview-size">' + formatBytes(file.size) + '</span></div>';
    }
}
on('#dmAttachBtn', 'click', e => {
    e.stopPropagation();
    const m = document.getElementById('dmAttachMenu');
    if (m) m.classList.toggle('open');
});
document.querySelectorAll('#dmAttachMenu .attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        document.getElementById('dmAttachMenu').classList.remove('open');
        if (type === 'image') document.getElementById('dmImageInput').click();
        else if (type === 'file') document.getElementById('dmFileInput').click();
    });
});
on('#dmImageInput', 'change', () => {
    const f = document.getElementById('dmImageInput').files[0];
    if (!f) return;
    pendingFile = f;
    pendingType = 'image';
    showPreview(f, 'image');
});
on('#dmFileInput', 'change', () => {
    const f = document.getElementById('dmFileInput').files[0];
    if (!f) return;
    pendingFile = f;
    pendingType = 'file';
    showPreview(f, 'file');
});
on('#previewRemove', 'click', clearPreview);

on('#groupAttachBtn', 'click', e => {
    e.stopPropagation();
    const m = document.getElementById('groupAttachMenu');
    if (m) m.classList.toggle('open');
});
document.querySelectorAll('#groupAttachMenu .attach-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        document.getElementById('groupAttachMenu').classList.remove('open');
        if (type === 'image') document.getElementById('groupImageInput').click();
        else if (type === 'file') document.getElementById('groupFileInput').click();
    });
});
on('#groupImageInput', 'change', () => {
    const f = document.getElementById('groupImageInput').files[0];
    if (!f) return;
    groupPendingFile = f;
    groupPendingType = 'image';
    showGroupPreview(f, 'image');
});
on('#groupFileInput', 'change', () => {
    const f = document.getElementById('groupFileInput').files[0];
    if (!f) return;
    groupPendingFile = f;
    groupPendingType = 'file';
    showGroupPreview(f, 'file');
});
on('#groupPreviewRemove', 'click', clearGroupPreview);

// ============================================================
// VOICE RECORDING
// ============================================================
async function startRecording(target) {
    if (isRecording) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingSeconds = 0;
        isRecording = true;
        recordingTarget = target;
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            if (recordingSeconds < 1) { cancelRecording(); return; }
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onload = async () => {
                const msg = {
                    type: 'voice', user: username, displayName: displayName,
                    color: getColor(displayName),
                    avatar: (currentProfile && currentProfile.avatar) || '',
                    timestamp: Date.now(), userId: userId,
                    duration: recordingSeconds, data: reader.result
                };
                try {
                    if (target === 'dm' && currentDmUser) {
                        if (dmReplyTo) msg.replyTo = dmReplyTo;
                        await dmsRef.child(dmKey(userId, currentDmUser.uid)).child('messages').push(msg);
                        await unreadRef.child(currentDmUser.uid).child('dm_' + userId).transaction(c => (c || 0) + 1);
                        clearDmReply();
                    } else if (target === 'group' && currentGroup) {
                        if (groupReplyTo) msg.replyTo = groupReplyTo;
                        await groupsRef.child(currentGroup.id).child('messages').push(msg);
                        clearGroupReply();
                        const g = userGroups[currentGroup.id];
                        if (g && g.members) {
                            for (const m of Object.keys(g.members)) {
                                if (m !== userId) {
                                    await unreadRef.child(m).child('group_' + currentGroup.id).transaction(c => (c || 0) + 1);
                                }
                            }
                        }
                    }
                } catch (e) {}
            };
            reader.readAsDataURL(blob);
            cancelRecording();
        };
        mediaRecorder.start();
        if (target === 'dm') {
            document.getElementById('recordingIndicator').style.display = 'flex';
            document.getElementById('dmMicBtn').classList.add('recording');
        } else {
            document.getElementById('groupRecordingIndicator').style.display = 'flex';
            document.getElementById('groupMicBtn').classList.add('recording');
        }
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const label = formatDuration(recordingSeconds);
            if (target === 'dm') document.getElementById('recTime').textContent = label;
            else document.getElementById('groupRecTime').textContent = label;
        }, 1000);
    } catch (err) {
        showModal({
            title: 'Microphone blocked',
            text: 'Please allow microphone access in your browser.',
            icon: 'fas fa-microphone-slash',
            danger: true,
            confirmText: 'OK',
            hideCancel: true
        });
    }
}
function cancelRecording() {
    if (recordingTimer) clearInterval(recordingTimer);
    recordingTimer = null;
    isRecording = false;
    recordingTarget = null;
    document.getElementById('recordingIndicator').style.display = 'none';
    document.getElementById('groupRecordingIndicator').style.display = 'none';
    document.getElementById('dmMicBtn').classList.remove('recording');
    document.getElementById('groupMicBtn').classList.remove('recording');
    document.getElementById('recTime').textContent = '0:00';
    document.getElementById('groupRecTime').textContent = '0:00';
}
function stopRecording(send) {
    if (!mediaRecorder || !isRecording) return;
    if (send) mediaRecorder.stop();
    else {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
        cancelRecording();
    }
}
on('#dmMicBtn', 'click', () => {
    if (isRecording) stopRecording(true);
    else startRecording('dm');
});
on('#groupMicBtn', 'click', () => {
    if (isRecording) stopRecording(true);
    else startRecording('group');
});
on('#recCancel', 'click', () => stopRecording(false));
on('#recSend', 'click', () => stopRecording(true));
on('#groupRecCancel', 'click', () => stopRecording(false));
on('#groupRecSend', 'click', () => stopRecording(true));

// ============================================================
// TYPING
// ============================================================
let _typingTimeout = null;
function startTyping() {
    if (!currentDmUser) return;
    const key = dmKey(userId, currentDmUser.uid);
    typingRef.child(key).child(userId).set(true);
    typingPreviewRef.child(currentDmUser.uid).child(userId).set(true);
    clearTimeout(_typingTimeout);
    _typingTimeout = setTimeout(stopTyping, 2000);
}
function stopTyping() {
    if (!currentDmUser) return;
    const key = dmKey(userId, currentDmUser.uid);
    typingRef.child(key).child(userId).remove();
    typingPreviewRef.child(currentDmUser.uid).child(userId).remove();
}
on('#dmInput', 'input', () => {
    if (typingEnabled) startTyping();
});

// ============================================================
// LIGHTBOX + VOICE PLAYBACK
// ============================================================
window.openLightbox = function (src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.add('open');
};
on('#lightboxClose', 'click', () => {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('lightboxImg').src = '';
});
let _currentAudio = null;
let _currentVoiceBtn = null;
window.playVoice = function (btn, src) {
    if (_currentAudio && _currentVoiceBtn === btn) {
        _currentAudio.pause();
        _currentAudio = null;
        _currentVoiceBtn = null;
        btn.innerHTML = '<i class="fas fa-play"></i>';
        return;
    }
    if (_currentAudio) {
        _currentAudio.pause();
        if (_currentVoiceBtn) _currentVoiceBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    _currentAudio = new Audio(src);
    _currentVoiceBtn = btn;
    btn.innerHTML = '<i class="fas fa-pause"></i>';
    _currentAudio.play();
    _currentAudio.onended = () => {
        btn.innerHTML = '<i class="fas fa-play"></i>';
        _currentAudio = null;
        _currentVoiceBtn = null;
    };
};

// END OF PART 3 — CONTINUE WITH PART 4 BELOW THIS LINE// ============================================================
// EDIT PROFILE
// ============================================================
on('#myProfileBtn', 'click', () => {
    document.getElementById('accountMenu').classList.remove('open');
    openUserProfile(userId);
});

function openEditProfile() {
    if (!currentProfile) return;
    editState.avatar = currentProfile.avatar || '';
    editState.banner = currentProfile.banner || '';
    const color = getColor(displayName);
    const bb = document.getElementById('editBannerGradient');
    if (editState.banner) {
        bb.style.backgroundImage = 'url(\'' + editState.banner + '\')';
        bb.style.backgroundSize = 'cover';
        bb.style.backgroundPosition = 'center';
    } else {
        bb.style.backgroundImage = '';
        bb.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
    }
    const ea = document.getElementById('editAvatar');
    if (editState.avatar) {
        ea.style.backgroundImage = 'url(\'' + editState.avatar + '\')';
        ea.style.backgroundSize = 'cover';
        ea.style.backgroundPosition = 'center';
        ea.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    } else {
        ea.style.backgroundImage = '';
        ea.style.background = 'linear-gradient(135deg, ' + color + ', ' + color + 'cc)';
        ea.innerHTML = escapeHtml(getInitial(displayName)) + '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    }
    document.getElementById('editDisplayNameInput').value = displayName;
    document.getElementById('editUsernameInput').value = username;
    document.getElementById('editBioInput').value = currentProfile.bio || '';
    document.getElementById('bioCount').textContent = (currentProfile.bio || '').length;
    const lastChange = currentProfile.usernameChangedAt || 0;
    const daysSince = (Date.now() - lastChange) / 86400000;
    const hint = document.getElementById('usernameChangeHint');
    const unInput = document.getElementById('editUsernameInput');
    if (lastChange && daysSince < 15) {
        const daysLeft = Math.ceil(15 - daysSince);
        hint.textContent = 'You can change your username in ' + daysLeft + ' day' + (daysLeft > 1 ? 's' : '') + '.';
        unInput.disabled = true;
    } else {
        hint.textContent = 'You can change your username now.';
        unInput.disabled = false;
    }
    document.getElementById('editProfileModal').classList.add('open');
}
on('#editAvatar', 'click', () => document.getElementById('avatarInput').click());
on('#editBanner', 'click', () => document.getElementById('bannerInput').click());
on('#avatarInput', 'change', async () => {
    const f = document.getElementById('avatarInput').files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
        showModal({ title: 'Image too large', text: 'Please choose an image under 5 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const r = new FileReader();
    r.onload = async () => {
        const cropped = await openCropModal(r.result, 1, t('adjustPhoto'));
        if (!cropped) return;
        editState.avatar = cropped;
        const ea = document.getElementById('editAvatar');
        ea.style.backgroundImage = 'url(\'' + cropped + '\')';
        ea.style.backgroundSize = 'cover';
        ea.style.backgroundPosition = 'center';
        ea.innerHTML = '<div class="avatar-edit-overlay"><i class="fas fa-camera"></i></div>';
    };
    r.readAsDataURL(f);
    document.getElementById('avatarInput').value = '';
});
on('#bannerInput', 'change', async () => {
    const f = document.getElementById('bannerInput').files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
        showModal({ title: 'Image too large', text: 'Please choose an image under 5 MB.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
        return;
    }
    const r = new FileReader();
    r.onload = async () => {
        const cropped = await openCropModal(r.result, 3, t('adjustBanner'));
        if (!cropped) return;
        editState.banner = cropped;
        const bg = document.getElementById('editBannerGradient');
        bg.style.backgroundImage = 'url(\'' + cropped + '\')';
        bg.style.backgroundSize = 'cover';
        bg.style.backgroundPosition = 'center';
    };
    r.readAsDataURL(f);
    document.getElementById('bannerInput').value = '';
});
on('#editBioInput', 'input', () => {
    document.getElementById('bioCount').textContent = document.getElementById('editBioInput').value.length;
});
on('#editProfileClose', 'click', () => document.getElementById('editProfileModal').classList.remove('open'));
on('#editCancelBtn', 'click', () => document.getElementById('editProfileModal').classList.remove('open'));
on('#editSaveBtn', 'click', async () => {
    const newDisplayName = document.getElementById('editDisplayNameInput').value.trim();
    const newUsername = document.getElementById('editUsernameInput').value.trim().toLowerCase();
    const newBio = document.getElementById('editBioInput').value.trim();
    if (!newDisplayName) {
        showModal({ title: 'Missing name', text: 'Display name cannot be empty.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    if (newDisplayName.length > 20) {
        showModal({ title: 'Too long', text: 'Display name must be 20 characters or less.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
        return;
    }
    const btn = document.getElementById('editSaveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
        const updates = {
            displayName: newDisplayName, bio: newBio,
            avatar: editState.avatar, banner: editState.banner
        };
        const unInput = document.getElementById('editUsernameInput');
        if (!unInput.disabled && newUsername !== username) {
            if (newUsername.length < 3 || newUsername.length > 14) {
                showModal({ title: 'Invalid username', text: 'Username must be 3–14 characters.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = t('save'); return;
            }
            if (!/^[a-z0-9_]+$/.test(newUsername)) {
                showModal({ title: 'Invalid username', text: 'Lowercase letters, numbers, underscores only.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = t('save'); return;
            }
            const check = await usersRef.child('usernames').child(newUsername).once('value');
            if (check.exists()) {
                showModal({ title: 'Username taken', text: 'That username is already in use.', icon: 'fas fa-info-circle', confirmText: 'OK', hideCancel: true });
                btn.disabled = false; btn.textContent = t('save'); return;
            }
            updates.username = newUsername;
            updates.usernameChangedAt = Date.now();
            await usersRef.child('usernames').child(username).remove();
            await usersRef.child('usernames').child(newUsername).set(userId);
        }
        await usersRef.child(userId).update(updates);
        document.getElementById('editProfileModal').classList.remove('open');
        showToast('Profile saved', 'Your changes are live.');
    } catch (err) {
        showModal({ title: 'Failed', text: 'Could not save profile.', icon: 'fas fa-exclamation-triangle', danger: true, confirmText: 'OK', hideCancel: true });
    } finally {
        btn.disabled = false;
        btn.textContent = t('save');
    }
});

// ============================================================
// SETTINGS
// ============================================================
function openSettings(section) {
    section = section || 'account';
    document.querySelectorAll('.settings-section').forEach(s => s.classList.toggle('active', s.dataset.section === section));
    document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.toggle('active', i.dataset.section === section));
    document.getElementById('settingsModal').classList.add('open');
}

document.addEventListener('click', async e => {
    const target = e.target;
    if (!target.closest) return;

    if (target.closest('#settingsBtn')) {
        e.stopPropagation();
        document.getElementById('accountMenu').classList.remove('open');
        openSettings('account');
        return;
    }
    if (target.closest('#themeToggle')) { toggleTheme(); return; }
    if (target.closest('#themeMenuItem')) {
        document.getElementById('accountMenu').classList.remove('open');
        toggleTheme();
        return;
    }
    if (target.closest('#userPanel') && !target.closest('#settingsBtn')) {
        e.stopPropagation();
        document.getElementById('accountMenu').classList.toggle('open');
        return;
    }
    if (target.closest('#logoutBtn')) {
        e.stopPropagation();
        document.getElementById('accountMenu').classList.remove('open');
        const ok = await showModal({ title: 'Log out?', text: '', icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Log Out' });
        if (ok) await auth.signOut();
        return;
    }
    if (target.closest('#settingsClose')) {
        e.stopPropagation();
        document.getElementById('settingsModal').classList.remove('open');
        return;
    }
    const navItem = target.closest('.settings-nav-item');
    if (navItem) {
        e.stopPropagation();
        const section = navItem.dataset.section;
        document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.toggle('active', i === navItem));
        document.querySelectorAll('.settings-section').forEach(s => s.classList.toggle('active', s.dataset.section === section));
        return;
    }
    if (target.closest('#settingsLogout')) {
        e.stopPropagation();
        const ok = await showModal({ title: 'Log out?', text: '', icon: 'fas fa-sign-out-alt', danger: true, confirmText: 'Log Out' });
        if (!ok) return;
        document.getElementById('settingsModal').classList.remove('open');
        await auth.signOut();
        return;
    }
    const sBtn = target.closest('.settings-btn');
    if (sBtn) {
        e.stopPropagation();
        const action = sBtn.dataset.action;
        if (!action) return;
        if (action === 'edit-profile') {
            document.getElementById('settingsModal').classList.remove('open');
            openUserProfile(userId);
            setTimeout(() => openEditProfile(), 150);
        } else if (action === 'export-data') {
            try {
                const data = {
                    profile: currentProfile, username: username, displayName: displayName,
                    exportedAt: new Date().toISOString(),
                    friendsCount: friends.length,
                    groupsCount: Object.keys(userGroups).length
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'whisper-' + username + '-' + Date.now() + '.json';
                a.click();
                URL.revokeObjectURL(url);
                showToast('Exported', 'Your data has been downloaded.');
            } catch (err) { showToast('Failed', 'Could not export data.'); }
        } else if (action === 'clear-drafts') {
            const ok = await showModal({ title: 'Clear all drafts?', text: '', icon: 'fas fa-eraser', danger: true, confirmText: 'Clear' });
            if (ok) {
                try {
                    await draftsRef.child(userId).remove();
                    document.getElementById('dmInput').value = '';
                    document.getElementById('groupInput').value = '';
                    showToast('Cleared', 'All drafts removed.');
                } catch (err) { showToast('Failed', 'Could not clear drafts.'); }
            }
        } else if (action === 'delete-account') {
            const ok = await showModal({
                title: 'Delete account?',
                text: 'This permanently removes your account and all data.',
                icon: 'fas fa-trash', danger: true, confirmText: 'Delete Forever'
            });
            if (ok) {
                try {
                    await usersRef.child('usernames').child(username).remove();
                    await usersRef.child(userId).remove();
                    await auth.currentUser.delete();
                } catch (err) { showToast('Failed', 'Please log out and back in, then try again.'); }
            }
        }
        return;
    }
    if (!target.closest('#accountMenu')) {
        const m = document.getElementById('accountMenu');
        if (m) m.classList.remove('open');
    }
    if (!target.closest('#contextMenu')) {
        const m = document.getElementById('contextMenu');
        if (m) m.classList.remove('open');
    }
    if (!target.closest('#chatOptionsMenu') && !target.closest('#cpActionOptions')) {
        const m = document.getElementById('chatOptionsMenu');
        if (m) m.classList.remove('open');
    }
    if (!target.closest('#userProfileMenu') && !target.closest('#userProfileMenuBtn')) {
        const m = document.getElementById('userProfileMenu');
        if (m) m.classList.remove('open');
    }
    if (!target.closest('.emoji-picker') && !target.closest('#dmEmojiBtn') && !target.closest('#groupEmojiBtn')) {
        const m = document.getElementById('emojiPicker');
        if (m) m.classList.remove('open');
    }
    if (!target.closest('.reaction-picker') && !target.closest('[data-msg-action="react"]')) {
        const m = document.getElementById('reactionPicker');
        if (m) m.classList.remove('open');
    }
});

on('#languageSelect', 'change', e => {
    applyLanguage(e.target.value);
    showToast('Language', 'Language changed.');
});

// ============================================================
// TOGGLES
// ============================================================
on('#notifToggle', 'change', e => {
    notifSoundEnabled = e.target.checked;
    localStorage.setItem('notif_sound', notifSoundEnabled ? '1' : '0');
});
on('#typingToggle', 'change', e => {
    typingEnabled = e.target.checked;
    localStorage.setItem('typing_enabled', typingEnabled ? '1' : '0');
});
on('#compactToggle', 'change', e => {
    document.body.classList.toggle('compact', e.target.checked);
    localStorage.setItem('compact_mode', e.target.checked ? '1' : '0');
});
on('#dateSepToggle', 'change', e => {
    dateSeparatorsEnabled = e.target.checked;
    localStorage.setItem('date_sep_enabled', dateSeparatorsEnabled ? '1' : '0');
});
on('#reactionsToggle', 'change', e => {
    reactionsEnabled = e.target.checked;
    localStorage.setItem('reactions_enabled', reactionsEnabled ? '1' : '0');
});
on('#enterSendToggle', 'change', e => {
    enterToSend = e.target.checked;
    localStorage.setItem('enter_send', enterToSend ? '1' : '0');
});

// ============================================================
// BLOCKED LIST
// ============================================================
function renderBlockedList() {
    const list = document.getElementById('blockedList');
    if (!list) return;
    const uids = Object.keys(blockedUsers);
    if (uids.length === 0) {
        list.innerHTML = '<div class="empty-message">No blocked users.</div>';
        return;
    }
    list.innerHTML = '';
    uids.forEach(uid => {
        usersRef.child(uid).once('value').then(snap => {
            const u = snap.val();
            if (!u) return;
            const dname = u.displayName || u.username || 'Unknown';
            const color = getColor(dname);
            const el = document.createElement('div');
            el.className = 'blocked-user';
            el.innerHTML =
                (u.avatar
                    ? '<div class="blocked-user-avatar" style="background-image:url(\'' + u.avatar + '\');"></div>'
                    : '<div class="blocked-user-avatar" style="background:linear-gradient(135deg,' + color + ',' + color + 'cc);">' + escapeHtml(getInitial(dname)) + '</div>') +
                '<div class="blocked-user-info">' +
                    '<div class="blocked-user-name">' + escapeHtml(dname) + '</div>' +
                    '<div class="blocked-user-handle">@' + escapeHtml(u.username || 'unknown') + '</div>' +
                '</div>' +
                '<button class="blocked-user-unblock" data-uid="' + uid + '">Unblock</button>';
            el.querySelector('.blocked-user-unblock').addEventListener('click', async () => {
                await blockedRef.child(userId).child(uid).remove();
                showToast('Unblocked', 'User can message you again.');
            });
            list.appendChild(el);
        });
    });
}

// ============================================================
// MOBILE SIDEBAR
// ============================================================
on('#mobileMenuBtn', 'click', () => {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.body.classList.add('sidebar-open');
});
on('#mobileCloseMenuBtn', 'click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.body.classList.remove('sidebar-open');
});
document.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
        const chatItem = e.target.closest('.dm-item');
        if (chatItem) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            document.body.classList.remove('sidebar-open');
        }
    }
});

// ============================================================
// SIDEBAR SEARCH FILTER
// ============================================================
on('#sidebarSearch', 'input', e => {
    const query = e.target.value.trim().toLowerCase();
    const items = document.querySelectorAll('.dm-item');
    items.forEach(item => {
        const nameEl = item.querySelector('.dm-item-name');
        const previewEl = item.querySelector('.dm-item-preview');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        const preview = previewEl ? previewEl.textContent.toLowerCase() : '';
        if (!query || name.includes(query) || preview.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
});

// ============================================================
// INITIAL SETTINGS
// ============================================================
(function initSettings() {
    const notif = localStorage.getItem('notif_sound');
    if (notif === '0') { notifSoundEnabled = false; const el = document.getElementById('notifToggle'); if (el) el.checked = false; }
    const typing = localStorage.getItem('typing_enabled');
    if (typing === '0') { typingEnabled = false; const el = document.getElementById('typingToggle'); if (el) el.checked = false; }
    const dateSep = localStorage.getItem('date_sep_enabled');
    if (dateSep === '0') { dateSeparatorsEnabled = false; const el = document.getElementById('dateSepToggle'); if (el) el.checked = false; }
    const reactions = localStorage.getItem('reactions_enabled');
    if (reactions === '0') { reactionsEnabled = false; const el = document.getElementById('reactionsToggle'); if (el) el.checked = false; }
    const enter = localStorage.getItem('enter_send');
    if (enter === '0') { enterToSend = false; const el = document.getElementById('enterSendToggle'); if (el) el.checked = false; }
    const compact = localStorage.getItem('compact_mode');
    if (compact === '1') { document.body.classList.add('compact'); const el = document.getElementById('compactToggle'); if (el) el.checked = true; }
})();

console.log('%c✓ Whisper loaded', 'color:#4a8b7a;font-weight:bold;');

// END OF PART 4 — END OF script.js