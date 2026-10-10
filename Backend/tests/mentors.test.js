jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../config/db');
const app = require('../app');
const { bearer } = require('./helpers');

beforeEach(() => pool.query.mockReset());

describe('POST /api/mentors/request', () => {
  test('mentors cannot send requests (students only)', async () => {
    const res = await request(app).post('/api/mentors/request').set('Authorization', bearer(2, 'mentor')).send({ mentorId: 3 });
    expect(res.status).toBe(403);
  });

  test('rejects an invalid mentor id', async () => {
    const res = await request(app).post('/api/mentors/request').set('Authorization', bearer(1, 'student')).send({ mentorId: 'abc' });
    expect(res.status).toBe(400);
  });

  test('rejects a user who is not a mentor', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/mentors/request').set('Authorization', bearer(1, 'student')).send({ mentorId: 3 });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Mentor not found.');
  });

  test('rejects a duplicate request', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 3 }]]).mockResolvedValueOnce([[{ id: 1, status: 'pending' }]]);
    const res = await request(app).post('/api/mentors/request').set('Authorization', bearer(1, 'student')).send({ mentorId: 3 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Request already sent.');
  });

  test('creates a pending request', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 3 }]]).mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId: 1 }]);
    const res = await request(app).post('/api/mentors/request').set('Authorization', bearer(1, 'student')).send({ mentorId: 3 });
    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[2][1]).toEqual([1, 3, 'pending']);
  });
});

describe('Listing requests', () => {
  test('only mentors can see received requests', async () => {
    const res = await request(app).get('/api/mentors/requests').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(403);
  });

  test('only students can see sent requests', async () => {
    const res = await request(app).get('/api/mentors/student-requests').set('Authorization', bearer(2, 'mentor'));
    expect(res.status).toBe(403);
  });

  test('a mentor gets their received requests', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Student', status: 'pending' }]]);
    const res = await request(app).get('/api/mentors/requests').set('Authorization', bearer(2, 'mentor'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('PUT /api/mentors/request/update', () => {
  test('students cannot accept their own requests', async () => {
    const res = await request(app).put('/api/mentors/request/update').set('Authorization', bearer(1, 'student')).send({ requestId: 1, status: 'accepted' });
    expect(res.status).toBe(403);
  });

  test('rejects an invalid status', async () => {
    const res = await request(app).put('/api/mentors/request/update').set('Authorization', bearer(2, 'mentor')).send({ requestId: 1, status: 'maybe' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid request status.');
  });

  test("a mentor cannot update another mentor's request", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/mentors/request/update').set('Authorization', bearer(2, 'mentor')).send({ requestId: 1, status: 'accepted' });
    expect(res.status).toBe(404);
  });

  test('a mentor can accept a request addressed to them', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/mentors/request/update').set('Authorization', bearer(2, 'mentor')).send({ requestId: 1, status: 'accepted' });
    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['accepted', 1, 2]);
  });
});
