const puppeteer = require('puppeteer');
const { getProxy } = require('../utils/proxy');

const handleImei = async (ctx) => {
    const imei = ctx.message.text.split(' ')[1];
    
    if (!imei || !/^\d{15}$/.test(imei)) {
        return ctx.reply('⚠️ Format: /imei <15_digit_imei>\nContoh: /imei 354273000112345');
    }

    await ctx.reply('🔍 Memeriksa IMEI...');

    try {
        const results = await Promise.all([
            checkBlacklist(imei),
            searchMarketplaceHistory(imei),
            searchDeviceCorrelation(imei)
        ]);

        const [blacklistInfo, marketplaceInfo, correlationInfo] = results;

        let response = `📱 Hasil Pemeriksaan IMEI: ${imei}\n\n`;

        // Blacklist Status
        response += `🚫 Status Blacklist:\n${blacklistInfo.isBlacklisted ? 
            '- TERBLACKLIST ⚠️\n- Alasan: ' + blacklistInfo.reason :
            '- Tidak ditemukan dalam daftar hitam ✅'}\n\n`;

        // Marketplace History
        response += `🏪 Riwayat Marketplace:\n`;
        if (marketplaceInfo.length > 0) {
            marketplaceInfo.forEach(info => {
                response += `- ${info.platform}: ${info.details}\n`;
                response += `  Waktu: ${new Date(info.timestamp).toLocaleString('id-ID')}\n`;
            });
        } else {
            response += '- Tidak ditemukan riwayat penjualan\n';
        }

        // Device Correlation
        response += `\n🔗 Korelasi Perangkat:\n`;
        if (correlationInfo.length > 0) {
            correlationInfo.forEach(info => {
                response += `- ${info.app}: ${info.username}\n`;
                response += `  Login terakhir: ${new Date(info.lastLogin).toLocaleString('id-ID')}\n`;
            });
        } else {
            response += '- Tidak ditemukan korelasi\n';
        }

        await ctx.reply(response, {
            parse_mode: 'Markdown'
        });

    } catch (error) {
        console.error('IMEI Trace Error:', error);
        await ctx.reply('⚠️ Terjadi kesalahan saat memeriksa IMEI.');
    }
};

async function checkBlacklist(imei) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        proxy: await getProxy()
    });

    try {
        const page = await browser.newPage();
        
        // Check various IMEI blacklist databases
        // This is a placeholder - implement actual blacklist checking logic
        
        return {
            isBlacklisted: false,
            reason: null
        };
    } finally {
        await browser.close();
    }
}

async function searchMarketplaceHistory(imei) {
    // Search marketplace history
    // This is a placeholder - implement actual marketplace search logic
    return [];
}

async function searchDeviceCorrelation(imei) {
    // Search for device correlations
    // This is a placeholder - implement actual correlation logic
    return [];
}

module.exports = {
    handleImei
}; 