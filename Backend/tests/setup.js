// Runs before every test file: gives the app the settings it normally reads from .env
process.env.JWT_SECRET = 'test-secret-for-automated-tests';
process.env.FRONTEND_URL = 'http://localhost:3000';
