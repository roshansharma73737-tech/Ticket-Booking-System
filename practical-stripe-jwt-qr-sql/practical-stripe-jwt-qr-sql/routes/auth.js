
  
const express = require('express');
const jwt = require('jsonwebtoken');
const { get } = require('../database/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password]
  );

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

module.exports = router;
