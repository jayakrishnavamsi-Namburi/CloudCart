import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * @desc    Get current user's cart with populated product details
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // Filter out items whose product might have been deleted from DB
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add an item to the user's cart or increment quantity
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const currentQty = cart.items[itemIndex].quantity;
      const targetQty = currentQty + qty;

      if (targetQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} more. Total in cart (${targetQty}) exceeds available stock (${product.stock})`
        });
      }

      cart.items[itemIndex].quantity = targetQty;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity (${qty}) exceeds available stock (${product.stock})`
        });
      }

      cart.items.push({
        product: productId,
        quantity: qty
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity for a specific item in cart
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Search by cart item _id or product ID
    const cartItem = cart.items.find(
      (item) =>
        item._id.toString() === itemId || item.product.toString() === itemId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Verify stock availability
    const product = await Product.findById(cartItem.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product associated with this cart item no longer exists'
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available stock (${product.stock})`
      });
    }

    cartItem.quantity = qty;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove an item from user cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        item._id.toString() !== itemId && item.product.toString() !== itemId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all items from user cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};
