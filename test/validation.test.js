const { validateRow } = require('../controllers/csvDataController');

describe('validateRow', () => {
    it('should return true for valid rows', () => {
        const row = {
            'Date': '2024-01-01',
            'Prev Close': '100',
            'Open': '110',
            'High': '120',
            'Low': '105',
            'Last': '115',
            'Close': '110',
            'VWAP': '113',
            'Volume': '10000',
            'Turnover': '100000',
            'Trades': '150',
            'Deliverable': '8000',
            '%Deliverable': '80'
        };
        expect(validateRow(row)).toBe(true);
    });

    it('should return false for invalid rows', () => {
        const row = {
            'Date': 'invalid-date',
            'Prev Close': 'abc',
            'Open': '110',
            'High': '120',
            'Low': '105',
            'Last': '115',
            'Close': '110',
            'VWAP': '113',
            'Volume': '10000',
            'Turnover': '100000',
            'Trades': '150',
            'Deliverable': '8000',
            '%Deliverable': '80'
        };
        expect(validateRow(row)).toBe(false);
    });
});
