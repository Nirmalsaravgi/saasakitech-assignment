const StockData = require('../models/stockDataModel');

// Normalize keys by trimming whitespace
function normalizeKeys(row) {
    return Object.keys(row).reduce((acc, key) => {
        acc[key.trim()] = row[key];
        return acc;
    }, {});
}

// Validate a row from the CSV
function validateRow(row) {
    const errors = [];

    const isNullOrMissing = (val) => val === null || val === undefined || val === '';

    const isValidDate = !isNaN(Date.parse(row['Date']));
    if (isNullOrMissing(row['Date'])) {
        errors.push({ column: 'Date', value: row['Date'], reason: 'Date is missing or null' });
    } else if (!isValidDate) {
        errors.push({ column: 'Date', value: row['Date'], reason: 'Invalid date format' });
    }

    const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);

    // Validate each numeric column
    ['Prev Close', 'Open', 'High', 'Low', 'Last', 'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable', '%Deliverable'].forEach(col => {
        if (isNullOrMissing(row[col])) {
            errors.push({ column: col, value: row[col], reason: `Value is missing or null` });
        } else if (!isNumeric(row[col])) {
            errors.push({ column: col, value: row[col], reason: 'Non-numeric value' });
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Save a row to the MongoDB database
async function saveStockData(row) {
    try {
        const stockData = new StockData({
            date: new Date(row['Date']),
            symbol: row['Symbol'],
            series: row['Series'],
            prev_close: parseFloat(row['Prev Close']),
            open: parseFloat(row['Open']),
            high: parseFloat(row['High']),
            low: parseFloat(row['Low']),
            last: parseFloat(row['Last']),
            close: parseFloat(row['Close']),
            vwap: parseFloat(row['VWAP']),
            volume: parseInt(row['Volume'], 10),
            turnover: parseFloat(row['Turnover']),
            trades: parseInt(row['Trades'], 10),
            deliverable: parseInt(row['Deliverable'], 10),
            percent_deliverable: parseFloat(row['%Deliverable'])
        });

        await stockData.save();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    normalizeKeys,
    validateRow,
    saveStockData
};
