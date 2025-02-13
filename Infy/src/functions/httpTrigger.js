const { app } = require('@azure/functions');
const { Client } = require('pg');
const axios = require('axios');

const profile = require('./companyProfileSql');
const insider = require('./insiderTransactionSql');
const recommend = require('./recommendDataSql');
const earn = require('./earnSurpriseSql');

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
        await client.query(recommend.createTable);
        await client.query(earn.createTable);

        // Fetch data from Finnhub
        const companyProfile = await fetchFinnhubData('stock/profile2', { symbol });
        const insiderTransactions = await fetchFinnhubData('stock/insider-transactions', { symbol });
        const recommendationTrends = await fetchFinnhubData('stock/recommendation', { symbol });
        const earningSurprise = await fetchFinnhubData('stock/earnings', { symbol, limit: 4 });

        // @TODO: get time series data from finnhub and write to db
        // const basicFinancial = await fetchFinnhubData('stock/metric', { symbol, metric: 'all' });

        // Make sure the date field is in YYYY-MM-DD format to store as DATE
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

        if (recommendationTrends && Array.isArray(recommendationTrends) && recommendationTrends.length > 0) {
          const { insertQuery, allValues } = recommend.insertQueryAndValues(recommendationTrends);
          const insertResult = await client.query(insertQuery, allValues);
          context.log(`Inserted row ID = ${insertResult.rows[0].id}`);
        }

        if (earningSurprise && Array.isArray(earningSurprise) && earningSurprise.length > 0) {
          const { insertQuery, allValues } = earn.insertQueryAndValues(earningSurprise);
          const insertResult = await client.query(insertQuery, allValues);
          context.log(`Inserted row ID = ${insertResult.rows[0].id}`);
        }

        const combinedData = {
            symbol,
            companyProfile: companyProfile,
            insiderTransactions: insiderTransactions,
            recommendationTrends: recommendationTrends,
            earningSurprises: earningSurprise,
            // basicFinancials: basicFin,
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
        // The code below is for debugging and runs in production
        if (process.env.NODE_ENV !== 'test') {
            console.error(error);
            context.log(`Error fetching data or connecting to DB: ${error.message}`);
            context.log('Error stack:', error.stack);
        }

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
    authLevel: 'function',
    handler: httpTrigger,
});

// Export for testing
module.exports = { httpTrigger };
