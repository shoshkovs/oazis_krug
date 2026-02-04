// Функция для наложения водяного знака с хромакеем
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { CONSTANTS } = require("../config/constants");

ffmpeg.setFfmpegPath(CONSTANTS.FFMPEG_PATH);

// Путь к видео с хромакеем
const WATERMARK_VIDEO = path.join(__dirname, "..", "..", "logos", "oazis_chrome.mov");

/**
 * Конвертация видео в кружочек с наложением водяного знака
 * Водяной знак вырезается с хромакея и зацикливается на всю длину видео
 * 
 * @param {string} inputPath - Путь к исходному видео
 * @param {string} outputPath - Путь для сохранения результата
 */
async function convertWithWatermark(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const size = CONSTANTS.VIDEO_NOTE_SIZE;
        
        // Сложный фильтр:
        // 1. Масштабируем и обрезаем основное видео до квадрата
        // 2. Зацикливаем видео водяного знака (-stream_loop -1)
        // 3. Масштабируем водяной знак под размер кружка
        // 4. Убираем хромакей (зеленый фон) с помощью colorkey
        // 5. Накладываем водяной знак поверх основного видео
        
        // Размер водяного знака (можно менять)
        const watermarkSize = 450;
        // Позиция: по центру
        const posX = (size - watermarkSize) / 2;
        const posY = (size - watermarkSize) / 2;
        
        const filterComplex = [
            // Основное видео: масштаб + кроп до квадрата
            `[0:v]scale=${size}:${size}:force_original_aspect_ratio=increase,crop=${size}:${size}[main]`,
            // Водяной знак: масштаб + удаление хромакея (зеленый)
            `[1:v]scale=${watermarkSize}:${watermarkSize},colorkey=0x000000:0.3:0.1[watermark]`,
            // Наложение водяного знака в правом нижнем углу
            `[main][watermark]overlay=${posX}:${posY}:shortest=1[outv]`
        ].join(";");
        
        const cmd = ffmpeg();
        
        // Добавляем основное видео
        cmd.input(inputPath);
        
        // Добавляем водяной знак с зацикливанием (опции ПЕРЕД input)
        cmd.addInput(WATERMARK_VIDEO);
        cmd.inputOptions("-stream_loop", "-1");
        
        cmd.complexFilter(filterComplex)
            .outputOptions([
                "-map", "[outv]",
                "-map", "0:a?", // Аудио из основного видео (если есть)
                `-t ${CONSTANTS.VIDEO_NOTE_DURATION}`,
                `-preset ${CONSTANTS.VIDEO_PRESET}`,
                `-crf ${CONSTANTS.VIDEO_CRF}`
            ])
            .videoCodec("libx264")
            .videoBitrate(CONSTANTS.VIDEO_BITRATE)
            .audioCodec("aac")
            .audioBitrate(CONSTANTS.AUDIO_BITRATE)
            .format("mp4")
            .save(outputPath)
            .on("start", (cmdline) => {
                console.log("🎬 FFmpeg команда:", cmdline);
            })
            .on("end", () => {
                console.log("✅ Видео с водяным знаком сконвертировано:", outputPath);
                resolve(outputPath);
            })
            .on("error", (err) => {
                console.error("❌ Ошибка конвертации с водяным знаком:", err);
                reject(err);
            });
    });
}

module.exports = { convertWithWatermark };
