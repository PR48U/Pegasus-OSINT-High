const puppeteer = require('puppeteer');
const NodeGeocoder = require('node-geocoder');
const { getProxy } = require('../utils/proxy');
const { scoreAccuracy } = require('../utils/scoring');

const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: process.env.GOOGLE_MAPS_API_KEY
});

const handleCekPos = async (ctx) => {
    const input = ctx.message.text.split(' ')[1];
    
    if (!input) {
        return ctx.reply('⚠️ Format: /cekpos <nomor_hp/nik/email>');
    }

    await ctx.reply('🔍 Mencari informasi lokasi...');

    try {
        const results = await Promise.all([
            searchMarketplaces(input),
            searchSocialMedia(input),
            searchPublicRecords(input)
        ]);

        const locations = results.flat().filter(loc => loc);

        if (locations.length === 0) {
            return ctx.reply('❌ Tidak ditemukan informasi lokasi untuk target tersebut.');
        }

        // Get the most recent location
        const mostRecent = locations.reduce((prev, current) => 
            (current.timestamp > prev.timestamp) ? current : prev
        );

        // Score the accuracy
        const accuracyScore = scoreAccuracy(mostRecent.timestamp);

        // Get Google Maps link
        const coordinates = await geocoder.geocode(mostRecent.location);
        const mapsLink = coordinates.length > 0 ? 
            `https://www.google.com/maps?q=${coordinates[0].latitude},${coordinates[0].longitude}` :
            null;

        let response = `✅ Informasi Lokasi Ditemukan\n\n`;
        response += `📍 Lokasi: ${mostRecent.location}\n`;
        response += `⏰ Waktu: ${new Date(mostRecent.timestamp).toLocaleString('id-ID')}\n`;
        response += `🎯 Skor Akurasi: ${accuracyScore}/100\n`;
        response += `📱 Sumber: ${mostRecent.source}\n`;
        
        if (mapsLink) {
            response += `\n🗺 [Lihat di Google Maps](${mapsLink})`;
        }

        await ctx.reply(response, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });

    } catch (error) {
        console.error('CekPos Error:', error);
        await ctx.reply('⚠️ Terjadi kesalahan saat mencari informasi lokasi.');
    }
};

async function searchMarketplaces(target) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        proxy: await getProxy()
    });

    try {
        const page = await browser.newPage();
        
        // Search Tokopedia
        await page.goto('https://www.tokopedia.com');
        // Implement marketplace scraping logic here
        
        // Search OLX
        await page.goto('https://www.olx.co.id');
        // Implement OLX scraping logic here

        return [{
            location: 'Sample Location',
            timestamp: Date.now(),
            source: 'Marketplace'
        }];
    } finally {
        await browser.close();
    }
}

async function searchSocialMedia(target) {
    // Implement social media search logic
    return [];
}

async function searchPublicRecords(target) {
    // Implement public records search logic
    return [];
}

module.exports = {
    handleCekPos
}; 