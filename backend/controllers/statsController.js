const db = require('../db');

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

exports.getStats = async (req, res) => {
  try {
    const customersCount = await db.query('SELECT COUNT(*) FROM customers');
    const ordersCount = await db.query('SELECT COUNT(*) FROM service_orders');
    
    // Join with order_status to filter by name 'entregado'
    const completedOrdersResult = await db.query(`
      SELECT COUNT(*), SUM(total_cost) FROM service_orders so
      JOIN order_status os ON so.status_id = os.id
      WHERE os.name = 'entregado'
    `);
    const totalRevenue = completedOrdersResult.rows[0].sum || 0;
    const completedCount = parseInt(completedOrdersResult.rows[0].count);

    // Fetch 5 most recent orders
    const recentOrders = await db.query(`
      SELECT o.id, c.name as customer_name, e.type as equipment_type, s.name as status_name, o.created_at
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Fetch orders created today
    const todayOrdersResult = await db.query(`
      SELECT o.id, c.name as customer_name, e.type as equipment_type, s.name as status_name, o.created_at
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      WHERE o.created_at::date = CURRENT_DATE
      ORDER BY o.created_at DESC
    `);

    // Fetch completed orders list
    const completedOrdersList = await db.query(`
      SELECT o.id, c.name as customer_name, e.type as equipment_type, o.total_cost, o.delivery_date, o.created_at
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      WHERE s.name = 'entregado'
      ORDER BY o.delivery_date DESC
      LIMIT 20
    `);

    // Fetch upcoming orders (today, tomorrow, day after)
    const upcomingOrders = await db.query(`
      SELECT o.id, c.name as customer_name, e.type as equipment_type, s.name as status_name, o.delivery_date, o.created_at
      FROM service_orders o
      JOIN equipment e ON o.equipment_id = e.id
      JOIN customers c ON e.customer_id = c.id
      JOIN order_status s ON o.status_id = s.id
      WHERE o.delivery_date::date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '2 days')
      AND s.name != 'entregado'
      ORDER BY o.delivery_date ASC
    `);

    const totalOrders = parseInt(ordersCount.rows[0].count);
    const percentage = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

    res.json({
      totalCustomers: parseInt(customersCount.rows[0].count),
      totalOrders: totalOrders,
      todayOrders: todayOrdersResult.rows.length,
      todayOrdersList: todayOrdersResult.rows.map(withOrderFolio),
      completionRate: percentage,
      completedOrdersList: completedOrdersList.rows.map(withOrderFolio),
      totalRevenue: parseFloat(totalRevenue),
      recentOrders: recentOrders.rows.map(withOrderFolio),
      upcomingOrdersCount: upcomingOrders.rows.length,
      upcomingOrdersList: upcomingOrders.rows.map(withOrderFolio)
    });
  } catch (err) {
    console.error('Stats Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
