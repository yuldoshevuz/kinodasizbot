import { Scenes } from "telegraf";
import { adminKeyboard } from "../../utils/keyboards.js";
import { UserModel } from "../../models/user.model.js";
import { bot } from "../../core/bot.js";
import { errorHandler } from "../../helpers/error.handler.js";

export const adminScene = new Scenes.BaseScene("admin");

adminScene.enter(async (ctx) => {
    await ctx.reply(
        'Admin paneliga xush kelibsiz!',
       adminKeyboard()
    )
})

adminScene.hears('📊 Statistika', async (ctx) => {
    try {
        const totalUsers = await UserModel.find()
        const activeUsers = totalUsers.filter(user => user.active)
        const inactiveUsers = totalUsers.filter(user => !user.active)

        const count = {
            total: totalUsers.length,
            active: activeUsers.length,
            inactive: inactiveUsers.length
        }

        for (const user of activeUsers) {
            const status = await bot.telegram.sendChatAction(user.chatId, 'typing').catch(() => false)
        
            if (!status) {
                await UserModel.findOneAndUpdate({ chatId: user.chatId }, {
                    active: false
                })
                count.inactive++
                count.active--
            }
        }

        await ctx.replyWithHTML(
            `<b>📊 Barcha foydalanuvchilar:</b> ${count.total} ta\n\n` +
            `<b>🟢 Aktiv bo'lgan:</b> ${count.active} ta\n\n` +
            `<b>🔴 Aktiv bo'lmagan:</b> ${count.inactive} ta`
        )
    } catch (error) {
        errorHandler(error, ctx)
    }
})

adminScene.hears("📨 Yangi xabar", async (ctx) => ctx.scene.enter("send-message"))
adminScene.hears("🎬 Kinolar", async (ctx) => ctx.scene.enter("movies"))
adminScene.hears("🔔 Majburiy obuna", async (ctx) => ctx.scene.enter("channels"))

adminScene.hears("⬅️ Chiqish", async (ctx) => ctx.scene.enter("start"))