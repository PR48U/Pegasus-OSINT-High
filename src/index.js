require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const winston = require('winston');
const { setupDatabase } = require('./config/database');
const { setupProxy } = require('./utils/proxy');
const { verifyUser } = require('./middleware/auth');
const { handleCekPos } = require('./handlers/cekposHandler');
const { handleImei } = require('./handlers/imeiHandler');
const { handleTimeline } = require('./handlers/timelineHandler');

// Initialize logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
bot.use(verifyUser);

// Start command
bot.command('start', (ctx) => {
    ctx.reply(`🔒 *CekPosIntelBot - Pegasus OSINT*\n\nSelamat datang di sistem intelijen digital.\n\nPerintah yang tersedia:\n/cekpos - Verifikasi posisi\n/imei - Trace IMEI\n/linimasa - Analisis timeline\n\n_Sistem ini hanya untuk penggunaan resmi._`, {
        parse_mode: 'Markdown'
    });
});

// Help command
bot.command('help', (ctx) => {
    ctx.reply(`📚 *Panduan Penggunaan*\n\n1. /cekpos <nomor_hp/nik/email>\n2. /imei <nomor_imei>\n3. /linimasa <email/username>\n\nContoh:\n/cekpos 081234567890\n/imei 354273000112345\n/linimasa user@domain.com`, {
        parse_mode: 'Markdown'
    });
});

// Main commands
bot.command('cekpos', handleCekPos);
bot.command('imei', handleImei);
bot.command('linimasa', handleTimeline);

// Error handling
bot.catch((err, ctx) => {
    logger.error('Bot error', {
        error: err,
        update: ctx.update
    });
    ctx.reply('⚠️ Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.');
});

// Express server for webhooks
const app = express();
app.use(express.json());

// Webhook endpoint
app.post(`/webhook/${process.env.WEBHOOK_PATH}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Initialize
async function startBot() {
    try {
        // Setup database connection
        await setupDatabase();
        
        // Setup proxy rotation
        await setupProxy();

        // Start Express server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

        // Start bot
        await bot.launch({
            webhook: {
                domain: process.env.WEBHOOK_DOMAIN,
                port: PORT
            }
        });

        logger.info('Bot started successfully');
    } catch (error) {
        logger.error('Failed to start bot', { error });
        process.exit(1);
    }
}

startBot(); 