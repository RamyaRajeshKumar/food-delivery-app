// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  deliveryInfo: {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    instructions: String,
    userId: String // Optional: link to user if authenticated
  },
  items: [{
    menuItem: {
      name: String,
      price: Number,
      description: String
    },
    quantity: Number,
    restaurant: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      address: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "cod"],
    default: "card"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  paymentDetails: {
    type: Object, // Store card last 4 digits or UPI ID
    default: null
  },
  orderStatus: {
    type: String,
    enum: ["confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "confirmed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date,
  cancelledAt: Date
});

module.exports = mongoose.model("Order", orderSchema);