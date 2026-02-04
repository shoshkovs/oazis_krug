// Обработка ошибок
// Все функции для проверки и обработки различных типов ошибок

const { BOT_TEXTS } = require("../bot_texts");
const { CONSTANTS } = require("../config/constants");

/**
 * Проверяет, является ли ошибка ошибкой "файл слишком большой"
 */
function isFileTooBigError(error) {
    return (
        error.description && 
        error.description.includes("file is too big")
    ) || (
        error.message && 
        error.message.includes("file is too big")
    );
}

/**
 * Проверяет, является ли ошибка ошибкой сети (проблемы с интернетом)
 */
function isNetworkError(error) {
    return (
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT" ||
        error.message?.includes("fetch failed")
    );
}

/**
 * Проверяет, является ли ошибка ошибкой FFmpeg (проблемы с конвертацией)
 */
function isFFmpegError(error) {
    return (
        error.message?.includes("ffmpeg") ||
        error.message?.includes("FFmpeg") ||
        error.message?.includes("Error opening output file")
    );
}

/**
 * Проверяет, является ли ошибка ошибкой Telegram API
 */
function isTelegramApiError(error) {
    return (
        error.error_code !== undefined ||
        error.method !== undefined ||
        error.description !== undefined
    );
}

/**
 * Получает сообщение для пользователя в зависимости от типа ошибки
 */
function getUserErrorMessage(error) {
    if (isFileTooBigError(error)) {
        return BOT_TEXTS.FILE_TOO_BIG;
    }
    
    if (isNetworkError(error)) {
        return "❌ Проблема с интернет-соединением.\nПопробуй ещё раз через несколько секунд.";
    }
    
    if (isFFmpegError(error)) {
        return "❌ Ошибка при обработке видео.\nПопробуй отправить другое видео.";
    }
    
    if (isTelegramApiError(error)) {
        return "❌ Ошибка Telegram API.\nПопробуй ещё раз.";
    }
    
    // Общая ошибка по умолчанию
    return BOT_TEXTS.ERROR_GENERIC;
}

/**
 * Логирует ошибку в консоль с подробной информацией
 */
function logError(error, context = "") {
    console.error("=".repeat(50));
    if (context) {
        console.error(`Контекст: ${context}`);
    }
    console.error("Тип ошибки:", error.constructor.name);
    console.error("Сообщение:", error.message || error.description);
    if (error.stack) {
        console.error("Стек:", error.stack);
    }
    if (error.error_code) {
        console.error("Код ошибки:", error.error_code);
    }
    console.error("=".repeat(50));
}

/**
 * Проверяет размер файла перед обработкой
 */
function checkFileSize(fileSize) {
    if (!fileSize) {
        return { valid: true }; // Если размер неизвестен, пропускаем
    }
    
    if (fileSize > CONSTANTS.MAX_FILE_SIZE) {
        return {
            valid: false,
            message: BOT_TEXTS.FILE_TOO_BIG
        };
    }
    
    return { valid: true };
}

module.exports = {
    isFileTooBigError,
    isNetworkError,
    isFFmpegError,
    isTelegramApiError,
    getUserErrorMessage,
    logError,
    checkFileSize,
};
