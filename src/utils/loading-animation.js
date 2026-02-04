// Анимация загрузки для сообщений бота

const LOADING_FRAMES = [
    "processing.",
    "processing..",
    "processing...",
];

const ANIMATION_INTERVAL = 500; // мс между кадрами

/**
 * Запускает анимацию загрузки
 * @returns {object} объект с intervalId для остановки
 */
function startLoadingAnimation(ctx, messageId) {
    let frameIndex = 0;
    
    const intervalId = setInterval(async () => {
        frameIndex = (frameIndex + 1) % LOADING_FRAMES.length;
        try {
            await ctx.api.editMessageText(
                ctx.chat.id,
                messageId,
                LOADING_FRAMES[frameIndex]
            );
        } catch (err) {
            // Игнорируем ошибки редактирования
        }
    }, ANIMATION_INTERVAL);
    
    return intervalId;
}

/**
 * Останавливает анимацию загрузки
 */
function stopLoadingAnimation(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
    }
}

/**
 * Возвращает первый кадр анимации
 */
function getFirstFrame() {
    return LOADING_FRAMES[0];
}

module.exports = {
    startLoadingAnimation,
    stopLoadingAnimation,
    getFirstFrame,
    LOADING_FRAMES,
};
