import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";

const addOrderItems = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      paymentResult,
    } = req.body;

    const isRazorpayPayment =
      paymentMethod === 'Razorpay' &&
      paymentResult?.razorpayOrderId &&
      paymentResult?.razorpayPaymentId &&
      paymentResult?.razorpaySignature;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const productIds = orderItems.map((item) => item.product);
    const uniqueProductIds = new Set(productIds.map((id) => id.toString()));

    if (uniqueProductIds.size !== productIds.length) {
      return res.status(400).json({
        message: 'Duplicate products are not allowed in an order',
      });
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      if (products.length !== productIds.length) {
        throw new Error('One or more products no longer exist');
      }

      const calculatedOrderItems = [];
      let itemsPrice = 0;

      for (const requestedItem of orderItems) {
        const product = products.find(
          (item) => item._id.toString() === requestedItem.product.toString()
        );

        if (!product) {
          throw new Error('Product not found');
        }

        const qty = Number(requestedItem.qty);

        if (!Number.isInteger(qty) || qty <= 0) {
          throw new Error(`Invalid quantity for ${product.name}`);
        }

        if (product.countInStock < qty) {
          throw new Error(`${product.name} does not have enough stock`);
        }

        const itemTotal = product.price * qty;
        itemsPrice += itemTotal;

        calculatedOrderItems.push({
          name: product.name,
          qty,
          image: product.image,
          price: product.price,
          product: product._id,
        });
      }

      itemsPrice = Number(itemsPrice.toFixed(2));

      let appliedCouponCode = null;
      let couponDiscount = 0;
      let coupon = null;

      if (couponCode?.trim()) {
        const normalizedCouponCode = couponCode.trim().toUpperCase();

        coupon = await Coupon.findOne({
          code: normalizedCouponCode,
        }).session(session);

        if (!coupon) {
          throw new Error('Invalid coupon code');
        }

        const now = new Date();

        if (!coupon.isActive) {
          throw new Error('This coupon is inactive');
        }

        if (now < coupon.startDate) {
          throw new Error('This coupon is not active yet');
        }

        if (now > coupon.expiryDate) {
          throw new Error('This coupon has expired');
        }

        if (
          coupon.usageLimit !== null &&
          coupon.usageCount >= coupon.usageLimit
        ) {
          throw new Error('This coupon has reached its usage limit');
        }

        if (itemsPrice < coupon.minimumOrderValue) {
          throw new Error(
            `Minimum order value is ₹${coupon.minimumOrderValue}`
          );
        }

        // Calculate discount
        if (coupon.discountType === 'percentage') {
          couponDiscount = (itemsPrice * coupon.discountValue) / 100;

          if (
            coupon.maximumDiscount !== null &&
            couponDiscount > coupon.maximumDiscount
          ) {
            couponDiscount = coupon.maximumDiscount;
          }
        } else {
          couponDiscount = coupon.discountValue;
        }

        couponDiscount = Math.min(couponDiscount, itemsPrice);
        couponDiscount = Number(couponDiscount.toFixed(2));

        appliedCouponCode = coupon.code;
      }

      const TAX_RATE = 0.18;
      const taxableAmount = Math.max(itemsPrice - couponDiscount, 0);
      const taxPrice = Number((taxableAmount * TAX_RATE).toFixed(2));

      const shippingPrice = 0;

      const totalPrice = Number(
        (taxableAmount + shippingPrice + taxPrice).toFixed(2)
      );

      for (const requestedItem of orderItems) {
        const qty = Number(requestedItem.qty);

        const stockUpdate = await Product.updateOne(
          {
            _id: requestedItem.product,
            countInStock: { $gte: qty },
          },
          { $inc: { countInStock: -qty } },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new Error(
            'One or more products no longer have enough stock'
          );
        }
      }

      if (appliedCouponCode) {
        const couponFilter = { code: appliedCouponCode };

        if (coupon.usageLimit !== null) {
          couponFilter.usageCount = { $lt: coupon.usageLimit };
        }

        const couponUpdate = await Coupon.updateOne(
          couponFilter,
          { $inc: { usageCount: 1 } },
          { session }
        );

        if (couponUpdate.modifiedCount !== 1) {
          throw new Error('This coupon has reached its usage limit');
        }
      }

      const order = new Order({
        orderItems: calculatedOrderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        couponCode: appliedCouponCode,
        couponDiscount,
        totalPrice,
        isPaid: Boolean(isRazorpayPayment),
        paidAt: isRazorpayPayment ? new Date() : undefined,
        paymentResult: isRazorpayPayment
          ? {
              razorpayOrderId: paymentResult.razorpayOrderId,
              razorpayPaymentId: paymentResult.razorpayPaymentId,
              razorpaySignature: paymentResult.razorpaySignature,
            }
          : undefined,
      });

      createdOrder = await order.save({ session });
    });

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in addOrderItems:', error.message);

    // Surface business-logic errors as 400; unexpected errors as 500
    const isBusinessError = error.name !== 'MongoError' && error.message;

    return res.status(isBusinessError ? 400 : 500).json({
      message: error.message || 'Failed to create order',
    });
  } finally {
    await session.endSession();
  }
};


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'id name email'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner =
      order.user._id.toString() === req.user._id.toString();

    if (!req.user.isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'Not authorized to view this order',
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error.message);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getMyOrders:', error.message);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};


