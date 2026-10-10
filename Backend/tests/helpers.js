const jwt = require('jsonwebtoken');

// Creates a valid login token for a fake user, like the one /api/auth/login returns
const tokenFor = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

const bearer = (id, role) => `Bearer ${tokenFor(id, role)}`;

module.exports = { tokenFor, bearer };
