// Пользовательские настройки
// Хранит настройки каждого пользователя по userId

const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.join(__dirname, "..", "..", "user_settings.json");

// Настройки по умолчанию для нового пользователя
const DEFAULT_SETTINGS = {
    watermark: false  // Водяной знак выключен по умолчанию
};

// Загружаем настройки из файла при старте
let userSettings = {};

function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, "utf8");
            userSettings = JSON.parse(data);
        }
    } catch (err) {
        console.error("Ошибка загрузки настроек:", err);
        userSettings = {};
    }
}

function saveSettings() {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(userSettings, null, 2));
    } catch (err) {
        console.error("Ошибка сохранения настроек:", err);
    }
}

// Загружаем при импорте модуля
loadSettings();

/**
 * Получить настройки пользователя
 * @param {number} userId - ID пользователя Telegram
 * @returns {object} - Настройки пользователя
 */
function getUserSettings(userId) {
    if (!userSettings[userId]) {
        userSettings[userId] = { ...DEFAULT_SETTINGS };
    }
    return userSettings[userId];
}

/**
 * Включить водяной знак для пользователя
 * @param {number} userId - ID пользователя Telegram
 */
function watermarkON(userId) {
    if (!userSettings[userId]) {
        userSettings[userId] = { ...DEFAULT_SETTINGS };
    }
    userSettings[userId].watermark = true;
    saveSettings();
}

/**
 * Выключить водяной знак для пользователя
 * @param {number} userId - ID пользователя Telegram
 */
function watermarkOFF(userId) {
    if (!userSettings[userId]) {
        userSettings[userId] = { ...DEFAULT_SETTINGS };
    }
    userSettings[userId].watermark = false;
    saveSettings();
}

/**
 * Проверить включен ли водяной знак
 * @param {number} userId - ID пользователя Telegram
 * @returns {boolean}
 */
function isWatermarkON(userId) {
    return getUserSettings(userId).watermark;
}

module.exports = {
    getUserSettings,
    watermarkON,
    watermarkOFF,
    isWatermarkON
};
