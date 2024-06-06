import { bot } from "../core/bot.js"
import { UserModel } from "../models/user.model.js"
import { errorHandler } from "./error.handler.js"

export const sendMessage = async (chatId, message) => {
    try {
        const status = await bot.telegram.sendChatAction(chatId, "typing").catch(() => false)

        if (status) {
            await bot.telegram.sendMessage(
                chatId, message, { parse_mode: "HTML" }
            )
        } else {
            await UserModel.findOneAndUpdate({ chatId }, { active: false })
        }

        return status
    } catch (error) {
        errorHandler(error)
    }
}