const mongoose = require("mongoose");
const Restaurant = require("./models/Restaurants");

// Replace with your MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/foodDeliveryDB" || process.env.MONGODB_URI;

const sampleRestaurants = [
  // BREAKFAST PLACES
  {
    name: "The Breakfast Club",
    cuisine: "Breakfast",
    cost: "$",
    rating: 4.5,
    address: "Indiranagar, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6408, 12.9719]
    },
    menu: [
      { name: "Pancakes with Maple Syrup", price: 250, description: "Fluffy pancakes" },
      { name: "English Breakfast", price: 350, description: "Eggs, bacon, sausage, beans" },
      { name: "Avocado Toast", price: 280, description: "Sourdough with smashed avocado" },
      { name: "Fresh Orange Juice", price: 120, description: "Freshly squeezed" }
    ]
  },
  {
    name: "Morning Glory Cafe",
    cuisine: "Breakfast",
    cost: "$",
    rating: 4.3,
    address: "Connaught Place, New Delhi",
    location: {
      type: "Point",
      coordinates: [77.2167, 28.6315]
    },
    menu: [
      { name: "Masala Omelette", price: 120, description: "Spicy Indian omelette" },
      { name: "Poha", price: 80, description: "Flattened rice with spices" },
      { name: "French Toast", price: 150, description: "Classic breakfast" },
      { name: "Filter Coffee", price: 60, description: "South Indian style" }
    ]
  },

  // LUNCH SPOTS
  {
    name: "The Lunch Box",
    cuisine: "Lunch",
    cost: "$",
    rating: 4.4,
    address: "Koramangala, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6309, 12.9352]
    },
    menu: [
      { name: "Chicken Biryani", price: 280, description: "Aromatic rice with chicken" },
      { name: "Paneer Butter Masala", price: 240, description: "Cottage cheese in creamy gravy" },
      { name: "Dal Tadka", price: 180, description: "Tempered lentils" },
      { name: "Thali", price: 320, description: "Complete Indian meal" }
    ]
  },
  {
    name: "Workplace Bistro",
    cuisine: "Lunch",
    cost: "$",
    rating: 4.2,
    address: "Whitefield, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.7499, 12.9698]
    },
    menu: [
      { name: "Grilled Chicken Sandwich", price: 220, description: "With fries" },
      { name: "Caesar Salad", price: 280, description: "Fresh and healthy" },
      { name: "Pasta Alfredo", price: 300, description: "Creamy pasta" },
      { name: "Iced Tea", price: 80, description: "Refreshing drink" }
    ]
  },

  // DINNER RESTAURANTS
  {
    name: "Fine Dine Restaurant",
    cuisine: "Dinner",
    cost: "$$",
    rating: 4.7,
    address: "MG Road, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6033, 12.9716]
    },
    menu: [
      { name: "Grilled Salmon", price: 850, description: "With herbs and lemon" },
      { name: "Lamb Chops", price: 950, description: "Tender and juicy" },
      { name: "Lobster Thermidor", price: 1200, description: "Luxury seafood" },
      { name: "Tiramisu", price: 320, description: "Italian dessert" }
    ]
  },
  {
    name: "Mughal Darbar",
    cuisine: "Dinner",
    cost: "$$",
    rating: 4.6,
    address: "Chandni Chowk, New Delhi",
    location: {
      type: "Point",
      coordinates: [77.2304, 28.6506]
    },
    menu: [
      { name: "Mutton Rogan Josh", price: 480, description: "Kashmiri specialty" },
      { name: "Butter Chicken", price: 420, description: "Creamy tomato gravy" },
      { name: "Naan", price: 60, description: "Tandoor bread" },
      { name: "Gulab Jamun", price: 120, description: "Sweet dessert" }
    ]
  },

  // SNACKS PLACES
  {
    name: "Snack Attack",
    cuisine: "Snacks",
    cost: "$",
    rating: 4.1,
    address: "FC Road, Pune",
    location: {
      type: "Point",
      coordinates: [73.8394, 18.5314]
    },
    menu: [
      { name: "Vada Pav", price: 40, description: "Mumbai street food" },
      { name: "Pav Bhaji", price: 120, description: "Spicy vegetable mash" },
      { name: "Samosa", price: 30, description: "Crispy fried pastry" },
      { name: "Masala Chai", price: 20, description: "Indian spiced tea" }
    ]
  },
  {
    name: "Chaat Corner",
    cuisine: "Snacks",
    cost: "$",
    rating: 4.3,
    address: "Anna Salai, Chennai",
    location: {
      type: "Point",
      coordinates: [80.2619, 13.0569]
    },
    menu: [
      { name: "Pani Puri", price: 60, description: "Crispy shells with tangy water" },
      { name: "Bhel Puri", price: 80, description: "Puffed rice mix" },
      { name: "Dahi Vada", price: 90, description: "Lentil dumplings in yogurt" },
      { name: "Mirchi Bajji", price: 50, description: "Fried chili fritters" }
    ]
  },

  // DRINKS/BEVERAGES
  {
    name: "Brew & Bean",
    cuisine: "Drinks",
    cost: "$",
    rating: 4.4,
    address: "Koregaon Park, Pune",
    location: {
      type: "Point",
      coordinates: [73.8929, 18.5414]
    },
    menu: [
      { name: "Cappuccino", price: 150, description: "Classic coffee" },
      { name: "Cold Brew", price: 180, description: "Smooth and strong" },
      { name: "Fresh Lime Soda", price: 80, description: "Refreshing citrus" },
      { name: "Smoothie Bowl", price: 280, description: "Healthy and delicious" }
    ]
  },
  {
    name: "Tea Tales",
    cuisine: "Drinks",
    cost: "$",
    rating: 4.2,
    address: "Jayanagar, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.5833, 12.9250]
    },
    menu: [
      { name: "Masala Chai", price: 40, description: "Spiced tea" },
      { name: "Green Tea", price: 60, description: "Healthy antioxidants" },
      { name: "Iced Coffee", price: 120, description: "Chilled coffee" },
      { name: "Lemonade", price: 70, description: "Fresh lemon drink" }
    ]
  },

  // NIGHTLIFE SPOTS
  {
    name: "The Nightjar",
    cuisine: "Nightlife",
    cost: "$$",
    rating: 4.6,
    address: "HSR Layout, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6410, 12.9082]
    },
    menu: [
      { name: "Mojito", price: 350, description: "Classic cocktail" },
      { name: "Whiskey Sour", price: 450, description: "Smooth whiskey drink" },
      { name: "Nachos", price: 320, description: "Loaded with cheese" },
      { name: "Buffalo Wings", price: 380, description: "Spicy chicken wings" }
    ]
  },
  {
    name: "Skybar Lounge",
    cuisine: "Nightlife",
    cost: "$$",
    rating: 4.8,
    address: "Aerocity, New Delhi",
    location: {
      type: "Point",
      coordinates: [77.1025, 28.5562]
    },
    menu: [
      { name: "Cosmopolitan", price: 600, description: "Premium cocktail" },
      { name: "Beer Bucket", price: 800, description: "5 beers on ice" },
      { name: "Sushi Platter", price: 1200, description: "Assorted sushi" },
      { name: "Chocolate Fondue", price: 550, description: "Dessert for sharing" }
    ]
  },

  // EXISTING RESTAURANTS (keeping some variety)
  {
    name: "Pizza Hut",
    cuisine: "Italian",
    cost: "$",
    rating: 4.2,
    address: "Indiranagar, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6408, 12.9719]
    },
    menu: [
      { name: "Cheese Burst Pizza", price: 399, description: "Loaded cheese" },
      { name: "Garlic Bread", price: 159, description: "Classic garlic bread" }
    ]
  },
  {
    name: "Barbeque Nation",
    cuisine: "Indian",
    cost: "$$",
    rating: 4.5,
    address: "MG Road, Bangalore",
    location: {
      type: "Point",
      coordinates: [77.6033, 12.9716]
    },
    menu: [
      { name: "Unlimited BBQ", price: 899, description: "All you can eat BBQ" },
      { name: "Grilled Chicken", price: 449, description: "Tandoori style" }
    ]
  },
  {
    name: "Karim's",
    cuisine: "Mughlai",
    cost: "$",
    rating: 4.6,
    address: "Jama Masjid, New Delhi",
    location: {
      type: "Point",
      coordinates: [77.2334, 28.6506]
    },
    menu: [
      { name: "Mutton Korma", price: 350, description: "Rich and creamy" },
      { name: "Biryani", price: 300, description: "Authentic Mughlai" }
    ]
  },
  {
    name: "Vaishali Restaurant",
    cuisine: "South Indian",
    cost: "$",
    rating: 4.3,
    address: "FC Road, Pune",
    location: {
      type: "Point",
      coordinates: [73.8394, 18.5314]
    },
    menu: [
      { name: "Masala Dosa", price: 80, description: "Crispy dosa" },
      { name: "Filter Coffee", price: 40, description: "Traditional South Indian" }
    ]
  },
  {
    name: "Murugan Idli Shop",
    cuisine: "South Indian",
    cost: "$",
    rating: 4.4,
    address: "T Nagar, Chennai",
    location: {
      type: "Point",
      coordinates: [80.2337, 13.0389]
    },
    menu: [
      { name: "Idli", price: 50, description: "Soft and fluffy" },
      { name: "Sambar", price: 30, description: "Traditional lentil curry" }
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data (optional - remove if you want to keep existing data)
    await Restaurant.deleteMany({});
    console.log("Cleared existing restaurants");

    // Insert sample data
    await Restaurant.insertMany(sampleRestaurants);
    console.log(`Successfully seeded ${sampleRestaurants.length} restaurants`);

    // Verify
    const count = await Restaurant.countDocuments();
    console.log(`Total restaurants in database: ${count}`);

    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();