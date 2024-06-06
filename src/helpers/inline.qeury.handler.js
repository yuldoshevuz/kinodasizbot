import { bot } from "../core/bot.js";
import { MovieModel } from "../models/movie.model.js";
import { movieKeyboard } from "../utils/keyboards.js";

export const inlineQueryHandler = async (ctx) => {
    try {
        const movieCode = ctx.inlineQuery.query
        
        const movie = await MovieModel.findOne({ code: movieCode });
        if (movie) {
            await ctx.replyWithVideo(movie.link, {
                caption: `<b>Kino nomi:</b> ${movie.title}\n\n`+
                        `<b>Kino kodi:</b> ${movie.code}\n\n`+
                        `<b>Tavsif:</b> ${movie.description}\n\n`+
                        `<b>🤖 Bizning bot: @${bot.botInfo?.username}</b>`,
                parse_mode: "HTML",
                ...movieKeyboard(movie.code)
            });
        } else {
            ctx.answerInlineQuery([]);
        }
    } catch (error) {
        console.error(error);
        ctx.answerInlineQuery([]);
    }
};