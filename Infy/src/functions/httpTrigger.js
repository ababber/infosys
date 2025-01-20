const { app } = require('@azure/functions');

// Dynamically set AZURE_FUNCTIONS_ENV
if (!process.env.AZURE_FUNCTIONS_ENV) {
    process.env.AZURE_FUNCTIONS_ENV = process.env.WEBSITE_INSTANCE_ID || process.env.FUNCTIONS_WORKER_RUNTIME ? 'true' : 'false';
}

// Utility to handle query and body parsing
const getNameFromRequest = async (request) => {
    const isAzureEnv = process.env.AZURE_FUNCTIONS_ENV === 'true';
    if (isAzureEnv) {
        // In Azure, query is a Map-like object with .get() method
        return request.query.get('name') || (await request.text()) || 'world';
    } else {
        // In local/test environment, query is a plain object
        return request.query.name || (await request.text()) || 'world';
    }
};

const httpTrigger = async (request, context) => {
    context.log(`Http function processed request for url "${request.url}"`);
    const name = await getNameFromRequest(request);
    // context.log(`AZURE_FUNCTIONS_ENV: ${process.env.AZURE_FUNCTIONS_ENV}`);
    return { body: `Hello, ${name}!` };
};

app.http('httpTrigger', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger,
});

// Export the handler for testing
module.exports = { httpTrigger };
