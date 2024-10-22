const { getAverageVWAP } = require('../controllers/dataRetrievalController');
const StockData = require('../models/stockDataModel');

// Mock the StockData.aggregate function
jest.mock('../models/stockDataModel');

describe('getAverageVWAP', () => {
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

    it('should return the average VWAP when valid data is provided', async () => {
        StockData.aggregate.mockReturnValue(Promise.resolve([{ average_vwap: 115.3 }]));

        await getAverageVWAP(req, res);

        expect(res.json).toHaveBeenCalledWith({ average_vwap: 115.3 });
    });

    it('should return 400 if start_date is missing', async () => {
        req.query.start_date = undefined;

        await getAverageVWAP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'start_date is required' });
    });

    it('should return 400 if end_date is missing', async () => {
        req.query.end_date = undefined;

        await getAverageVWAP(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'end_date is required' });
    });

    it('should return 404 if no records are found', async () => {
        StockData.aggregate.mockReturnValue(Promise.resolve([]));

        await getAverageVWAP(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No records found' });
    });

    it('should return 500 if there is a server error', async () => {
        StockData.aggregate.mockRejectedValue(new Error('Database error'));

        await getAverageVWAP(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error calculating average VWAP',
            error: 'Database error'
        });
    });
});
