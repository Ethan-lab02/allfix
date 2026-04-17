const db = require('../db');

const parseArrayField = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_err) {
    return String(value)
      .split(/[, \n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const buildOrderFolio = (order) => {
  const baseDate = order.created_at ? new Date(order.created_at) : new Date();
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  const orderId = String(order.id).padStart(4, '0');

  return `AF-${year}${month}${day}-${orderId}`;
};

const withOrderFolio = (order) => ({
  ...order,
  folio: buildOrderFolio(order)
});

const getStatusIdByName = async (name) => {
  const result = await db.query('SELECT id FROM order_status WHERE name = $1 LIMIT 1', [name]);
  return result.rows[0]?.id || null;
};

exports.getOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, e.type as equipment_type, e.brand, e.model, c.name as customer_name, s.name as status_name
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows.map(withOrderFolio));
  } catch (err) {
    console.error('Get Orders Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getStatuses = async (_req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM order_status ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTechnicians = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('technician', 'admin')
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { 
    customer_id, equipment_type, brand, model,
    problem_description, accessories, estimated_cost, technician_id, photo_urls,
    delivery_date 
  } = req.body;

  const accessoriesList = parseArrayField(accessories);
  const uploadedPhotoUrls = (req.files || []).map((file) => `/uploads/orders/${file.filename}`);
  const manualPhotoUrls = parseArrayField(photo_urls);
  const finalPhotoUrls = [...manualPhotoUrls, ...uploadedPhotoUrls];
  const receptionist_id = req.user.id;

  try {
    await db.query('BEGIN');

    // 1. Create Equipment entry
    const eqResult = await db.query(
      'INSERT INTO equipment (customer_id, type, brand, model, serial_number, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [customer_id, equipment_type, brand, model, null, problem_description]
    );
    const equipment_id = eqResult.rows[0].id;

    // 2. Get default status
    const status_id = await getStatusIdByName('recibido');

    // 3. Create Service Order
    const orderResult = await db.query(
      'INSERT INTO service_orders (equipment_id, technician_id, receptionist_id, status_id, diagnosis, total_cost, delivery_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [equipment_id, technician_id || null, receptionist_id, status_id, problem_description, estimated_cost || 0, delivery_date || null]
    );
    const orderId = orderResult.rows[0].id;

    // 4. Create Accessories
    if (accessoriesList.length > 0) {
      for (const accessory of accessoriesList) {
        await db.query('INSERT INTO accessories (order_id, description) VALUES ($1, $2)', [orderId, accessory]);
      }
    }

    // 5. Create Photos
    if (finalPhotoUrls.length > 0) {
      for (const url of finalPhotoUrls) {
        await db.query('INSERT INTO photos (order_id, url) VALUES ($1, $2)', [orderId, url]);
      }
    }

    await db.query('COMMIT');
    res.status(201).json(withOrderFolio(orderResult.rows[0]));
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Create Order Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const { technician_id, diagnosis, observations, total_cost, delivery_date, status_id } = req.body;

  try {
    let finalDeliveryDate = delivery_date;
    const deliveredStatusId = await getStatusIdByName('entregado');
    if (parseInt(status_id, 10) === deliveredStatusId && !delivery_date) {
      finalDeliveryDate = new Date();
    }

    const result = await db.query(
      'UPDATE service_orders SET technician_id = $1, diagnosis = $2, observations = $3, total_cost = $4, delivery_date = $5, status_id = COALESCE($6, status_id) WHERE id = $7 RETURNING *',
      [technician_id, diagnosis, observations, total_cost, finalDeliveryDate, status_id, id]
    );
    res.json(withOrderFolio(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status_id } = req.body;

  try {
    let delivery_date = null;
    const deliveredStatusId = await getStatusIdByName('entregado');
    if (parseInt(status_id, 10) === deliveredStatusId) {
      delivery_date = new Date();
    }

    const result = await db.query(
      'UPDATE service_orders SET status_id = $1, delivery_date = COALESCE($2, delivery_date) WHERE id = $3 RETURNING *',
      [status_id, delivery_date, id]
    );
    res.json(withOrderFolio(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT o.*, e.type as equipment_type, e.brand, e.model,
             c.name as customer_name, c.phone as customer_phone, c.address as customer_address,
             s.name as status_name, u.name as technician_name, r.name as receptionist_name
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      LEFT JOIN users u ON o.technician_id = u.id
      LEFT JOIN users r ON o.receptionist_id = r.id
      WHERE o.id = $1
    `, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });

    const accessories = await db.query('SELECT description FROM accessories WHERE order_id = $1', [id]);
    const photos = await db.query('SELECT url, description FROM photos WHERE order_id = $1', [id]);
    
    res.json({ 
      ...withOrderFolio(result.rows[0]),
      accessories: accessories.rows.map(a => a.description), 
      photos: photos.rows 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    // Note: cascade delete on accessories and photos is handled by DB schema
    const result = await db.query('DELETE FROM service_orders WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (err) {
    console.error('Delete Order Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
