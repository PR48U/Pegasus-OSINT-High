const mongoose = require('mongoose');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/database.log' })
    ]
});

const setupDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pegasus-osint';
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        logger.info('Connected to MongoDB successfully');

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Create indexes for better performance
        await createIndexes();

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};

const createIndexes = async () => {
    try {
        // Create any necessary indexes here
        // Example:
        // await YourModel.createIndexes();
        
        logger.info('Database indexes created successfully');
    } catch (error) {
        logger.error('Failed to create database indexes:', error);
        throw error;
    }
};

const closeDatabase = async () => {
    try {
        await mongoose.connection.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database connection:', error);
        throw error;
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});

module.exports = {
    setupDatabase,
    closeDatabase
}; 