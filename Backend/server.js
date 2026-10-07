const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Needed when running behind a host's proxy (Render)
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '100kb' }));

// General limit: 300 requests per 15 minutes per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

// Strict limit on login/register: 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

const authRoutes = require('./routes/authRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
