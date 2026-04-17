const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('--- Auth Failed: No Token ---');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'supersecretkey';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log('--- Auth Success for User:', decoded.id, '---');
    next();
  } catch (err) {
    console.error('--- Auth Failed: Invalid Token ---', err.message);
    res.status(400).json({ error: 'Invalid token.' });
  }
};
