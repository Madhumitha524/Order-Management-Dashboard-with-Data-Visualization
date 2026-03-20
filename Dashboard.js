const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['kpi', 'bar-chart', 'line-chart', 'area-chart', 'scatter-plot', 'pie-chart', 'table', 'date-filter']
  },
  title: { type: String, default: 'Untitled' },
  description: { type: String, default: '' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  size: {
    width: { type: Number, default: 4 },
    height: { type: Number, default: 4 }
  },
  config: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const dashboardSchema = new mongoose.Schema({
  name: { type: String, default: 'My Dashboard' },
  widgets: [widgetSchema]
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);
