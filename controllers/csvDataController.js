const fs = require('fs');
const {parse} = require('csv-parse');
const StockData = require('../models/stockDataModel');
const path = require('path');


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

async function uploadStockData(req, res) {
    const file = req.file;
    if (!file || file.mimetype !== 'text/csv') {
        return res.status(400).json({ message: 'Please upload a CSV file.' });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    const savePromises = []; // Collect all the save promises here

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

                // Save to MongoDB and push the promise to savePromises
                const savePromise = stockData.save().then(() => {
                    successCount++;
                }).catch((err) => {
                    errors.push({ row, reason: 'Database save failed', error: err.message });
                    failureCount++;
                });

                savePromises.push(savePromise);
            } else {
                errors.push({ row, reason: 'Validation failed' });
                failureCount++;
            }
        })
        .on('end', async () => {
            // Wait for all save operations to complete
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
            // Handle error and send a response
            return res.status(500).json({ message: 'Error processing file', error: err.message });
        });
};



module.exports = {
    uploadStockData
}


// async function uploadStockData (req, res) {
//     const file = req.file;
//     if (!file || file.mimetype !== 'text/csv') {
//         return res.status(400).json({ message: 'Please upload a CSV file.' });
//     }

//     const results = [];
//     let successCount = 0;
//     let failureCount = 0;
//     const errors = [];

//     fs.createReadStream(file.path)
//         .pipe(parse({ columns: true }))
//         .on('data', (row) => {
//             // console.log("Processing row: ", row);
//             row = normalizeKeys(row);
//             // Validate the required columns are present
//             if (!csvColumns.every(col => Object.keys(row).includes(col))) {
//                 errors.push({ row, reason: 'Missing required columns' });
//                 failureCount++;
//                 return; // Skip this row
//             }

//             // Data validation
//             const isValid = validateRow(row);
//             if (isValid) {
//                 const stockData = new StockData({
//                     date: new Date(row['Date']),
//                     symbol: row['Symbol'],
//                     series: row['Series'],
//                     prev_close: parseFloat(row['Prev Close']),
//                     open: parseFloat(row['Open']),
//                     high: parseFloat(row['High']),
//                     low: parseFloat(row['Low']),
//                     last: parseFloat(row['Last']),
//                     close: parseFloat(row['Close']),
//                     vwap: parseFloat(row['VWAP']),
//                     volume: parseInt(row['Volume'], 10),
//                     turnover: parseFloat(row['Turnover']),
//                     trades: parseInt(row['Trades'], 10),
//                     deliverable: parseInt(row['Deliverable'], 10),
//                     percent_deliverable: parseFloat(row['%Deliverable'])
//                 });
//                 // Save to MongoDB
//                 const savePromise = stockData.save().then(() => {
//                     successCount++;
//                 }).catch((err) => {
//                     errors.push({ row, reason: 'Database save failed', error: err.message });
//                     failureCount++;
//                 });

//                 savePromises.push(savePromise);
//             } else {
//                 console.log('Row is invalid:', row);
//                 errors.push({ row, reason: 'Validation failed' });
//                 failureCount++;
//             }
//         })
//         .on('end', async () => {
//             // console.log("it is working");
//             // console.log(successCount);

//             // Further processing, like saving the data into the database
//             // await Stock.insertMany(results); // if using a database

//             await Promise.all(savePromises);

//             // Send response only once at the end
//             res.json({
//                 totalRecords: successCount + failureCount,
//                 successCount,
//                 failureCount,
//                 errors
//             });
//         })
//         .on('error', (err) => {
//             // Handle error and send a response
//             return res.status(500).json({ message: 'Error processing file', error: err.message });
//         });
// };