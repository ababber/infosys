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
  
  afterAll(() => {
    jest.restoreAllMocks(); 
    process.env.AZURE_FUNCTIONS_ENV = 'true';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to set up mock implementations for successful DB operations.
  const setupMockDBSuccess = () => {
    if (!process.env.POSTGRES_CONNECTION_STRING) {
      mockQuery.mockImplementation((query) => {
        if (query.includes('CREATE TABLE')) return Promise.resolve();
        if (query.includes('INSERT INTO company_profile')) {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        if (query.includes('INSERT INTO recommend_data')) {
          return Promise.resolve({ rows: [{ id: 3 }] });
        }
        if (query.includes('INSERT INTO insider_transactions')) {
          return Promise.resolve({ rows: [{ id: 2 }] });
        }
        if (query.includes('INSERT INTO earn_surprise')) {
          return Promise.resolve({ rows: [{ id: 4 }] });
        }
        return Promise.reject(new Error('Unexpected query'));
      });
    }
  };

  // Helper function to create a mock request and context.
  const createMockRequest = (symbol = 'INFY') => {
    return httpMocks.createRequest({
      method: 'GET',
      query: { symbol },
    });
  };

  const createMockContext = () => {
    return { log: jest.fn() };
  };

  // Mock axios.get based on the URL.
  const mockAxiosGet = (responses) => {
    axios.get.mockImplementation((url) => {
      if (url.includes('stock/profile2')) {
        if (responses.profile.error) {
          return Promise.reject(responses.profile.error);
        } else {
          return Promise.resolve({ data: responses.profile.data });
        }
      } else if (url.includes('stock/insider-transactions')) {
        if (responses.insider.error) {
          return Promise.reject(responses.insider.error);
        } else {
          return Promise.resolve({ data: responses.insider.data });
        }
      } else if (url.includes('stock/recommendation')) {
        if (responses.recommendation.error) {
          return Promise.reject(responses.recommendation.error);
        } else {
          return Promise.resolve({ data: responses.recommendation.data });
        }
      } else if (url.includes('stock/earnings')) {
        if (responses.earnings.error) {
          return Promise.reject(responses.earnings.error);
        } else {
          return Promise.resolve({ data: responses.earnings.data });
        }
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  };

  // All four calls succeed
  it('should write profile, recommendation, insider, and earnings data to the DB and return them', async () => {
    // Define successful responses
    mockAxiosGet({
      profile: {
        data: {
          ipo: '1993-06-01',
          name: 'Infosys',
          ticker: 'INFY',
        },
      },
      insider: {
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
          ],
        },
      },
      recommendation: {
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
      },
      earnings: {
        data: [
          {
            actual: 0.2,
            estimate: 0.18,
            period: '2023-03-31',
            quarter: 1,
            surprise: 0.02,
            surprisePercent: 11.1,
            symbol: 'INFY',
            year: 2023,
          },
        ],
      },
    });

    // Setup mock DB responses
    setupMockDBSuccess();

    const req = createMockRequest();
    const context = createMockContext();

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(200);
    const body = JSON.parse(res.body);

    // Validate response structure
    expect(body).toHaveProperty('companyProfile');
    expect(body).toHaveProperty('insiderTransactions');
    expect(body).toHaveProperty('recommendationTrends');
    expect(body).toHaveProperty('earningSurprises');

    // Validate content
    expect(body.companyProfile).toEqual({
      ipo: '1993-06-01',
      name: 'Infosys',
      ticker: 'INFY',
    });
    expect(body.insiderTransactions.data).toHaveLength(1);
    expect(body.recommendationTrends).toHaveLength(1);
    expect(body.earningSurprises).toHaveLength(1);
  });

  // Handle empty data from all calls
  it('should handle empty data (profile, insider, recommendation, earnings) gracefully', async () => {
    // Define empty responses
    mockAxiosGet({
      profile: {
        data: {}, // No ipo
      },
      recommendation: {
        data: [],
      },
      insider: {
        data: {
          data: [],
        },
      },
      earnings: {
        data: [],
      },
    });

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      mockQuery.mockImplementation((query) => {
        if (query.includes('CREATE TABLE')) return Promise.resolve();
        // No inserts expected due to empty data
        return Promise.resolve({ rows: [{ id: 999 }] });
      });
    }

    const req = createMockRequest();
    const context = createMockContext();

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(200);

    const body = JSON.parse(res.body);

    // Validate response structure and empty data
    expect(body).toHaveProperty('companyProfile');
    expect(body.companyProfile).toEqual({});

    expect(body).toHaveProperty('recommendationTrends');
    expect(body.recommendationTrends).toHaveLength(0);

    expect(body).toHaveProperty('insiderTransactions');
    expect(body.insiderTransactions.data).toHaveLength(0);

    expect(body).toHaveProperty('earningSurprises');
    expect(body.earningSurprises).toHaveLength(0);
  });

  // Handle an API error with insider transactions (3rd call)
  it('should handle API errors gracefully (insider transactions)', async () => {
    // Define responses with insider failing
    mockAxiosGet({
      profile: {
        data: { ipo: '1999-01-01' },
      },
      recommendation: {
        data: [],
      },
      insider: {
        error: new Error('API Error: insider'),
      },
      earnings: {
        data: [],
      },
    });

    const req = createMockRequest();
    const context = createMockContext();

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/insider-transactions');
  });

  // Handle an API error with recommendation trends (2nd call)
  it('should handle API errors gracefully (recommendation trends)', async () => {
    // Define responses with recommendation failing
    mockAxiosGet({
      profile: {
        data: { ipo: '2000-06-01' },
      },
      recommendation: {
        error: new Error('API Error: recommendation'),
      },
      insider: {
        data: { data: [] },
      },
      earnings: {
        data: [],
      },
    });

    const req = createMockRequest();
    const context = createMockContext();

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/recommendation');
  });

  // Handle an API error with the company profile (1st call)
  it('should handle API errors gracefully (company profile)', async () => {
    // Define responses with profile failing
    mockAxiosGet({
      profile: {
        error: new Error('API Error: profile'),
      },
      recommendation: {
        data: [],
      },
      insider: {
        data: [],
      },
      earnings: {
        data: [],
      },
    });

    const req = createMockRequest('ERROR'); // symbol that causes profile to fail
    const context = createMockContext();

    const res = await httpTrigger(req, context);

    expect(res.status).toBe(500);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/profile2');
  });

  // Handle an API error with earnings (4th call)
  it('should handle API errors gracefully (earnings)', async () => {
    // Define responses with earnings failing
    mockAxiosGet({
      profile: {
        data: { ipo: '2005-05-05' },
      },
      recommendation: {
        data: [],
      },
      insider: {
        data: { data: [] },
      },
      earnings: {
        error: new Error('API Error: earnings'),
      },
    });

    const req = createMockRequest();
    const context = createMockContext();

    const res = await httpTrigger(req, context);
    expect(res.status).toBe(500);

    const body = JSON.parse(res.body);
    expect(body.error).toBe('Failed to fetch data or connect to DB');
    expect(body.details).toContain('Failed to fetch stock/earnings');
  });

  // Handle database errors (all 4 calls succeed, but DB insert fails)
  if (!process.env.POSTGRES_CONNECTION_STRING || !process.env.GITHUB_ACTIONS) {
    it('should handle database errors gracefully', async () => {
      // All 4 API calls succeed
      mockAxiosGet({
        profile: {
          data: { ipo: '1993-06-01' },
        },
        recommendation: {
          data: [],
        },
        insider: {
          data: { data: [] },
        },
        earnings: {
          data: [],
        },
      });

      // Mock DB queries: CREATE TABLEs succeed, but INSERT into company_profile fails
      mockQuery
        .mockImplementationOnce(() => Promise.resolve()) // CREATE TABLE company_profile
        .mockImplementationOnce(() => Promise.resolve()) // CREATE TABLE recommend_data
        .mockImplementationOnce(() => Promise.resolve()) // CREATE TABLE insider_transactions
        .mockImplementationOnce(() => Promise.resolve()) // CREATE TABLE earn_surprise
        .mockImplementationOnce(() =>
          Promise.reject(new Error('DB Error'))
        ); // INSERT INTO company_profile fails

      const req = createMockRequest();
      const context = createMockContext();

      const res = await httpTrigger(req, context);
      expect(res.status).toBe(500);

      const body = JSON.parse(res.body);
      expect(body.error).toBe('Failed to fetch data or connect to DB');
      expect(body.details).toBe('DB Error');
    });
  }
});
