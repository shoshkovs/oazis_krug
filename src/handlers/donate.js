// Обработчики для доната через Telegram Stars

const { InlineKeyboard } = require("grammy");
const { BOT_TEXTS } = require("../bot_texts");
const { logError } = require("../utils/error-handler");
const { cleanReply } = require("../utils/clean-chat");

/**
 * Отправляет invoice для оплаты звёздами
 */
async function sendDonateInvoice(ctx, amount) {
    await ctx.api.raw.sendInvoice({
        chat_id: ctx.chat.id,
        title: BOT_TEXTS.DONATE_TITLE(amount),
        description: BOT_TEXTS.DONATE_DESCRIPTION(amount),
        payload: `donate_${amount}_${ctx.from.id}`,
        provider_token: "",
        currency: "XTR",
        prices: JSON.stringify([{ label: "Stars", amount }])
    });
}

/**
 * Регистрирует все обработчики для доната
 */
function registerDonateHandlers(bot) {
    // Команда /donate — показываем кнопки выбора суммы
    bot.command("donate", async (ctx) => {
        const keyboard = new InlineKeyboard()
            .text(BOT_TEXTS.DONATE_BUTTON_50, "donate_50")
            .row()
            .text(BOT_TEXTS.DONATE_BUTTON_100, "donate_100")
            .row()
            .text(BOT_TEXTS.DONATE_BUTTON_150, "donate_150");
        
        await cleanReply(ctx, BOT_TEXTS.DONATE, {
            reply_markup: keyboard,
        });
    });

    // Обработка нажатия на кнопку доната
    bot.callbackQuery(/^donate_(\d+)$/, async (ctx) => {
        const amount = parseInt(ctx.match[1], 10);
        
        try {
            await ctx.answerCallbackQuery();
            await sendDonateInvoice(ctx, amount);
        } catch (error) {
            logError(error, "Обработка доната");
            await ctx.answerCallbackQuery(BOT_TEXTS.DONATE_ERROR);
        }
    });

    // Подтверждение pre_checkout_query
    bot.on("pre_checkout_query", (ctx) => {
        ctx.answerPreCheckoutQuery(true);
    });

    // Успешная оплата
    bot.on("message:successful_payment", async (ctx) => {
        const payment = ctx.message.successful_payment;
        console.log("Оплата прошла:", payment);
        await ctx.reply(BOT_TEXTS.DONATE_THANKS(payment.total_amount));
    });
}

module.exports = { registerDonateHandlers, sendDonateInvoice };
