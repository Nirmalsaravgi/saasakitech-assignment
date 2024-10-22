const { validateRow } = require('../utils/utils');

describe('validateRow', () => {
    
    it('should return true for a valid row', () => {
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
        const validation = validateRow(row);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toEqual([]);
    });

    it('should return false for a missing Date column', () => {
        const row = {
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
        const validation = validateRow(row);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toEqual([
            { column: 'Date', value: undefined, reason: 'Date is missing or null' }
        ]);
    });

    it('should return false for an invalid date format', () => {
        const row = {
            'Date': 'invalid-date',
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
        const validation = validateRow(row);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toEqual([
            { column: 'Date', value: 'invalid-date', reason: 'Invalid date format' }
        ]);
    });

    it('should return false for missing required numeric columns', () => {
        const row = {
            'Date': '2024-01-01',
            'Prev Close': '',
            'Open': '110',
            'High': '',
            'Low': '105',
            'Last': '115',
            'Close': '110',
            'VWAP': '113',
            'Volume': '10000',
            'Turnover': '100000',
            'Trades': '',
            'Deliverable': '',
            '%Deliverable': '80'
        };
        const validation = validateRow(row);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toEqual([
            { column: 'Prev Close', value: '', reason: 'Value is missing or null' },
            { column: 'High', value: '', reason: 'Value is missing or null' },
            { column: 'Trades', value: '', reason: 'Value is missing or null' },
            { column: 'Deliverable', value: '', reason: 'Value is missing or null' }
        ]);
    });

    it('should return false for non-numeric values in numeric columns', () => {
        const row = {
            'Date': '2024-01-01',
            'Prev Close': 'abc',
            'Open': 'xyz',
            'High': '120',
            'Low': '105',
            'Last': '115',
            'Close': '110',
            'VWAP': '113',
            'Volume': '10000',
            'Turnover': '100000',
            'Trades': 'not_a_number',
            'Deliverable': '8000',
            '%Deliverable': 'not_numeric'
        };
        const validation = validateRow(row);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toEqual([
            { column: 'Prev Close', value: 'abc', reason: 'Non-numeric value' },
            { column: 'Open', value: 'xyz', reason: 'Non-numeric value' },
            { column: 'Trades', value: 'not_a_number', reason: 'Non-numeric value' },
            { column: '%Deliverable', value: 'not_numeric', reason: 'Non-numeric value' }
        ]);
    });

    it('should return false if any numeric column has null or undefined values', () => {
        const row = {
            'Date': '2024-01-01',
            'Prev Close': null,
            'Open': '110',
            'High': undefined,
            'Low': '105',
            'Last': '115',
            'Close': '110',
            'VWAP': '113',
            'Volume': null,
            'Turnover': '100000',
            'Trades': '150',
            'Deliverable': undefined,
            '%Deliverable': '80'
        };
        const validation = validateRow(row);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toEqual([
            { column: 'Prev Close', value: null, reason: 'Value is missing or null' },
            { column: 'High', value: undefined, reason: 'Value is missing or null' },
            { column: 'Volume', value: null, reason: 'Value is missing or null' },
            { column: 'Deliverable', value: undefined, reason: 'Value is missing or null' }
        ]);
    });

    it('should return true when all numeric columns contain valid numeric values', () => {
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
        const validation = validateRow(row);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toEqual([]);
    });

});
