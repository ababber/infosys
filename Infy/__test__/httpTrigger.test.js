const { httpTrigger } = require('../src/functions/httpTrigger');
const httpMocks = require('node-mocks-http');

describe('httpTrigger Function', () => {
    // Ensure we are in test mode
    beforeAll(() => {
        process.env.AZURE_FUNCTIONS_ENV = 'false'; 
    });

    it('should return "Hello, world!" when no name is provided', async () => {
        // Local environment uses plain object for query
        const req = httpMocks.createRequest({
            method: 'GET',
            query: {}, 
        });

        req.text = jest.fn().mockResolvedValue(null);

        const context = { log: jest.fn() };
        const res = await httpTrigger(req, context);
        expect(res.body).toBe('Hello, world!');
    });

    it('should return personalized greeting if name is provided', async () => {
        // Local environment uses plain object for query
        const req = httpMocks.createRequest({
            method: 'GET',
            query: { name: 'Azure' }, 
        });

        const context = { log: jest.fn() };
        const res = await httpTrigger(req, context);
        expect(res.body).toBe('Hello, Azure!');
    });
});
