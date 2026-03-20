const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');

// GET dashboard config (single dashboard)
router.get('/', async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne();
    if (!dashboard) {
      dashboard = new Dashboard({ name: 'My Dashboard', widgets: [] });
      await dashboard.save();
    }
    res.json({ success: true, data: dashboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT save dashboard config
router.put('/', async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne();
    if (!dashboard) {
      dashboard = new Dashboard(req.body);
    } else {
      dashboard.widgets = req.body.widgets;
      dashboard.name = req.body.name || dashboard.name;
    }
    await dashboard.save();
    res.json({ success: true, data: dashboard });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
