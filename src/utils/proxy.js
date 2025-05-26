const ProxyChain = require('proxy-chain');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/proxy.log' })
    ]
});

// List of proxy servers (should be configured via environment variables in production)
let proxyList = process.env.PROXY_LIST ? 
    process.env.PROXY_LIST.split(',').map(proxy => proxy.trim()) :
    [];

let currentProxyIndex = 0;
let proxyServer = null;

const setupProxy = async () => {
    if (proxyList.length === 0) {
        logger.warn('No proxy servers configured');
        return;
    }

    try {
        // Initialize the proxy server
        proxyServer = new ProxyChain.Server({
            port: process.env.PROXY_PORT || 8000,
            prepareRequestFunction: () => {
                return {
                    requestAuthentication: false,
                    upstreamProxyUrl: getNextProxy()
                };
            }
        });

        await proxyServer.listen();
        logger.info('Proxy server started successfully');
    } catch (error) {
        logger.error('Failed to start proxy server:', error);
    }
};

const getNextProxy = () => {
    if (proxyList.length === 0) {
        return null;
    }

    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    const proxy = proxyList[currentProxyIndex];

    logger.info(`Rotating to proxy: ${proxy}`);
    return proxy;
};

const getProxy = async () => {
    if (!proxyServer) {
        return null;
    }

    try {
        // Get the current proxy URL
        const proxyUrl = `http://localhost:${proxyServer.port}`;
        
        // Create a new proxy URL with authentication if needed
        const newProxyUrl = await ProxyChain.anonymizeProxy(proxyUrl);
        
        logger.info('Generated new proxy URL');
        return newProxyUrl;
    } catch (error) {
        logger.error('Failed to get proxy:', error);
        return null;
    }
};

const addProxy = (proxyUrl) => {
    if (!proxyList.includes(proxyUrl)) {
        proxyList.push(proxyUrl);
        logger.info(`Added new proxy: ${proxyUrl}`);
    }
};

const removeProxy = (proxyUrl) => {
    const index = proxyList.indexOf(proxyUrl);
    if (index > -1) {
        proxyList.splice(index, 1);
        logger.info(`Removed proxy: ${proxyUrl}`);
    }
};

const closeProxy = async () => {
    if (proxyServer) {
        await proxyServer.close();
        logger.info('Proxy server closed');
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeProxy();
    process.exit();
});

module.exports = {
    setupProxy,
    getProxy,
    addProxy,
    removeProxy,
    closeProxy
}; 