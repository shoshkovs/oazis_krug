// Управление чистотой чата — удаление старых сообщений бота

// Хранилище последних сообщений бота для каждого чата
const lastBotMessages = new Map();

/**
 * Удаляет предыдущее сообщение бота и отправляет новое
 * @param {Context} ctx - контекст grammy
 * @param {string} text - текст нового сообщения
 * @param {object} options - опции для reply (reply_markup и т.д.)
 * @returns {Message} отправленное сообщение
 */
async function cleanReply(ctx, text, options = {}) {
    const chatId = ctx.chat.id;
    
    // Удаляем предыдущее сообщение бота (если есть)
    const lastMessageId = lastBotMessages.get(chatId);
    if (lastMessageId) {
        try {
            await ctx.api.deleteMessage(chatId, lastMessageId);
        } catch (err) {
            // Игнорируем ошибки (сообщение могло быть уже удалено)
        }
    }
    
    // Отправляем новое сообщение
    const sentMessage = await ctx.reply(text, options);
    
    // Сохраняем ID нового сообщения
    lastBotMessages.set(chatId, sentMessage.message_id);
    
    return sentMessage;
}

/**
 * Удаляет последнее сообщение бота без отправки нового
 * @param {Context} ctx - контекст grammy
 */
async function deleteLastBotMessage(ctx) {
    const chatId = ctx.chat.id;
    const lastMessageId = lastBotMessages.get(chatId);
    
    if (lastMessageId) {
        try {
            await ctx.api.deleteMessage(chatId, lastMessageId);
            lastBotMessages.delete(chatId);
        } catch (err) {
            // Игнорируем ошибки
        }
    }
}

/**
 * Сохраняет ID сообщения как последнее сообщение бота
 * @param {number} chatId - ID чата
 * @param {number} messageId - ID сообщения
 */
function setLastBotMessage(chatId, messageId) {
    lastBotMessages.set(chatId, messageId);
}

/**
 * Очищает запись о последнем сообщении (без удаления самого сообщения)
 * @param {number} chatId - ID чата
 */
function clearLastBotMessage(chatId) {
    lastBotMessages.delete(chatId);
}

module.exports = {
    cleanReply,
    deleteLastBotMessage,
    setLastBotMessage,
    clearLastBotMessage,
};
