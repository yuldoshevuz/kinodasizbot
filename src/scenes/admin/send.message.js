import { Scenes } from "telegraf";
import { adminKeyboard, backKeyboard, sendOrCanelKeyboard } from "../../utils/keyboards.js";
import { UserModel } from "../../models/user.model.js";
import { sendMessage } from "../../helpers/send.message.js";

export const sendMessageScene = new Scenes.BaseScene("send-message");

sendMessageScene.enter(async (ctx) => {
    try {
        await ctx.replyWithHTML(
            "<b>Xabar matnini kiriting!</b>",
            backKeyboard()
        )
    } catch (error) {
        
    }
})

sendMessageScene.hears("◀️ Ortga", async (ctx) => ctx.scene.enter("admin"))

sendMessageScene.hears(async (text, ctx) => {
    try {
        if (!ctx.session.textMsg) {
            const formattedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;")

            await ctx.replyWithHTML(
                `<b>Xabar matni:</b> \n\n${formattedText}`,
                sendOrCanelKeyboard()
            )
            ctx.session.textMsg = formattedText
        } else {
            ctx.deleteMessage()
        }
    } catch (error) {
        
    }
})

sendMessageScene.action(async (data, ctx) => {
    try {
        ctx.answerCbQuery("")
        const { textMsg } = ctx.session

        if (textMsg) {
            if (data === "send-text") {
                const totalUsers = await UserModel.find()
                const activeUsers = totalUsers.filter(user => user.active)
                const inactiveUsers = totalUsers.filter(user => !user.active)

                const count = {
                    active: activeUsers.length,
                    inactive: inactiveUsers.length
                }

                for (const user of activeUsers) {
                    const sendedMessage = await sendMessage(user.chatId, textMsg)

                    if (!sendedMessage) {
                        count.inactive++
                        count.active--
                    }
                }

                const text =
                    `Xabar <b>${count.active}</b> ta foydalanuvchiga muvaffaqiyatli yuborildi. ✅ `+
                    `${ count.inactive? `<b>${count.inactive}</b> ta foydalanuvchiga yuborilmadi, ❌` :"" }`
                
                await ctx.editMessageReplyMarkup({})
                await ctx.replyWithHTML(
                    text,
                    adminKeyboard()
                )
            } else if (data === "cancel") {
                await ctx.editMessageReplyMarkup()
                await ctx.reply(
                    "☑️ Bekor qilindi",
                    adminKeyboard()
                )
            }
            
            delete ctx.session.textMsg
            ctx.scene.enter("admin", {}, true)
        }
    } catch (error) {
        
    }
})