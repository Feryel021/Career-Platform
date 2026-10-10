jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../config/db');
const app = require('../app');
const { bearer } = require('./helpers');

beforeEach(() => pool.query.mockReset());

describe('Server basics and security headers', () => {
  test('GET / reports that the server is running', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('responses carry security headers set by helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route not found.');
  });

  test('malformed JSON returns 400 instead of crashing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ this is not json');
    expect(res.status).toBe(400);
  });
});

describe('CORS', () => {
  test('allows the configured frontend origin', async () => {
    const res = await request(app).get('/').set('Origin', 'http://localhost:3000');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  test('blocks any other origin', async () => {
    const res = await request(app).get('/').set('Origin', 'http://evil.example.com');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('Authentication middleware', () => {
  test('rejects requests without a token (401)', async () => {
    const res = await request(app).get('/api/mentors');
    expect(res.status).toBe(401);
  });

  test('rejects a forged or invalid token (403)', async () => {
    const res = await request(app).get('/api/mentors').set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(403);
  });

  test('accepts a valid token', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/mentors').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
  });
});

describe('API documentation', () => {
  test('Swagger UI is served at /api-docs/', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });
});