const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name')
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error.message);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
};


const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderToDelivered:', error.message);
    return res.status(500).json({ message: 'Failed to update order' });
  }
};


const calculateCouponDiscount = (coupon, subtotal) => {
  let discount;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;

    if (coupon.maximumDiscount !== null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return Math.min(discount, subtotal);
};

export const previewOrder = async (req, res) => {
  try {
    const { orderItems = [], couponCode = null } = req.body;

    if (!orderItems.length) {
      return res.status(400).json({ message: 'No order items' });
    }

    const productIds = orderItems.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = products.find(
        (product) => product._id.toString() === item.product
      );

      if (!product) {
        return res.status(404).json({
          message: 'One or more products were not found',
        });
      }

      const qty = Number(item.qty);

      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Invalid product quantity' });
      }

      if (qty > product.countInStock) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock`,
        });
      }

      itemsPrice += product.price * qty;
    }

    itemsPrice = Number(itemsPrice.toFixed(2));

    let couponDiscount = 0;
    let validatedCoupon = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();

      const coupon = await Coupon.findOne({ code: normalizedCode });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      const now = new Date();

      if (!coupon.isActive) {
        return res.status(400).json({ message: 'This coupon is inactive' });
      }

      if (now < coupon.startDate) {
        return res.status(400).json({ message: 'This coupon is not active yet' });
      }

      if (now > coupon.expiryDate) {
        return res.status(400).json({ message: 'This coupon has expired' });
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message: 'This coupon has reached its usage limit',
        });
      }

      if (itemsPrice < coupon.minimumOrderValue) {
        return res.status(400).json({
          message: `Minimum order value for this coupon is ₹${coupon.minimumOrderValue}`,
        });
      }

      couponDiscount = calculateCouponDiscount(coupon, itemsPrice);

      validatedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    const TAX_RATE = 0.18;
    const shippingPrice = 0;

    const taxableAmount = Math.max(itemsPrice - couponDiscount, 0);
    const taxPrice = Number((taxableAmount * TAX_RATE).toFixed(2));

    const totalPrice = Number(
      (taxableAmount + taxPrice + shippingPrice).toFixed(2)
    );

    return res.status(200).json({
      itemsPrice,
      couponCode: validatedCoupon?.code || null,
      couponDiscount,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  } catch (error) {
    console.error('Error in previewOrder:', error.message);
    return res.status(500).json({ message: 'Unable to calculate order total' });
  }
};

export {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
};