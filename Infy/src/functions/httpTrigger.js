const { app } = require('@azure/functions');
const axios = require('axios');
const finnHubApiKey = process.env.FINNHUB_API_KEY;

// Dynamically set AZURE_FUNCTIONS_ENV
if (!process.env.AZURE_FUNCTIONS_ENV) {
    process.env.AZURE_FUNCTIONS_ENV = process.env.WEBSITE_INSTANCE_ID || process.env.FUNCTIONS_WORKER_RUNTIME ? 'true' : 'false';
}

// Utility to handle query and body parsing
const getSymbolFromRequest = async (request) => {
    const isAzureEnv = process.env.AZURE_FUNCTIONS_ENV === 'true';
    if (isAzureEnv) {
        // In Azure, query is a Map-like object with .get() method
        return request.query.get('symbol') || 'INFY';
    } else {
        // In local/test environment, query is a plain object
        return request.query.symbol || 'INFY';
    }
};

// Utility to make API requests
const fetchFinnhubData = async (endpoint, params) => {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/${endpoint}`, {
            params: {
                ...params,
                token: finnHubApiKey,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    }
};

const httpTrigger = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    // Get the symbol from the request query or default to 'INFY'
    const symbol = await getSymbolFromRequest(request);

    try {
        // Fetch data from the Finnhub API
        const profile = await fetchFinnhubData('stock/profile2', { symbol });
        const basicFin = await fetchFinnhubData('stock/metric', { symbol, metric: 'all' });
        const insiderTrans = await fetchFinnhubData('stock/insider-transactions', { symbol });
        const recTrends = await fetchFinnhubData('stock/recommendation', { symbol });
        const earnSuprise = await fetchFinnhubData('stock/earnings', { symbol, limit: 4 });

        // Combine the data from the endpoints
        const combinedData = {
            symbol,
            companyProfile: profile,
            basicFinancials: basicFin,
            insiderTransactions: insiderTrans,
            recommendationTrends: recTrends,
            earningSurprises: earnSuprise,
        };

        // Serialize combined data to a JSON string
        const serializedData = JSON.stringify(combinedData);

        // Return the serialized data
        return {
            status: 200,
            body: serializedData,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        context.log(`Error fetching data from Finnhub API: ${error.message}`);
        return {
            status: 500,
            body: JSON.stringify({ error: 'Failed to fetch data from Finnhub API', details: error.message }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
};

app.http('httpTrigger', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger,
});

// Export the handler for testing
module.exports = { httpTrigger };
