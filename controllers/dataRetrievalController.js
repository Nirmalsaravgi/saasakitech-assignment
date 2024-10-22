const StockData = require('../models/stockDataModel');

// Helper function to parse dates from query
function parseDate(dateStr) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
}

// API 1: Get the record with the highest volume
async function getHighestVolume(req, res) {
    const { start_date, end_date, symbol } = req.query;

    // Check if start_date or end_date is missing and return specific error messages
    if (!start_date && !end_date) {
        return res.status(400).json({ message: 'Both start_date and end_date are required' });
    } else if (!start_date) {
        return res.status(400).json({ message: 'start_date is required' });
    } else if (!end_date) {
        return res.status(400).json({ message: 'end_date is required' });
    }

    const query = {
        date: {
            $gte: parseDate(start_date),
            $lte: parseDate(end_date)
        }
    };

    // If symbol is provided, add it to the query
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
        };
        res.json({ highest_volume: highestVolume });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving data', error: error.message });
    }
}


// API 2: Get average closing price for a symbol
async function getAverageClose(req, res) {
    const { start_date, end_date, symbol } = req.query;

    // Check if all required parameters are present
    if (!symbol && !start_date && !end_date) {
        return res.status(400).json({ message: 'Symbol, start_date, and end_date are required' });
    } else if (!symbol) {
        return res.status(400).json({ message: 'Symbol is required' });
    } else if (!start_date) {
        return res.status(400).json({ message: 'start_date is required' });
    } else if (!end_date) {
        return res.status(400).json({ message: 'end_date is required' });
    }

    const query = {
        symbol: symbol,
        date: {
            $gte: parseDate(start_date),
            $lte: parseDate(end_date)
        }
    };

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

    // Check if start_date and end_date are provided
    if (!start_date && !end_date) {
        return res.status(400).json({ message: 'Both start_date and end_date are required' });
    } else if (!start_date) {
        return res.status(400).json({ message: 'start_date is required' });
    } else if (!end_date) {
        return res.status(400).json({ message: 'end_date is required' });
    }

    const query = {
        date: {
            $gte: parseDate(start_date),
            $lte: parseDate(end_date)
        }
    };

    // If symbol is provided, add it to the query
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
