const fs = require('fs');
const {parse} = require('csv-parse');
const path = require('path');


// async function uploadCsv(req, res) {
//     try {
//         return res.status(200).json({message: "File uploaded successfully"});
//     } catch (error) {
//         return res.status(400).json({error: error.message});
//     }
// };

const csvColumns = ['Date', 'Symbol', 'Series', 'Prev Close', 'Open', 'High', 'Low', 'Last', 'Close', 'VWAP',
    'Volume', 'Turnover', 'Trades', 'Deliverable', '%Deliverable'];

function normalizeKeys(row) {
    return Object.keys(row).reduce((acc, key) => {
        acc[key.trim()] = row[key]; // Trim whitespace from keys
        return acc;
    }, {});
}

function validateRow(row) {
    const isValidDate = !isNaN(Date.parse(row['Date']));
    const isNumeric = (val) => !isNaN(parseFloat(val)) && isFinite(val);

    return isValidDate && [
        'Prev Close', 'Open', 'High', 'Low', 'Last', 'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable', '%Deliverable'
    ].every(col => isNumeric(row[col]));
}

async function uploadStockData (req, res) {
    const file = req.file;
    if (!file || file.mimetype !== 'text/csv') {
        return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    fs.createReadStream(file.path)
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
            row = normalizeKeys(row);
            // Validate the required columns are present
            if (!csvColumns.every(col => Object.keys(row).includes(col))) {
                errors.push({ row, reason: 'Missing required columns' });
                failureCount++;
                return; // Skip this row
            }

            // Data validation
            const isValid = validateRow(row);
            if (isValid) {
                // results.push(formatRow(row));
                successCount++;
            } else {
                errors.push({ row, reason: 'Validation failed' });
                failureCount++;
            }
        })
        .on('end', async () => {
            // Further processing, like saving the data into the database
            // await Stock.insertMany(results); // if using a database

            // Send response only once at the end
            res.json({
                totalRecords: successCount + failureCount,
                successCount,
                failureCount,
                errors
            });
        })
        .on('error', (err) => {
            // Handle error and send a response
            return res.status(500).json({ message: 'Error processing file', error: err.message });
        });
};


module.exports = {
    uploadStockData
}