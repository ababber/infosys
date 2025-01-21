# finnhub basics

## the `insiderTransactions()` endpoint does not work, but it can be reached via `axios`

```javascript
const { app } = require('@azure/functions');
const finnhub = require('finnhub');
const finnHubApiKey = process.env.FINNHUB_API_KEY;

// Configure the Finnhub API key
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = finnHubApiKey;
const finnhubClient = new finnhub.DefaultApi();

// Dynamically set AZURE_FUNCTIONS_ENV
if (!process.env.AZURE_FUNCTIONS_ENV) {
    process.env.AZURE_FUNCTIONS_ENV = process.env.WEBSITE_INSTANCE_ID || process.env.FUNCTIONS_WORKER_RUNTIME ? 'true' : 'false';
}

// Utility to handle query and body parsing
const getSymbolFromRequest = async (request) => {
    const isAzureEnv = process.env.AZURE_FUNCTIONS_ENV === 'true';
    if (isAzureEnv) {
        // In Azure, query is a Map-like object with .get() method
        return request.query.get('symbol') || 'DKNG';
    } else {
        // In local/test environment, query is a plain object
        return request.query.symbol || 'DKNG';
    }
};

const httpTrigger = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    // Get the symbol from the request query or default to 'AAPL'
    const symbol = await getSymbolFromRequest(request);

    try {
        // Fetch data from the Finnhub API
        const profile = await new Promise((resolve, reject) => {
            finnhubClient.companyProfile2({ symbol }, (error, data) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });

        const basicFin = await new Promise((resolve, reject) => {
            finnhubClient.companyBasicFinancials(symbol, 'all', (error, data) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });

        const insiderTrans = await new Promise((resolve, reject) => {
            // the below method does not work
            finnhubClient.insiderTransactions(symbol, (error, data) => {
                if (error) {
                    return reject(`error: ${error}`);
                }
                resolve(data);
            });
        });

        const recTrends = await new Promise((resolve, reject) => {
            finnhubClient.recommendationTrends(symbol, (error, data) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });

        // free tier limited to last 4 quarters
        const earnSuprise = await new Promise((resolve, reject) => {
            finnhubClient.companyEarnings(symbol, {'limit': 4},  (error, data) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });

        // Combine the data from both endpoints
        const combinedData = {
            symbol,
            companyProfile: profile,
            basicFinancials: basicFin,
            insderTransactions: insiderTrans,
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

```
