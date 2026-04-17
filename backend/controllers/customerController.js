const db = require('../db');

exports.getCustomers = async (req, res) => {
  try {
    console.log('Fetching customers for user:', req.user.id);
    const result = await db.query('SELECT * FROM customers ORDER BY name');
    console.log('Customers found in DB:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Get Customers Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { name, phone, email, address } = req.body;
  
  // Normalize email: store empty strings as NULL to avoid unique constraint violations
  const normalizedEmail = email && email.trim() !== '' ? email.trim() : null;

  try {
    const result = await db.query(
      'INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, normalizedEmail, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Customer Creation Error:', err.message);
    if (err.code === '23505') { // PostgreSQL Unique Violation
      return res.status(400).json({ error: 'Ya existe un cliente registrado con ese correo electrónico.' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address } = req.body;

  const normalizedEmail = email && email.trim() !== '' ? email.trim() : null;

  try {
    const updateResult = await db.query(
      'UPDATE customers SET name = $1, phone = $2, email = $3, address = $4 WHERE id = $5 RETURNING *',
      [name, phone, normalizedEmail, address, id]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Customer Update Error:', err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un cliente con ese correo.' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
