const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // GEOJSON location (REQUIRED for nearby search)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },

  cuisine: { type: String, required: true },
  cost: { type: String }, // $, $$, $$$
  rating: { type: Number, default: 0 },
  address: { type: String },

  menu: [
    {
      name: String,
      price: Number,
      description: String
    }
  ]
}, { timestamps: true });

// VERY IMPORTANT GEO INDEX
RestaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", RestaurantSchema);
