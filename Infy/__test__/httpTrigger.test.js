const { httpTrigger } = require('../src/functions/httpTrigger');
const httpMocks = require('node-mocks-http');
const axios = require('axios');

// Mock axios
jest.mock('axios');

// Mock `pg.Client` for both unit and integration tests
const mockQuery = jest.fn();
const mockClient = {
    connect: jest.fn(),
    query: mockQuery,
    end: jest.fn(),
};

// Dynamically decide whether to use the real or mocked `pg.Client`
jest.mock('pg', () => {
    const { Client: RealClient } = jest.requireActual('pg'); // Use the real module only inside the mock
    const isIntegrationTest = !!process.env.POSTGRES_CONNECTION_STRING && !!process.env.GITHUB_ACTIONS;

    return {
        Client: isIntegrationTest ? RealClient : jest.fn(() => mockClient),
    };
});

describe('httpTrigger Function', () => {
    beforeAll(() => {
        process.env.AZURE_FUNCTIONS_ENV = 'false'; // Ensure test mode
        process.env.FINNHUB_API_KEY = 'mock_api_key'; // Mock API key for testing
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    it('should write company profile data to the database and return the data', async () => {
        // Mock API response
        axios.get.mockResolvedValueOnce({
            data: {
                country: 'India',
                currency: 'INR',
                estimateCurrency: null,
                exchange: 'NSE',
                finnhubIndustry: 'Technology',
                ipo: '1993-06-01',
                logo: 'https://example.com/logo.png',
                marketCapitalization: 5000000,
                name: 'Infosys',
                phone: '1234567890',
                shareOutstanding: 10000,
                ticker: 'INFY',
                weburl: 'https://infosys.com',
            },
        });

        if (!process.env.POSTGRES_CONNECTION_STRING) {
            // Mock database query for unit testing
            mockQuery.mockImplementation((query) => {
                if (query.includes('CREATE TABLE')) {
                    return Promise.resolve(); // Simulate successful table creation
                }
                if (query.includes('INSERT INTO company_profile')) {
                    return Promise.resolve({ rows: [{ id: 1 }] }); // Simulate successful insertion
                }
                return Promise.reject(new Error('Unexpected query'));
            });
        }

        const req = httpMocks.createRequest({
            method: 'GET',
            query: { symbol: 'INFY' },
        });

        const context = { log: jest.fn() };

        const res = await httpTrigger(req, context);

        // Assertions
        expect(res.status).toBe(200);
        expect(res.headers['Content-Type']).toBe('application/json');

        const body = JSON.parse(res.body);
        expect(body.name).toBe('Infosys');
        expect(body.ticker).toBe('INFY');

        if (!process.env.POSTGRES_CONNECTION_STRING) {
            expect(mockClient.connect).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalled();
            expect(mockClient.end).toHaveBeenCalled();
        }
    });

    it('should handle database errors gracefully', async () => {
        if (!process.env.POSTGRES_CONNECTION_STRING) {
            // Mock API response
            axios.get.mockResolvedValueOnce({
                data: {
                    name: 'Infosys',
                    ticker: 'INFY',
                    ipo: '1993-06-01',
                    country: 'India',
                    currency: 'INR',
                },
            });

            // Simulate a database error
            mockQuery.mockRejectedValueOnce(new Error('DB Error'));
        }

        const req = httpMocks.createRequest({
            method: 'GET',
            query: { symbol: 'INFY' },
        });

        const context = { log: jest.fn() };

        const res = await httpTrigger(req, context);

        expect(res.status).toBe(500);
        expect(res.headers['Content-Type']).toBe('application/json');

        const body = JSON.parse(res.body);
        expect(body.error).toBe('Failed to fetch data or connect to DB');
        expect(body.details).toBe('DB Error');
    });
});
