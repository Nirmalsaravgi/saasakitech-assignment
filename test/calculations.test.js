const { getHighestVolume } = require('../controllers/dataRetrievalController');
const StockData = require('../models/stockDataModel');

// Mock the StockData.find function
jest.mock('../models/stockDataModel');

describe('getHighestVolume', () => {
    it('should return the record with the highest volume', async () => {
        const req = {
            query: { start_date: '2024-01-01', end_date: '2024-12-31', symbol: 'ULTRACEMCO' }
        };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        
        // Mock the implementation of StockData.find to return an object that supports chaining
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
});
