const StockData = require('../models/stockDataModel');

// Helper function to parse dates from query
function parseDate(dateStr) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

// API 1: Get the record with the highest volume
async function getHighestVolume(req, res) {
    const { start_date, end_date, symbol } = req.query;

    const query = {};
    if (start_date || end_date) {
        query.date = {};
        if (start_date) query.date.$gte = parseDate(start_date);
        if (end_date) query.date.$lte = parseDate(end_date);
    }
    if (symbol) {
        query.symbol = symbol;
    }

    try {
        const result = await StockData.find(query).sort({ volume: -1 }).limit(1);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }
        const highestVolume = {
            date: result[0].date,
            symbol: result[0].symbol,
            volume: result[0].volume
        }
        res.json({ highest_volume:highestVolume });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
}

// API 2: Get average closing price for a symbol
async function getAverageClose(req, res) {
    const { start_date, end_date, symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ message: 'Symbol is required' });
    }

    const query = { symbol: symbol };
    if (start_date || end_date) {
        query.date = {};
        if (start_date) query.date.$gte = parseDate(start_date);
        if (end_date) query.date.$lte = parseDate(end_date);
    }

    try {
        const result = await StockData.aggregate([
            { $match: query },
            { $group: { _id: null, average_close: { $avg: "$close" } } }
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }

        res.json({ average_close: result[0].average_close });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating average close', error: error.message });
    }
}

// API 3: Get average VWAP for a symbol or date range
async function getAverageVWAP(req, res) {
    const { start_date, end_date, symbol } = req.query;

    const query = {};
    if (start_date || end_date) {
        query.date = {};
        if (start_date) query.date.$gte = parseDate(start_date);
        if (end_date) query.date.$lte = parseDate(end_date);
    }
    if (symbol) {
        query.symbol = symbol;
    }

    try {
        const result = await StockData.aggregate([
            { $match: query },
            { $group: { _id: null, average_vwap: { $avg: "$vwap" } } }
        ]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }

        res.json({ average_vwap: result[0].average_vwap });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating average VWAP', error: error.message });
    }
}

module.exports = {
    getHighestVolume,
    getAverageClose,
    getAverageVWAP
};
