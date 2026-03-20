const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Customer Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  emailId: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  stateProvince: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: {
    type: String,
    required: true,
    enum: ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong']
  },
  // Order Information
  product: {
    type: String,
    required: true,
    enum: ['Fiber Internet 300 Mbps', '5G Unlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package']
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In progress', 'Completed'],
    default: 'Pending'
  },
  createdBy: {
    type: String,
    required: true,
    enum: ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin']
  },
  orderId: { type: String, unique: true },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-generate orderId
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
  // Auto-calculate totalAmount
  this.totalAmount = this.quantity * this.unitPrice;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
