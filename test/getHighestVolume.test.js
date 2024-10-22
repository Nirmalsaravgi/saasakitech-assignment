const { getHighestVolume } = require('../controllers/dataRetrievalController');
const StockData = require('../models/stockDataModel');

// Mock the StockData.find function
jest.mock('../models/stockDataModel');

describe('getHighestVolume', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: { start_date: '2024-01-01', end_date: '2024-12-31', symbol: 'ULTRACEMCO' }
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    it('should return the record with the highest volume when valid data is provided', async () => {
        StockData.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue(Promise.resolve([{
                    date: '2024-01-01',
                    symbol: 'ULTRACEMCO',
                    volume: 100000
                }])),
            }),
        });

        await getHighestVolume(req, res);

        expect(res.json).toHaveBeenCalledWith({
            highest_volume: {
                date: '2024-01-01',
                symbol: 'ULTRACEMCO',
                volume: 100000
            }
        });
    });

    it('should return 400 if start_date is missing', async () => {
        req.query.start_date = undefined;

        await getHighestVolume(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'start_date is required' });
    });

    it('should return 400 if end_date is missing', async () => {
        req.query.end_date = undefined;

        await getHighestVolume(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'end_date is required' });
    });

    it('should return 404 if no records are found', async () => {
        StockData.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue(Promise.resolve([])),
            }),
        });

        await getHighestVolume(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No records found' });
    });

    it('should return 500 if there is a server error', async () => {
        StockData.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockRejectedValue(new Error('Database error')),
            }),
        });

        await getHighestVolume(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error retrieving data',
            error: 'Database error'
        });
    });
});
