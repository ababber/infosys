const { httpTrigger } = require('../src/functions/httpTrigger');
const httpMocks = require('node-mocks-http');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('httpTrigger Function', () => {
    beforeAll(() => {
        // Ensure test mode
        process.env.AZURE_FUNCTIONS_ENV = 'false';
        process.env.FINNHUB_API_KEY = 'mock_api_key'; // Mock API key for testing
    });

    // Clear mocks after each test
    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should return combined data for the default symbol (INFY)', async () => {
        // Mock responses for axios
        axios.get.mockImplementation((url, { params }) => {
            if (url.includes('stock/profile2')) {
                return Promise.resolve({ data: { name: 'Infosys', ticker: 'INFY' } });
            }
            if (url.includes('stock/metric')) {
                return Promise.resolve({ data: { metric: 'mock metrics data' } });
            }
            if (url.includes('stock/insider-transactions')) {
                return Promise.resolve({ data: [{ transaction: 'mock transaction data' }] });
            }
            if (url.includes('stock/recommendation')) {
                return Promise.resolve({ data: [{ recommendation: 'mock recommendation data' }] });
            }
            if (url.includes('stock/earnings')) {
                return Promise.resolve({ data: [{ earnings: 'mock earnings data' }] });
            }
            return Promise.reject(new Error('Unknown endpoint'));
        });

        // No symbol provided, defaults to 'INFY'
        const req = httpMocks.createRequest({
            method: 'GET',
            query: {}, 
        });

        const context = { log: jest.fn() };

        const res = await httpTrigger(req, context);

        expect(res.status).toBe(200);
        expect(res.headers['Content-Type']).toBe('application/json');
        const body = JSON.parse(res.body);
        expect(body.symbol).toBe('INFY');
        expect(body.companyProfile.name).toBe('Infosys');
        expect(body.basicFinancials.metric).toBe('mock metrics data');
    });

    it('should return combined data for a provided symbol', async () => {
        axios.get.mockResolvedValueOnce({ data: { name: 'Microsoft', ticker: 'MSFT' } });
        axios.get.mockResolvedValueOnce({ data: { metric: 'mock metrics data' } });
        axios.get.mockResolvedValueOnce({ data: [{ transaction: 'mock transaction data' }] });
        axios.get.mockResolvedValueOnce({ data: [{ recommendation: 'mock recommendation data' }] });
        axios.get.mockResolvedValueOnce({ data: [{ earnings: 'mock earnings data' }] });

        const req = httpMocks.createRequest({
            method: 'GET',
            query: { symbol: 'MSFT' },
        });

        const context = { log: jest.fn() };

        const res = await httpTrigger(req, context);

        expect(res.status).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.symbol).toBe('MSFT');
        expect(body.companyProfile.name).toBe('Microsoft');
    });

    it('should handle API errors gracefully', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        const req = httpMocks.createRequest({
            method: 'GET',
            query: { symbol: 'ERROR' },
        });

        const context = { log: jest.fn() };

        const res = await httpTrigger(req, context);

        expect(res.status).toBe(500);
        expect(res.headers['Content-Type']).toBe('application/json');
        const body = JSON.parse(res.body);

        expect(body.error).toBe('Failed to fetch data from Finnhub API');
        expect(body.details).toBe('Failed to fetch stock/profile2: API Error');
    });
});
