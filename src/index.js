const { Bot, InputFile, InlineKeyboard } = require("grammy");
require("dotenv").config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot  = new Bot(token);
const fs = require("fs");
const path = require("path");
const { convertToVideoNote } = require("./functions/convert-video");
const { convertWithWatermark } = require("./functions/add-watermark");
const { CONSTANTS } = require("./config/constants");
const { BOT_TEXTS } = require("./bot_texts");
const { getUserErrorMessage, logError, checkFileSize } = require("./utils/error-handler");
const { startLoadingAnimation, stopLoadingAnimation, getFirstFrame } = require("./utils/loading-animation");
const { cleanReply } = require("./utils/clean-chat");
const { registerDonateHandlers } = require("./handlers/donate");
const { watermarkON, watermarkOFF, isWatermarkON } = require("./config/user-settings");

const TEMP_DIR = path.join(__dirname, "..", CONSTANTS.TEMP_DIR_NAME);

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

bot.command("start", (ctx) => {
    cleanReply(ctx, BOT_TEXTS.START);
});

bot.command("help", (ctx) => {
    cleanReply(ctx, BOT_TEXTS.HELP);
});

bot.command("forward", (ctx) => {
    cleanReply(ctx, BOT_TEXTS.FORWARD);
});

// Команды управления водяным знаком
bot.command("mark_on", (ctx) => {
    const userId = ctx.from.id;
    watermarkON(userId);
    cleanReply(ctx, BOT_TEXTS.MARK_ON);
});

bot.command("mark_off", (ctx) => {
    const userId = ctx.from.id;
    watermarkOFF(userId);
    cleanReply(ctx, BOT_TEXTS.MARK_OFF);
});

// Регистрируем обработчики доната
registerDonateHandlers(bot);

// Получили видео - отправили ответ бота
bot.on("message:video", async (ctx) => {
    let inputPath = null;
    let outputPath = null;
    let loadingInterval = null;
    let statusMessage = null;
    
    try {
        // Отправляем первое сообщение и запускаем анимацию
        statusMessage = await ctx.reply(getFirstFrame());
        loadingInterval = startLoadingAnimation(ctx, statusMessage.message_id);

        const video = ctx.message.video;
        const fileId = video.file_id;
        
        // Проверяем размер файла
        const sizeCheck = checkFileSize(video.file_size);
        if (!sizeCheck.valid) {
            stopLoadingAnimation(loadingInterval);
            await ctx.api.editMessageText(ctx.chat.id, statusMessage.message_id, sizeCheck.message);
            return;
        }
        
        const file = await ctx.api.getFile(fileId);
        const fileUrl = CONSTANTS.getTelegramFileUrl(token, file.file_path);
        inputPath = path.join(TEMP_DIR, `input_${Date.now()}.mp4`);
        outputPath = path.join(TEMP_DIR, `output_${Date.now()}.mp4`);
        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(buffer));

        // Проверяем настройку водяного знака пользователя
        const userId = ctx.from.id;
        const useWatermark = isWatermarkON(userId);
        console.log(`🔍 User ${userId}: watermark = ${useWatermark}`);
        
        if (useWatermark) {
            await convertWithWatermark(inputPath, outputPath);
        } else {
            await convertToVideoNote(inputPath, outputPath);
        }
        
        // Останавливаем анимацию и удаляем сообщение статуса
        stopLoadingAnimation(loadingInterval);
        await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id);
        
        // Отправляем результат
        await ctx.replyWithVideoNote(new InputFile(outputPath));
        await ctx.reply(BOT_TEXTS.SUCCESS);

    } catch (error) {
        stopLoadingAnimation(loadingInterval);
        logError(error, "Обработка видео");
        const errorMessage = getUserErrorMessage(error);
        
        if (statusMessage) {
            await ctx.api.editMessageText(ctx.chat.id, statusMessage.message_id, errorMessage);
        } else {
            await ctx.reply(errorMessage);
        }

    } finally {
        // Удаляем временные файлы в любом случае (даже при ошибке)
        if (inputPath && fs.existsSync(inputPath)) {
            try {
                fs.unlinkSync(inputPath);
            } catch (err) {
                console.error("Не удалось удалить input файл:", err);
            }
        }
        if (outputPath && fs.existsSync(outputPath)) {
            try {
                fs.unlinkSync(outputPath);
            } catch (err) {
                console.error("Не удалось удалить output файл:", err);
            }
        }
    }
});

// Ответы на неподдерживаемые форматы
bot.on("message:sticker", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_STICKER));
bot.on("message:photo", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_PHOTO));
bot.on("message:audio", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_AUDIO));
bot.on("message:voice", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_VOICE));
bot.on("message:video_note", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_VIDEO_NOTE));
bot.on("message:document", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_DOCUMENT));
bot.on("message:animation", (ctx) => cleanReply(ctx, BOT_TEXTS.WRONG_GIF));

// Текстовые сообщения (кроме команд)
bot.on("message:text", (ctx) => {
    if (ctx.message.text.startsWith("/")) return;
    cleanReply(ctx, BOT_TEXTS.WRONG_TEXT);
});

bot.start();
console.log("Бот запущен✅")

