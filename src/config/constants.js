// Константы приложения
const ffmpegPath = require("ffmpeg-static");

const CONSTANTS = {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20 МБ
    
    // Настройки video note
    VIDEO_NOTE_SIZE: 640,              // Размер кружочка 
    VIDEO_NOTE_DURATION: 60,            // длительность
    
    // Настройки качества FFmpeg (улучшенные)
    VIDEO_BITRATE: "4000k",            // Битрейт вид (4 Мб/с)
    AUDIO_BITRATE: "192k",             // Битрейт ауд (192 кб/с)
    VIDEO_CRF: 18,                      // Качество (18 = высокое, 23 = среднее)
    VIDEO_PRESET: "slow",               // Preset для кодирования (slow = лучше качество) 
    // Пути
    FFMPEG_PATH: ffmpegPath,
    TEMP_DIR_NAME: "video_buffer",      // Имя папки для временных файлов
    
    // Функция для создания URL файла Telegram
    getTelegramFileUrl: (token, filePath) => 
        `https://api.telegram.org/file/bot${token}/${filePath}`,
};

module.exports = { CONSTANTS };
