/**
 * Calculate accuracy score based on timestamp
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {number} Score from 0-100
 */
const scoreAccuracy = (timestamp) => {
    const now = Date.now();
    const ageInHours = (now - timestamp) / (1000 * 60 * 60);

    // Scoring rules:
    // < 1 hour: 90-100
    // < 6 hours: 80-89
    // < 24 hours: 70-79
    // < 48 hours: 60-69
    // < 1 week: 50-59
    // < 1 month: 30-49
    // > 1 month: 0-29

    if (ageInHours < 1) {
        return 90 + Math.floor((1 - ageInHours) * 10);
    } else if (ageInHours < 6) {
        return 80 + Math.floor((6 - ageInHours) * 1.8);
    } else if (ageInHours < 24) {
        return 70 + Math.floor((24 - ageInHours) * 0.375);
    } else if (ageInHours < 48) {
        return 60 + Math.floor((48 - ageInHours) * 0.375);
    } else if (ageInHours < 168) { // 1 week
        return 50 + Math.floor((168 - ageInHours) * 0.0595);
    } else if (ageInHours < 720) { // 1 month
        return 30 + Math.floor((720 - ageInHours) * 0.0276);
    } else {
        return Math.max(0, Math.floor(30 - (ageInHours - 720) * 0.01));
    }
};

/**
 * Get confidence level description based on score
 * @param {number} score - Accuracy score (0-100)
 * @returns {string} Confidence level description
 */
const getConfidenceLevel = (score) => {
    if (score >= 90) {
        return 'Sangat Tinggi';
    } else if (score >= 80) {
        return 'Tinggi';
    } else if (score >= 70) {
        return 'Cukup Tinggi';
    } else if (score >= 60) {
        return 'Sedang';
    } else if (score >= 50) {
        return 'Cukup';
    } else if (score >= 30) {
        return 'Rendah';
    } else {
        return 'Sangat Rendah';
    }
};

/**
 * Get color code for score visualization
 * @param {number} score - Accuracy score (0-100)
 * @returns {string} Color code in hex format
 */
const getScoreColor = (score) => {
    if (score >= 90) {
        return '#00FF00'; // Green
    } else if (score >= 80) {
        return '#66FF00'; // Light Green
    } else if (score >= 70) {
        return '#CCFF00'; // Yellow-Green
    } else if (score >= 60) {
        return '#FFFF00'; // Yellow
    } else if (score >= 50) {
        return '#FFCC00'; // Orange-Yellow
    } else if (score >= 30) {
        return '#FF6600'; // Orange
    } else {
        return '#FF0000'; // Red
    }
};

module.exports = {
    scoreAccuracy,
    getConfidenceLevel,
    getScoreColor
}; 