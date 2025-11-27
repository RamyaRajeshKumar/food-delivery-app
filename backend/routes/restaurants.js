const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurants");

// =========================
// GET /restaurants → list & filter
// =========================
router.get("/", async (req, res) => {
  try {
    console.log("GET /restaurants - Received filter request");
    const { location, cuisine, minRating, name } = req.query;
    console.log("Query params:", { location, name, cuisine, minRating });

    let filter = {};

    // Location search - searches in address field
    if (location && location.trim() !== "") {
      const escapedLocation = location.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.address = { $regex: escapedLocation, $options: "i" };
      console.log("Location filter:", filter.address);
    }

    // Name filter
    if (name && name.trim() !== "") {
      const escapedName = name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      filter.name = { $regex: escapedName, $options: "i" };
      console.log("Name filter:", filter.name);
    }

    // Cuisine filter
    if (cuisine && cuisine.trim() !== "") {
      filter.cuisine = cuisine;
      console.log("Cuisine filter:", filter.cuisine);
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
      console.log("Rating filter:", filter.rating);
    }

    console.log("Final filter for MongoDB:", JSON.stringify(filter, null, 2));
    
    // DEBUG: Check what's actually in the database
    const allRestaurants = await Restaurant.find({});
    console.log(`Total restaurants in database: ${allRestaurants.length}`);
    if (allRestaurants.length > 0) {
      console.log("Sample addresses from database:");
      allRestaurants.slice(0, 5).forEach(r => {
        console.log(`  - ${r.name}: "${r.address}"`);
      });
    }
    
    const restaurants = await Restaurant.find(filter);
    console.log(`Found ${restaurants.length} restaurants matching filter.`);
    
    // Log first result for debugging
    if (restaurants.length > 0) {
      console.log("First result:", restaurants[0].name, "-", restaurants[0].address);
    }
    
    res.json(restaurants);
  } catch (err) {
    console.error("Error in GET /restaurants:", err);
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
});

// =========================
// GET /restaurants/nearby → Zomato-style
// Example: /restaurants/nearby?lat=12.97&lon=77.59
// =========================
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "lat and lon are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // GEO QUERY (5km radius)
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // lon, lat
          },
          $maxDistance: 5000 // 5km like Zomato
        }
      }
    });

    res.json(restaurants);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching nearby restaurants" });
  }
});

// =========================
// GET /restaurants/:id → details
// =========================
router.get("/:id", async (req, res) => {
  try {
    let restaurant;
    const { id } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      restaurant = await Restaurant.findById(id);
    } else {
      // If not a valid ID, assume it's a URL-encoded address and search by it
      const address = decodeURIComponent(id);
      restaurant = await Restaurant.findOne({ address: address });
    }

    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;