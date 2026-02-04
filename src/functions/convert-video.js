// Функция для конвертации видео в кружочек
const ffmpeg = require("fluent-ffmpeg");
const { CONSTANTS } = require("../config/constants");

ffmpeg.setFfmpegPath(CONSTANTS.FFMPEG_PATH);

/**
 * Конвертация видео в кружочек
 */
async function convertToVideoNote(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const size = CONSTANTS.VIDEO_NOTE_SIZE;
        
        ffmpeg(inputPath)
            .videoFilters(`scale=${size}:${size}:force_original_aspect_ratio=increase,crop=${size}:${size}`)
            .duration(CONSTANTS.VIDEO_NOTE_DURATION)
            .videoCodec("libx264")
            .videoBitrate(CONSTANTS.VIDEO_BITRATE)
            .audioCodec("aac")
            .audioBitrate(CONSTANTS.AUDIO_BITRATE)
            .outputOptions([
                `-preset ${CONSTANTS.VIDEO_PRESET}`,
                `-crf ${CONSTANTS.VIDEO_CRF}`
            ])
            .format("mp4")
            .save(outputPath)
            .on("end", () => {
                console.log("✅ Видео сконвертировано:", outputPath);
                resolve(outputPath);
            })
            .on("error", (err) => {
                console.error("❌ Ошибка конвертации:", err);
                reject(err);
            });
    });
}

module.exports = { convertToVideoNote };