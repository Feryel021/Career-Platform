jest.mock('../config/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const app = require('../app');

const validUser = {
  name: 'Anna Kiss',
  email: 'anna@example.com',
  password: 'password123',
  role: 'student',
};

beforeEach(() => pool.query.mockReset());

describe('POST /api/auth/register', () => {
  test('rejects a role that does not exist (e.g. admin)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid role.');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, password: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8-72/);
  });

  test('rejects an invalid email address', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test('rejects a missing name', async () => {
    const { name, ...noName } = validUser;
    const res = await request(app).post('/api/auth/register').send(noName);
    expect(res.status).toBe(400);
  });

  test('rejects an email that is already registered', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered.');
  });

  test('creates a user and stores a hashed password, never the plain one', async () => {
    pool.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([{ insertId: 5 }]);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);

    const insertArgs = pool.query.mock.calls[1][1];
    const storedPassword = insertArgs[2];
    expect(storedPassword).not.toBe(validUser.password);
    expect(await bcrypt.compare(validUser.password, storedPassword)).toBe(true);
  });

  test('does not leak database errors to the client', async () => {
    pool.query.mockRejectedValueOnce(new Error('secret db details'));
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secret db details');
  });
});

describe('POST /api/auth/login', () => {
  test('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  test('rejects an unknown email', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com', password: 'whatever1' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  test('rejects a wrong password with the same message (no user enumeration)', async () => {
    const hash = await bcrypt.hash('correct-password', 4);
    pool.query.mockResolvedValueOnce([[{ id: 1, name: 'A', role: 'student', password: hash }]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'wrong-password' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  test('returns a token and user info on success', async () => {
    const hash = await bcrypt.hash('correct-password', 4);
    pool.query.mockResolvedValueOnce([[{ id: 7, name: 'Anna', role: 'mentor', password: hash }]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'correct-password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: 7, name: 'Anna', role: 'mentor' });
    expect(res.body.user.password).toBeUndefined();
  });
});
