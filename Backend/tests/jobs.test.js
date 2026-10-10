jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const pool = require('../config/db');
const app = require('../app');
const { bearer } = require('./helpers');

const goodJob = { title: 'Dev Intern', company: 'ACME', type: 'internship', apply_link: 'https://acme.com/apply' };

beforeEach(() => pool.query.mockReset());

describe('GET /api/jobs', () => {
  test('is public and returns the list', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, title: 'Dev', posted_by_name: 'Anna' }]]);
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/jobs', () => {
  test('requires login', async () => {
    const res = await request(app).post('/api/jobs').send(goodJob);
    expect(res.status).toBe(401);
  });

  test('rejects an invalid job type', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(2, 'mentor')).send({ ...goodJob, type: 'banana' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid job type.');
  });

  test('rejects a link that is not http(s)', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(2, 'mentor')).send({ ...goodJob, apply_link: 'hello' });
    expect(res.status).toBe(400);
  });

  test('rejects a missing title', async () => {
    const { title, ...rest } = goodJob;
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(2, 'mentor')).send(rest);
    expect(res.status).toBe(400);
  });

  test('students cannot post a full-time job', async () => {
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(1, 'student')).send({ ...goodJob, type: 'full-time' });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Students can only post internships.');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('students can post an internship', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 1 }]);
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(1, 'student')).send(goodJob);
    expect(res.status).toBe(201);
  });

  test('mentors can post a full-time job, saved under their own user id', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/jobs').set('Authorization', bearer(9, 'mentor')).send({ ...goodJob, type: 'full-time' });
    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[0][1]).toContain(9);
  });
});

describe('DELETE /api/jobs/:id', () => {
  test('rejects a non-numeric id', async () => {
    const res = await request(app).delete('/api/jobs/abc').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(400);
  });

  test("cannot delete someone else's job", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/jobs/5').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(404);
  });

  test('can delete your own job', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/jobs/5').set('Authorization', bearer(1, 'student'));
    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['5', 1]);
  });
});
