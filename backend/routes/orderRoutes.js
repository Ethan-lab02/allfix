const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(auth);

router.get('/', orderController.getOrders);
router.get('/statuses', orderController.getStatuses);
router.get('/technicians', orderController.getTechnicians);
router.get('/:id', orderController.getOrderDetails);
router.post('/', upload.array('photos', 5), orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
