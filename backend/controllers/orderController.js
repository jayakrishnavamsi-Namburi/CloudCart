import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Create a new order from current user's cart items
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentStatus = 'pending' } = req.body;

    // Fetch user cart with populated product data
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order: Cart is empty'
      });
    }

    // Validate that each product exists and has sufficient stock
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'One or more items in your cart are no longer available. Please update your cart.'
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}". Available stock: ${item.product.stock}`
        });
      }
    }

    // Snapshot product details into order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl
    }));

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order document
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      shippingAddress,
      paymentStatus,
      orderStatus: 'processing'
    });

    // Decrease stock for ordered products
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's order history
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID (own order or Admin)
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization: must be the order owner or an admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders across system
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status and optional payment status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid orderStatus. Must be one of: ${validOrderStatuses.join(', ')}`
      });
    }

    const validPaymentStatuses = ['pending', 'completed', 'failed'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If order was not cancelled previously and is now being cancelled, restore product stock
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order overview statistics
 * @route   GET /api/orders/stats
 * @access  Private/Admin
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue from non-failed orders
    const revenueAggregation = await Order.aggregate([
      { $match: { paymentStatus: { $ne: 'failed' }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0
      ? Math.round(revenueAggregation[0].totalRevenue * 100) / 100
      : 0;

    // Group orders count by status
    const ordersByStatusRaw = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const ordersByStatus = {
      processing: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersByStatusRaw.forEach((item) => {
      if (item._id && ordersByStatus.hasOwnProperty(item._id)) {
        ordersByStatus[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        ordersByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
