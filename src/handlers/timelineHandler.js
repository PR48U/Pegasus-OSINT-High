const puppeteer = require('puppeteer');
const { PDFDocument, rgb } = require('pdf-lib');
const { getProxy } = require('../utils/proxy');

const handleTimeline = async (ctx) => {
    const target = ctx.message.text.split(' ')[1];
    
    if (!target) {
        return ctx.reply('⚠️ Format: /linimasa <email/username>');
    }

    await ctx.reply('🔍 Menganalisis aktivitas digital...');

    try {
        const activities = await Promise.all([
            scrapeSocialMedia(target),
            scrapeForumActivity(target),
            scrapeMarketplaceActivity(target)
        ]);

        const timeline = activities
            .flat()
            .filter(activity => activity)
            .sort((a, b) => b.timestamp - a.timestamp);

        if (timeline.length === 0) {
            return ctx.reply('❌ Tidak ditemukan aktivitas digital untuk target tersebut.');
        }

        // Generate response message
        let response = `📊 Timeline Aktivitas Digital\n\n`;
        response += `🎯 Target: ${target}\n`;
        response += `📅 Periode: ${new Date(timeline[timeline.length - 1].timestamp).toLocaleDateString('id-ID')} - ${new Date(timeline[0].timestamp).toLocaleDateString('id-ID')}\n\n`;

        // Show last 5 activities in chat
        const recentActivities = timeline.slice(0, 5);
        recentActivities.forEach(activity => {
            response += `⏰ ${new Date(activity.timestamp).toLocaleString('id-ID')}\n`;
            response += `📱 Platform: ${activity.platform}\n`;
            response += `🔍 Aktivitas: ${activity.action}\n`;
            if (activity.location) {
                response += `📍 Lokasi: ${activity.location}\n`;
            }
            response += `\n`;
        });

        // Generate PDF report
        const pdfBuffer = await generatePDFReport(timeline, target);

        // Send response and PDF
        await ctx.reply(response, { parse_mode: 'Markdown' });
        await ctx.replyWithDocument(
            { source: pdfBuffer, filename: `timeline_${target}.pdf` },
            { caption: '📄 Laporan lengkap timeline aktivitas digital' }
        );

    } catch (error) {
        console.error('Timeline Analysis Error:', error);
        await ctx.reply('⚠️ Terjadi kesalahan saat menganalisis timeline.');
    }
};

async function scrapeSocialMedia(target) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        proxy: await getProxy()
    });

    try {
        const page = await browser.newPage();
        
        // Implement social media scraping logic here
        // This is a placeholder
        
        return [{
            timestamp: Date.now(),
            platform: 'Twitter',
            action: 'Posted tweet',
            location: 'Jakarta, Indonesia'
        }];
    } finally {
        await browser.close();
    }
}

async function scrapeForumActivity(target) {
    // Implement forum activity scraping
    return [];
}

async function scrapeMarketplaceActivity(target) {
    // Implement marketplace activity scraping
    return [];
}

async function generatePDFReport(timeline, target) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Add header
    page.drawText('LAPORAN TIMELINE AKTIVITAS DIGITAL', {
        x: 50,
        y: height - 50,
        size: 20
    });

    page.drawText(`Target: ${target}`, {
        x: 50,
        y: height - 80,
        size: 12
    });

    // Add timeline entries
    let yPosition = height - 120;
    timeline.forEach((activity, index) => {
        if (yPosition < 50) {
            // Add new page if needed
            const newPage = pdfDoc.addPage();
            yPosition = height - 50;
        }

        const date = new Date(activity.timestamp).toLocaleString('id-ID');
        page.drawText(`${date} - ${activity.platform}`, {
            x: 50,
            y: yPosition,
            size: 10,
            color: rgb(0.1, 0.1, 0.1)
        });

        page.drawText(activity.action, {
            x: 50,
            y: yPosition - 15,
            size: 10
        });

        if (activity.location) {
            page.drawText(`Lokasi: ${activity.location}`, {
                x: 50,
                y: yPosition - 30,
                size: 10,
                color: rgb(0.5, 0.5, 0.5)
            });
        }

        yPosition -= 50;
    });

    return await pdfDoc.save();
}

module.exports = {
    handleTimeline
}; 