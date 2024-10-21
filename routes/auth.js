const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const router = express.Router();
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

// Register new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf-8'));
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      userId: users.length + 1,
      username,
      hashedPassword
    };
    users.push(newUser);
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf-8'));
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    req.session.user = { userId: user.userId, username: user.username };
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
