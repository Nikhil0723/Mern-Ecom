import Coupon from "../models/couponModel.js";

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });

    return res.status(200).json(coupons);
  } catch (error) {
    console.error('Error in getCoupons:', error.message);
    return res.status(500).json({ message: 'Failed to fetch coupons' });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json(coupon);
  } catch (error) {
    console.error('Error in getCouponById:', error.message);
    return res.status(500).json({ message: 'Failed to fetch coupon' });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      usageLimit,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    // Validate required fields
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    if (!discountType) {
      return res.status(400).json({ message: 'Discount type is required' });
    }

    if (discountValue === undefined) {
      return res.status(400).json({ message: 'Discount value is required' });
    }

    if (!startDate || !expiryDate) {
      return res.status(400).json({
        message: 'Start date and expiry date are required',
      });
    }

    // Validate discount type
    const validDiscountTypes = ['percentage', 'fixed'];

    if (!validDiscountTypes.includes(discountType)) {
      return res.status(400).json({ message: 'Invalid discount type' });
    }

    // Validate discount value
    const numericDiscountValue = Number(discountValue);

    if (numericDiscountValue <= 0) {
      return res.status(400).json({
        message: 'Discount value must be greater than 0',
      });
    }

    if (discountType === 'percentage' && numericDiscountValue > 100) {
      return res.status(400).json({
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    // Validate optional maximum discount
    const hasMaximumDiscount =
      maximumDiscount !== null &&
      maximumDiscount !== undefined &&
      maximumDiscount !== '';

    if (hasMaximumDiscount && Number(maximumDiscount) < 0) {
      return res.status(400).json({
        message: 'Maximum discount cannot be negative',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(expiry.getTime())) {
      return res.status(400).json({ message: 'Invalid coupon dates' });
    }

    if (expiry <= start) {
      return res.status(400).json({
        message: 'Expiry date must be after the start date',
      });
    }

    // Check for duplicate code
    const normalizedCode = code.trim().toUpperCase();

    const existingCoupon = await Coupon.findOne({ code: normalizedCode });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: normalizedCode,
      discountType,
      discountValue: numericDiscountValue,
      minimumOrderValue: Number(minimumOrderValue) || 0,
      maximumDiscount: hasMaximumDiscount ? Number(maximumDiscount) : null,
      usageLimit:
        usageLimit === '' || usageLimit === null || usageLimit === undefined
          ? null
          : Number(usageLimit),
      startDate: start,
      expiryDate: expiry,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json(coupon);
  } catch (error) {
    console.error('Error in createCoupon:', error.message);
    return res.status(500).json({ message: 'Failed to create coupon' });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const {
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      usageLimit,
      startDate,
      expiryDate,
      isActive,
    } = req.body;

    // Resolve next code
    const normalizedCode =
      code !== undefined ? code.trim().toUpperCase() : coupon.code;

    const duplicateCoupon = await Coupon.findOne({
      code: normalizedCode,
      _id: { $ne: coupon._id },
    });

    if (duplicateCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Resolve next discount type and value
    const nextDiscountType = discountType || coupon.discountType;
    const nextDiscountValue =
      discountValue !== undefined ? Number(discountValue) : coupon.discountValue;

    const validDiscountTypes = ['percentage', 'fixed'];

    if (!validDiscountTypes.includes(nextDiscountType)) {
      return res.status(400).json({ message: 'Invalid discount type' });
    }

    if (nextDiscountValue <= 0) {
      return res.status(400).json({
        message: 'Discount value must be greater than 0',
      });
    }

    if (nextDiscountType === 'percentage' && nextDiscountValue > 100) {
      return res.status(400).json({
        message: 'Percentage discount cannot exceed 100%',
      });
    }

    // Validate optional maximum discount
    if (maximumDiscount !== undefined && maximumDiscount !== '' && maximumDiscount !== null) {
      if (Number(maximumDiscount) < 0) {
        return res.status(400).json({
          message: 'Maximum discount cannot be negative',
        });
      }
    }

    // Resolve next dates
    const nextStartDate = startDate ? new Date(startDate) : coupon.startDate;
    const nextExpiryDate = expiryDate ? new Date(expiryDate) : coupon.expiryDate;

    if (
      Number.isNaN(nextStartDate.getTime()) ||
      Number.isNaN(nextExpiryDate.getTime())
    ) {
      return res.status(400).json({ message: 'Invalid coupon dates' });
    }

    if (nextExpiryDate <= nextStartDate) {
      return res.status(400).json({
        message: 'Expiry date must be after the start date',
      });
    }

    // Apply updates
    coupon.code = normalizedCode;
    coupon.discountType = nextDiscountType;
    coupon.discountValue = nextDiscountValue;
    coupon.startDate = nextStartDate;
    coupon.expiryDate = nextExpiryDate;

    if (minimumOrderValue !== undefined) {
      coupon.minimumOrderValue = Number(minimumOrderValue) || 0;
    }

    if (maximumDiscount !== undefined) {
      coupon.maximumDiscount =
        maximumDiscount === '' || maximumDiscount === null
          ? null
          : Number(maximumDiscount);
    }

    if (usageLimit !== undefined) {
      coupon.usageLimit =
        usageLimit === '' || usageLimit === null
          ? null
          : Number(usageLimit);
    }

    if (isActive !== undefined) {
      coupon.isActive = Boolean(isActive);
    }

    const updatedCoupon = await coupon.save();

    return res.status(200).json(updatedCoupon);
  } catch (error) {
    console.error('Error in updateCoupon:', error.message);
    return res.status(500).json({ message: 'Failed to update coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();

    return res.status(200).json({ message: 'Coupon removed successfully' });
  } catch (error) {
    console.error('Error in deleteCoupon:', error.message);
    return res.status(500).json({ message: 'Failed to delete coupon' });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const amount = Number(orderAmount);

    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    const normalizedCode = code.trim().toUpperCase();

    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check active window
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

    // Check usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: 'This coupon has reached its usage limit',
      });
    }

    // Check minimum order value
    if (amount < coupon.minimumOrderValue) {
      return res.status(400).json({
        message: `Minimum order value is ₹${coupon.minimumOrderValue}`,
      });
    }

    // Calculate discount
    let discount;

    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;

      if (
        coupon.maximumDiscount !== null &&
        discount > coupon.maximumDiscount
      ) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Discount can't exceed the order amount
    discount = Math.min(discount, amount);
    discount = Number(discount.toFixed(2));

    const finalAmount = Number((amount - discount).toFixed(2));

    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error('Error in validateCoupon:', error.message);
    return res.status(500).json({ message: 'Failed to validate coupon' });
  }
};