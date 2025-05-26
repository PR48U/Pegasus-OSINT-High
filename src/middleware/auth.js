const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/auth.log' })
    ]
});

// Whitelist of authorized Telegram user IDs
const authorizedUsers = process.env.AUTHORIZED_USERS ? 
    process.env.AUTHORIZED_USERS.split(',').map(id => parseInt(id.trim())) : 
    [];

const verifyUser = async (ctx, next) => {
    const userId = ctx.from?.id;
    
    if (!userId) {
        logger.warn('Access attempt without user ID');
        return ctx.reply('⚠️ Akses ditolak: User ID tidak valid');
    }

    if (!authorizedUsers.includes(userId)) {
        logger.warn(`Unauthorized access attempt from user ID: ${userId}`);
        return ctx.reply('🚫 Akses ditolak: Anda tidak memiliki izin untuk menggunakan bot ini.\n\nHubungi administrator untuk mendapatkan akses.');
    }

    // Log successful access
    logger.info(`Authorized access from user ID: ${userId}`, {
        username: ctx.from.username,
        command: ctx.message?.text
    });

    return next();
};

module.exports = {
    verifyUser
}; 