// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// ==========================================
// 1. Create Order
// ==========================================
router.post("/create-order", async (req, res) => {
  try {
    const {
      deliveryInfo,
      cartItems,
      totalAmount,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validate that userId exists in deliveryInfo
    if (!deliveryInfo.userId) {
      console.error("Order creation failed: No userId provided");
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = new Order({
      orderId,
      deliveryInfo,
      items: cartItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentDetails,
      orderStatus: "confirmed"
    });

    await order.save();
    
    console.log("✅ Order created successfully:");
    console.log("   - Order Number:", orderId);
    console.log("   - User ID:", deliveryInfo.userId);
    console.log("   - Total Amount:", totalAmount);
    console.log("   - Items Count:", cartItems.length);
    
    res.json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
      orderNumber: orderId
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
});

// ==========================================
// 2. Get User Orders (Query Param Method)
// ==========================================
router.get("/user-orders", async (req, res) => {
  try {
    const { userId } = req.query; 
    
    console.log("📥 GET /user-orders request received");
    console.log("   - Query params:", req.query);
    console.log("   - User ID:", userId);
    
    // REQUIRE userId - don't return all orders if missing
    if (!userId) {
      console.warn("⚠️ No userId provided in query");
      return res.status(400).json({ 
        message: "User ID is required",
        orders: [] 
      });
    }

    console.log("🔍 Searching for orders with userId:", userId);

    // Find orders for this user
    const orders = await Order.find({ "deliveryInfo.userId": userId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    if (orders.length > 0) {
      console.log("   First order ID:", orders[0].orderId);
      console.log("   First order date:", orders[0].createdAt);
    }
    
    res.json({ orders });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ 
      message: "Error fetching user orders", 
      orders: [] 
    });
  }
});

// ==========================================
// 3. Get user orders by URL param (Alternative)
// ==========================================
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("📥 GET /user/:userId request");
    console.log("   - User ID:", userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const orders = await Order.find({ "deliveryInfo.userId": userId })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// ==========================================
// 4. Get all orders (ADMIN ONLY - should add auth middleware)
// ==========================================
router.get("/all", async (req, res) => {
  try {
    console.log("📥 GET /all orders request (ADMIN)");
    
    // TODO: Add admin authentication middleware here
    // For now, limit results to prevent data leaks
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100);
    
    console.log(`✅ Returning ${orders.length} recent orders`);
    
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// ==========================================
// 5. Get single order by ID
// ==========================================
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log("📥 GET single order request");
    console.log("   - Order ID:", orderId);
    
    // Prevent "user-orders" from being treated as an order ID
    if (orderId === 'user-orders' || orderId === 'all') {
      console.warn("⚠️ Invalid order ID:", orderId);
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      console.warn("⚠️ Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    
    console.log("✅ Order found:", order.orderId);
    console.log("   - User ID:", order.deliveryInfo.userId);
    
    // TODO: Add check to ensure user can only view their own orders
    // if (order.deliveryInfo.userId !== req.user._id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }
    
    res.json({ order });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

// ==========================================
// 6. Update order status (ADMIN/RESTAURANT)
// ==========================================
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    console.log("📥 PATCH order status request");
    console.log("   - Order ID:", orderId);
    console.log("   - New Status:", orderStatus);

    // Validate order status
    const validStatuses = ["confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
      console.warn("⚠️ Invalid order status:", orderStatus);
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      console.warn("⚠️ Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order status updated successfully");

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
});

// ==========================================
// 7. Cancel order (USER)
// ==========================================
router.patch("/:orderId/cancel", async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log("📥 PATCH cancel order request");
    console.log("   - Order ID:", orderId);
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.warn("⚠️ Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Don't allow cancelling delivered orders
    if (order.orderStatus === "delivered") {
      console.warn("⚠️ Cannot cancel delivered order:", orderId);
      return res.status(400).json({ 
        message: "Cannot cancel delivered orders" 
      });
    }

    // TODO: Add check to ensure user can only cancel their own orders
    // if (order.deliveryInfo.userId !== req.user._id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    console.log("✅ Order cancelled successfully");

    res.json({ 
      success: true, 
      message: "Order cancelled successfully", 
      order 
    });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
});

// ==========================================
// DEBUG: List all orders with userId info
// ==========================================
router.get("/debug/all-orders", async (req, res) => {
  try {
    console.log("📥 DEBUG: Fetching all orders");
    
    const orders = await Order.find()
      .select('orderId deliveryInfo.userId deliveryInfo.name createdAt orderStatus')
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`Found ${orders.length} orders in database`);
    
    const orderSummary = orders.map(o => ({
      orderId: o.orderId,
      userId: o.deliveryInfo.userId,
      userName: o.deliveryInfo.name,
      status: o.orderStatus,
      date: o.createdAt
    }));
    
    console.table(orderSummary);
    
    res.json({
      totalOrders: orders.length,
      orders: orderSummary
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;