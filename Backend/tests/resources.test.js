jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../config/db');
const app = require('../app');
const { bearer } = require('./helpers');

const goodResource = { title: 'CV template', link: 'https://example.com/cv', category: 'CV Writing' };

beforeEach(() => pool.query.mockReset());

describe('Resources', () => {
  test('GET is public', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, title: 'x' }]]);
    const res = await request(app).get('/api/resources');
    expect(res.status).toBe(200);
  });

  test('POST requires login', async () => {
    const res = await request(app).post('/api/resources').send(goodResource);
    expect(res.status).toBe(401);
  });

  test('POST rejects an invalid link', async () => {
    const res = await request(app).post('/api/resources').set('Authorization', bearer(1, 'student')).send({ ...goodResource, link: 'hello' });
    expect(res.status).toBe(400);
  });

  test('POST rejects an unknown category', async () => {
    const res = await request(app).post('/api/resources').set('Authorization', bearer(1, 'student')).send({ ...goodResource, category: 'Spam' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid category.');
  });

  test('students can share a resource', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    const res = await request(app).post('/api/resources').set('Authorization', bearer(1, 'student')).send(goodResource);
    expect(res.status).toBe(201);
  });

  test("DELETE cannot remove someone else's resource", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/resources/3').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(404);
  });

  test('DELETE removes your own resource', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/resources/3').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
  });
});
