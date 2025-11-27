// routes/cart.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// =========================
// GET /api/cart/:userId - Get user's cart
// =========================
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Getting cart for user:", userId);
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create new empty cart if doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
      console.log("Created new cart for user:", userId);
    }
    
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

// =========================
// POST /api/cart/:userId/items - Add item to cart
// =========================
router.post("/:userId/items", async (req, res) => {
  try {
    const { userId } = req.params;
    const { menuItem, quantity, restaurant } = req.body;

    console.log("Adding item to cart for user:", userId);
    console.log("Item details:", { menuItem, quantity, restaurant });

    // Validate required fields
    if (!menuItem || !menuItem.name || !menuItem.price) {
      return res.status(400).json({ message: "Menu item details are required" });
    }

    if (!restaurant || !restaurant.name) {
      return res.status(400).json({ message: "Restaurant details are required" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with first item
      cart = new Cart({
        userId,
        items: [{
          menuItem,
          quantity: quantity || 1,
          restaurant
        }]
      });
      console.log("Created new cart with item");
    } else {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.menuItem.name === menuItem.name && 
                item.restaurant.name === restaurant.name
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += (quantity || 1);
        console.log("Updated quantity for existing item");
      } else {
        // Add new item
        cart.items.push({
          menuItem,
          quantity: quantity || 1,
          restaurant
        });
        console.log("Added new item to cart");
      }
    }

    await cart.save();
    console.log("Cart saved successfully. Total items:", cart.items.length);
    res.json(cart);
  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ message: "Error adding item to cart", error: err.message });
  }
});

// =========================
// PUT /api/cart/:userId/items/:itemId - Update item quantity
// =========================
router.put("/:userId/items/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    console.log("Updating item quantity:", { userId, itemId, quantity });

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    console.log("Item quantity updated successfully");
    res.json(cart);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ message: "Error updating cart item", error: err.message });
  }
});

// =========================
// DELETE /api/cart/:userId/items/:itemId - Remove item from cart
// =========================
router.delete("/:userId/items/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    console.log("Removing item from cart:", { userId, itemId });

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemsBefore = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    if (cart.items.length === itemsBefore) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();

    console.log("Item removed successfully. Remaining items:", cart.items.length);
    res.json(cart);
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ message: "Error removing item from cart", error: err.message });
  }
});

// =========================
// DELETE /api/cart/:userId - Clear entire cart
// =========================
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Clearing cart for user:", userId);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    console.log("Cart cleared successfully");
    res.json(cart);
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Error clearing cart", error: err.message });
  }
});

module.exports = router;