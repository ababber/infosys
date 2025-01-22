const { app } = require('@azure/functions');
const { Client } = require('pg');
const axios = require('axios');

const profile = require('./companyProfileSql');
const insider = require('./insiderTransactionSql')

// Read environment variables
const finnHubApiKey = process.env.FINNHUB_API_KEY;
const connectionString = process.env.POSTGRES_CONNECTION_STRING;

// Dynamically set AZURE_FUNCTIONS_ENV
if (!process.env.AZURE_FUNCTIONS_ENV) {
    process.env.AZURE_FUNCTIONS_ENV = 
        process.env.WEBSITE_INSTANCE_ID || process.env.FUNCTIONS_WORKER_RUNTIME 
            ? 'true' 
            : 'false';
}

// Utility to handle query and body parsing
const getSymbolFromRequest = async (request) => {
    const isAzureEnv = process.env.AZURE_FUNCTIONS_ENV === 'true';
    if (isAzureEnv) {
        // In Azure, request.query is a Map-like object
        return request.query.get('symbol') || 'INFY';
    } else {
        // In local/test environment, request.query is a plain object
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
        if (!response || !response.data) {
            throw new Error('Invalid API response');
        }
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    }
};

const httpTrigger = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);

    const symbol = await getSymbolFromRequest(request);
    // const symbol = 'INFY';

    // Connect to PostgreSQL
    const client = new Client({ connectionString });
    try {
        await client.connect();
        context.log('Connected to local PostgreSQL');

        // Create table if it doesn't exist
        await client.query(profile.createTable);
        await client.query(insider.createTable);

        // Fetch data from Finnhub
        const companyProfile = await fetchFinnhubData('stock/profile2', { symbol });
        const insiderTransactions = await fetchFinnhubData('stock/insider-transactions', { symbol });

        // Make sure the `ipo` field is in YYYY-MM-DD format to store as DATE
        // For example, `companyProfile.ipo` = '1991-03-11'
        if (companyProfile && companyProfile.ipo) {
            const companyInsertValue = profile.setCompanyInsertValues(symbol, companyProfile);

            const insertResult = await client.query(profile.insertQuery, companyInsertValue);
            context.log(`Inserted row ID = ${insertResult.rows[0].id}`);
        }

        if (insiderTransactions && Array.isArray(insiderTransactions.data) && insiderTransactions.data.length > 0) {
          const { insertQuery, allValues } = insider.insertQueryAndValues(insiderTransactions.data);
          const insertResult = await client.query(insertQuery, allValues);
          context.log(`Inserted row ID = ${insertResult.rows[0].id}`);
        }

        const combinedData = {
            symbol,
            companyProfile: companyProfile,
            insiderTransactions: insiderTransactions,
            // basicFinancials: basicFin,
            // recommendationTrends: recTrends,
            // earningSurprises: earnSuprise,
        };

        const serializedData = JSON.stringify(combinedData);

        return {
            status: 200,
            body: serializedData,
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        context.log(`Error fetching data or connecting to DB: ${error.message}`);
        context.log('Error stack:', error.stack); // Add detailed error logging
        return {
            status: 500,
            body: JSON.stringify({
                error: 'Failed to fetch data or connect to DB',
                details: error.message,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } finally {
        // Disconnect from PostgreSQL
        await client.end();
    }
};

app.http('httpTrigger', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger,
});

// Export for testing
module.exports = { httpTrigger };
