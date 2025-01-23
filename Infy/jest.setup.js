// Explicitly set node test env

process.env.NODE_ENV = 'test';

// Suppress azure test mode warnings
jest.spyOn(console, 'warn').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {});