jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../config/db');
const app = require('../app');
const { bearer } = require('./helpers');

beforeEach(() => pool.query.mockReset());

describe('POST /api/messages', () => {
  test('requires login', async () => {
    const res = await request(app).post('/api/messages').send({ receiverId: 2, content: 'hi' });
    expect(res.status).toBe(401);
  });

  test('rejects an empty or whitespace-only message', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 2, content: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Message must be 1-2000 characters.');
  });

  test('rejects a message that is too long', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 2, content: 'a'.repeat(2001) });
    expect(res.status).toBe(400);
  });

  test('rejects an invalid receiver id', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 'abc', content: 'hi' });
    expect(res.status).toBe(400);
  });

  test('rejects a message to yourself', async () => {
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 1, content: 'hi' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You cannot send a message to yourself.');
  });

  test('rejects a receiver that does not exist', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 99999, content: 'hi' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Receiver not found.');
  });

  test('sends a valid message', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2 }]]).mockResolvedValueOnce([{ insertId: 10 }]);
    const res = await request(app).post('/api/messages').set('Authorization', bearer(1, 'student')).send({ receiverId: 2, content: '  hello  ' });
    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[1][1]).toEqual([1, 2, 'hello']);
  });
});

describe('Reading messages', () => {
  test('rejects a non-numeric user id', async () => {
    const res = await request(app).get('/api/messages/abc').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(400);
  });

  test('returns a conversation and marks it as read', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, content: 'hi' }]]).mockResolvedValueOnce([{}]);
    const res = await request(app).get('/api/messages/2').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('unread-count returns a number', async () => {
    pool.query.mockResolvedValueOnce([[{ count: 4 }]]);
    const res = await request(app).get('/api/messages/unread-count').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ count: 4 });
  });

  test('conversations list works', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 2, name: 'Bob', role: 'mentor' }]]);
    const res = await request(app).get('/api/messages/conversations').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
  });
});
