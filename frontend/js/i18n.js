let translations = {};
let currentLang = localStorage.getItem('lang') || navigator.language.slice(0, 2);
if (currentLang !== 'de') currentLang = 'en';

async function initI18n() {
    const res = await fetch(`/lang/${currentLang}.json`);
    translations = await res.json();
    applyTranslations();
    updateLangToggle();
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[key]) el.textContent = translations[key];
    });
}

function t(key, fallback) {
    return translations[key] || fallback || key;
}

async function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const res = await fetch(`/lang/${lang}.json`);
    translations = await res.json();
    applyTranslations();
    updateLangToggle();
    // Re-render dynamic content
    if (typeof refreshAll === 'function') refreshAll();
}

function updateLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('opacity-40', btn.dataset.lang !== currentLang);
    });
}
