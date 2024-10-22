const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');
const { normalizeKeys, validateRow, saveStockData } = require('../utils/utils');

const csvColumns = ['Date', 'Symbol', 'Series', 'Prev Close', 'Open', 'High', 'Low', 'Last', 'Close', 'VWAP', 'Volume', 'Turnover', 'Trades', 'Deliverable', '%Deliverable'];

async function uploadStockData(req, res) {
    const file = req.file;
    if (!file || file.mimetype !== 'text/csv') {
        return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    const savePromises = [];

    fs.createReadStream(file.path)
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
            row = normalizeKeys(row);

            // Validate the required columns are present
            const missingColumns = csvColumns.filter(col => !Object.keys(row).includes(col));

            if (missingColumns.length > 0) {
                errors.push({ 
                    row, 
                    reason: 'Missing required columns', 
                    missingColumns // Include the missing columns in the error object
                });
                failureCount++;
                return;
            }

            // Data validation
            const validation = validateRow(row);
            if (validation.isValid) {
                const savePromise = saveStockData(row)
                    .then(result => {
                        if (result.success) {
                            successCount++;
                        } else {
                            errors.push({reason: 'Database save failed', error: result.error });
                            failureCount++;
                        }
                    });

                savePromises.push(savePromise);
            } else {
                errors.push({reason: 'Validation failed', details: validation.errors });
                failureCount++;
            }
        })
        .on('end', async () => {
            await Promise.all(savePromises);

            // Send response once all data has been processed
            res.json({
                totalRecords: successCount + failureCount,
                successCount,
                failureCount,
                errors
            });
        })
        .on('error', (err) => {
            return res.status(500).json({ message: 'Error processing file', error: err.message });
        });
}

module.exports = {
    uploadStockData
};
