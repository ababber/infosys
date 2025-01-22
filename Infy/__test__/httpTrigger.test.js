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

  it('should write company profile, insider transactions, and recommendation trends to the DB and return them', async () => {
    // Mock 3 calls in correct order (profile -> insider -> recommendation)
    axios.get
      .mockResolvedValueOnce({
        data: {
          // profile object
          country: 'India',
          currency: 'INR',
          estimateCurrency: null,
          exchange: 'NSE',
          finnhubIndustry: 'Technology',
          ipo: '1993-06-01',
          name: 'Infosys',
          ticker: 'INFY',
        },
      })
      .mockResolvedValueOnce({
        data: {
          // insider is nested: data:{ data:[ ... ] }
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
      })
      .mockResolvedValueOnce({
        // recommendation => array in data
        data: [
          {
            symbol: 'INFY',
            buy: 2,
            hold: 3,
            period: '2023-01-01',
            sell: 1,
            strongBuy: 0,
            strongSell: 0,
          },
        ],
      });

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      mockQuery.mockImplementation((query, values) => {
        if (query.includes('CREATE TABLE')) {
          return Promise.resolve();
        }
        if (query.includes('INSERT INTO company_profile')) {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        if (query.includes('INSERT INTO insider_transactions')) {
          return Promise.resolve({ rows: [{ id: 2 }] });
        }
        if (query.includes('INSERT INTO recommend_data')) {
          return Promise.resolve({ rows: [{ id: 3 }] });
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

    // Expect 200 success
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);

    expect(body).toHaveProperty('companyProfile');
    expect(body).toHaveProperty('insiderTransactions');
    expect(body).toHaveProperty('recommendationTrends');

    expect(body.insiderTransactions.data).toHaveLength(2);
    expect(body.recommendationTrends).toHaveLength(1);

    // If mocked DB, confirm queries
    if (!process.env.POSTGRES_CONNECTION_STRING) {
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS company_profile')
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS insider_transactions')
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS recommend_data')
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO company_profile'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO insider_transactions'),
        expect.any(Array)
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recommend_data'),
        expect.any(Array)
      );
      expect(mockClient.end).toHaveBeenCalled();
    }
  });

  it('should handle empty company profile, insider transactions, and recommendation trends data gracefully', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          // empty profile => no ipo => won't insert
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [], // insider empty
        },
      })
      .mockResolvedValueOnce({
        data: [], // recommendation empty
      });

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      mockQuery.mockImplementation((query) => {
        if (query.includes('CREATE TABLE')) return Promise.resolve();
        // Possibly no actual insert calls if there's no data
        return Promise.resolve({ rows: [{ id: 1 }] });
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
    expect(body.insiderTransactions.data).toHaveLength(0);
    expect(body).toHaveProperty('recommendationTrends');
    expect(body.recommendationTrends).toHaveLength(0);
  });

  it('should handle API errors gracefully (recommendation trends)', async () => {
    // profile OK, insider OK, 3rd fails
    axios.get
      .mockResolvedValueOnce({ data: { name: 'Some Profile' } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockRejectedValueOnce(new Error('API Error: recommendation'));

    const req = httpMocks.createRequest({
      query: { symbol: 'INFY' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/recommendation');
  });

  it('should handle database errors gracefully', async () => {
    axios.get
      // All 3 calls succeed so we reach DB
      .mockResolvedValueOnce({ data: { ipo: '1993-06-01' } }) // profile w/ ipo => triggers insert
      .mockResolvedValueOnce({ data: { data: [] } }) // insider empty
      .mockResolvedValueOnce({ data: [] }); // recommendation empty

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      // cause the first insert to fail
      mockQuery.mockImplementationOnce(() => Promise.resolve()) // create profile table
        .mockImplementationOnce(() => Promise.resolve()) // create insider table
        .mockImplementationOnce(() => Promise.resolve()) // create recommend table
        .mockImplementationOnce(() => Promise.reject(new Error('DB Error'))); // insert company
    }

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { symbol: 'INFY' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toBe('DB Error');
  });

  it('should handle API errors gracefully (insider transactions)', async () => {
    // 1) profile => success
    axios.get
      .mockResolvedValueOnce({
        data: { country: 'India' },
      })
      // 2) insider => fails
      .mockRejectedValueOnce(new Error('API Error: insider'))
      // 3) recommendation => dummy success
      .mockResolvedValueOnce({
        data: [],
      });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { symbol: 'INFY' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);

    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    // The function's error message for insider calls:
    expect(body.details).toContain('Failed to fetch stock/insider-transactions');
  });

  it('should handle API errors gracefully (company profile)', async () => {
    // 1) profile => fails
    axios.get
      .mockRejectedValueOnce(new Error('API Error: profile'))
      // 2) insider => never reached, but we must define it
      .mockResolvedValueOnce({ data: { data: [] } })
      // 3) recommendation => never reached, but must define
      .mockResolvedValueOnce({ data: [] });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { symbol: 'ERROR' },
    });
    const context = { log: jest.fn() };

    const res = await httpTrigger(req, context);

    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    // Failing on the first call: "stock/profile2"
    expect(body.details).toContain('Failed to fetch stock/insider-transactions: API Error: profile');
  });
});
