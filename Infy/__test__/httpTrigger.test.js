const { httpTrigger } = require('../src/functions/httpTrigger');
const httpMocks = require('node-mocks-http');
const axios = require('axios');

// Mock axios
jest.mock('axios');

// Mock `pg.Client`
const mockQuery = jest.fn();
const mockClient = {
  connect: jest.fn(),
  query: mockQuery,
  end: jest.fn(),
};

// Dynamically decide whether to use the real or mocked `pg.Client`
jest.mock('pg', () => {
  const { Client: RealClient } = jest.requireActual('pg');
  const isIntegrationTest =
    !!process.env.POSTGRES_CONNECTION_STRING && !!process.env.GITHUB_ACTIONS;

  return {
    Client: isIntegrationTest ? RealClient : jest.fn(() => mockClient),
  };
});

describe('httpTrigger Function', () => {
  beforeAll(() => {
    // Force test mode
    process.env.AZURE_FUNCTIONS_ENV = 'false';
    process.env.FINNHUB_API_KEY = 'mock_api_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write both company profile and insider transactions to the DB and return them', async () => {
    // Mock the first call: company profile
    axios.get
      .mockResolvedValueOnce({
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
      })
      // Mock the second call: insider transactions
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              change: 100,
              currency: 'INR',
              filingDate: '2023-01-10',
              name: 'John Doe',
              share: 200,
              symbol: 'INFY',
              transactionDate: '2023-01-09',
              transactionPrice: 15.25,
            },
            {
              change: -50,
              currency: 'INR',
              filingDate: '2023-01-15',
              name: 'Jane Doe',
              share: 150,
              symbol: 'INFY',
              transactionDate: '2023-01-14',
              transactionPrice: 16.0,
            },
          ],
        },
      });

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      // If we're in “unit test” mode (no real DB):
      mockQuery.mockImplementation((query, values) => {
        // Check which query is being run
        if (query.includes('CREATE TABLE')) {
          // Possibly check for which table name
          return Promise.resolve();
        }
        if (query.includes('INSERT INTO company_profile')) {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        if (query.includes('INSERT INTO insider_transactions')) {
          return Promise.resolve({ rows: [{ id: 2 }] });
        }

        return Promise.reject(new Error('Unexpected query or params'));
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

    // Confirm the combined data
    expect(body).toHaveProperty('symbol', 'INFY');
    expect(body).toHaveProperty('companyProfile');
    expect(body.companyProfile).toHaveProperty('name', 'Infosys');

    expect(body).toHaveProperty('insiderTransactions');
    // insiderTransactions is the full object with a "data" array:
    expect(body.insiderTransactions).toHaveProperty('data');
    expect(body.insiderTransactions.data.length).toBe(2);

    // If using the mock client, confirm queries were made
    if (!process.env.POSTGRES_CONNECTION_STRING) {
      expect(mockClient.connect).toHaveBeenCalled();
      // For coverage, check that the right queries were run
      // (though to be more or less strict based on needs)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS company_profile'),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS insider_transactions'),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO company_profile'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO insider_transactions'),
        expect.any(Array)
      );
      expect(mockClient.end).toHaveBeenCalled();
    }
  });

  it('should handle empty insider-transactions data gracefully', async () => {
    // Mock the first call: company profile
    axios.get
      .mockResolvedValueOnce({
        data: {
          country: 'India',
          // etc...
          // minimal data to pass the code path
        },
      })
      // Mock the second call with no insider transactions
      .mockResolvedValueOnce({
        data: {
          data: [],
        },
      });

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      mockQuery.mockImplementation((query) => {
        if (query.includes('CREATE TABLE')) {
          return Promise.resolve();
        }
        if (query.includes('INSERT INTO company_profile')) {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        if (query.includes('INSERT INTO insider_transactions')) {
          // If never call .insertQueryAndValues because `data` is empty,
          // this might never be invoked or might be invoked differently.
          // Just in case, handle it:
          return Promise.resolve({ rows: [{ id: 2 }] });
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

    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);

    expect(body).toHaveProperty('companyProfile');
    expect(body).toHaveProperty('insiderTransactions');
    // Confirm 'data' is an empty array
    expect(body.insiderTransactions.data).toHaveLength(0);
  });

  it('should handle API errors gracefully (company profile)', async () => {
    // Make the first API call fail
    axios.get.mockRejectedValueOnce(new Error('API Error: profile'));
    // The second call won't matter because the first fails

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { symbol: 'INFY' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);

    // Assertions
    expect(res.status).toBe(500);
    expect(res.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    // The reason should indicate the profile endpoint
    expect(body.details).toContain('Failed to fetch stock/profile2');
  });

  it('should handle API errors gracefully (insider transactions)', async () => {
    // First call (profile) succeeds, second fails
    axios.get
      .mockResolvedValueOnce({
        data: {
          country: 'India',
          // ... minimal data
        },
      })
      .mockRejectedValueOnce(new Error('API Error: insider'));

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { symbol: 'INFY' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);

    // Assertions
    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/insider-transactions');
  });
});
