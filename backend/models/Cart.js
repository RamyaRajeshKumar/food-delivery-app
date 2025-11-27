// models/Cart.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  menuItem: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  restaurant: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    name: { type: String, required: true },
    address: String
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.menuItem.price * item.quantity);
  }, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);