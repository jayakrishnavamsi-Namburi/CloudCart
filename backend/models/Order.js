import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Item price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required']
    }
  },
  { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, 'Shipping street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Shipping city is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Shipping state is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Shipping zip code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Shipping country is required'],
      trim: true
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user']
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, 'Shipping address is required']
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status'
      },
      default: 'processing'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for order history queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
