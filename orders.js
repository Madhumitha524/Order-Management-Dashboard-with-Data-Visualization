const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET all orders (with optional date filter)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create order
router.post('/', async (req, res) => {
  try {
    const { quantity, unitPrice, ...rest } = req.body;
    const order = new Order({
      ...rest,
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice
    });
    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  try {
    const { quantity, unitPrice, ...rest } = req.body;
    const updateData = { ...rest, quantity, unitPrice, totalAmount: quantity * unitPrice };
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET aggregated stats for KPI widgets
router.get('/stats/aggregate', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' },
          totalUnitPrice: { $sum: '$unitPrice' },
          avgUnitPrice: { $avg: '$unitPrice' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ success: true, data: stats[0] || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
