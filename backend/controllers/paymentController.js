import razorpay from "../config/razorpay.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import crypto from "crypto";


const TAX_RATE = 0.18;




export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing Razorpay payment details",
      });
    }

    // Verify the signature using the server secret.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();

    let receivedSignature;

    try {
      receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
      );
    } catch {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        expectedSignature,
        receivedSignature
      )
    ) {
      return res.status(400).json({
        message: "Invalid Razorpay payment signature",
      });
    }

    // Verify the actual payment directly with Razorpay.
    const [gatewayOrder, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    if (
      payment.order_id !== gatewayOrder.id ||
      payment.order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        message: "Payment does not match the Razorpay order",
      });
    }

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return res.status(400).json({
        message: "Payment has not been captured",
      });
    }

    if (
      payment.amount !== gatewayOrder.amount ||
      payment.currency !== gatewayOrder.currency ||
      gatewayOrder.currency !== "INR"
    ) {
      return res.status(400).json({
        message: "Payment amount or currency does not match",
      });
    }

    // Confirm that this gateway order belongs to the logged-in user.
    if (
      gatewayOrder.notes?.userId !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "This payment belongs to another user",
      });
    }

    return res.json({
      success: true,
      message: "Razorpay payment verified successfully",
      paymentResult: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);

    return res.status(500).json({
      message: "Unable to verify Razorpay payment",
    });
  }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const {
            orderItems = [],
            couponCode = null,
        } = req.body;

        // -----------------------------------------
        // Basic validation
        // -----------------------------------------

        if (
            !Array.isArray(orderItems) ||
            orderItems.length === 0
        ) {
            return res.status(400).json({
                message: "No order items",
            });
        }

        // -----------------------------------------
        // Fetch current products from DB
        // -----------------------------------------

        const productIds = orderItems.map(
            (item) => item.product
        );

        const products = await Product.find({
            _id: { $in: productIds },
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                message:
                    "One or more products no longer exist",
            });
        }

        // -----------------------------------------
        // Calculate subtotal from DB prices
        // -----------------------------------------

        let itemsPrice = 0;

        for (const item of orderItems) {
            const product = products.find(
                (product) =>
                    product._id.toString() ===
                    item.product.toString()
            );

            if (!product) {
                return res.status(400).json({
                    message: "Product not found",
                });
            }

            const qty = Number(item.qty);

            if (
                !Number.isInteger(qty) ||
                qty <= 0
            ) {
                return res.status(400).json({
                    message: `Invalid quantity for ${product.name}`,
                });
            }

            if (
                qty > product.countInStock
            ) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`,
                });
            }

            itemsPrice +=
                product.price * qty;
        }

        itemsPrice = Number(
            itemsPrice.toFixed(2)
        );

        // -----------------------------------------
        // Coupon
        // -----------------------------------------

        let couponDiscount = 0;
        let appliedCouponCode = null;

        if (
            couponCode &&
            couponCode.trim()
        ) {
            const normalizedCode =
                couponCode
                    .trim()
                    .toUpperCase();

            const coupon =
                await Coupon.findOne({
                    code: normalizedCode,
                });

            if (!coupon) {
                return res.status(400).json({
                    message:
                        "Invalid coupon code",
                });
            }

            const now = new Date();

            if (!coupon.isActive) {
                return res.status(400).json({
                    message:
                        "This coupon is inactive",
                });
            }

            if (now < coupon.startDate) {
                return res.status(400).json({
                    message:
                        "This coupon is not active yet",
                });
            }

            if (now > coupon.expiryDate) {
                return res.status(400).json({
                    message:
                        "This coupon has expired",
                });
            }

            if (
                coupon.usageLimit !== null &&
                coupon.usageCount >=
                    coupon.usageLimit
            ) {
                return res.status(400).json({
                    message:
                        "This coupon has reached its usage limit",
                });
            }

            if (
                itemsPrice <
                coupon.minimumOrderValue
            ) {
                return res.status(400).json({
                    message: `Minimum order value is ₹${coupon.minimumOrderValue}`,
                });
            }

            if (
                coupon.discountType ===
                "percentage"
            ) {
                couponDiscount =
                    (itemsPrice *
                        coupon.discountValue) /
                    100;

                if (
                    coupon.maximumDiscount !==
                        null &&
                    couponDiscount >
                        coupon.maximumDiscount
                ) {
                    couponDiscount =
                        coupon.maximumDiscount;
                }
            } else {
                couponDiscount =
                    coupon.discountValue;
            }

            couponDiscount = Math.min(
                couponDiscount,
                itemsPrice
            );

            couponDiscount = Number(
                couponDiscount.toFixed(2)
            );

            appliedCouponCode =
                coupon.code;
        }

        // -----------------------------------------
        // Tax + shipping
        // -----------------------------------------

        const shippingPrice = 0;

        const taxableAmount = Math.max(
            itemsPrice - couponDiscount,
            0
        );

        const taxPrice = Number(
            (
                taxableAmount *
                TAX_RATE
            ).toFixed(2)
        );

        const totalPrice = Number(
            (
                taxableAmount +
                taxPrice +
                shippingPrice
            ).toFixed(2)
        );

        if (totalPrice <= 0) {
            return res.status(400).json({
                message:
                    "Invalid payment amount",
            });
        }

        // -----------------------------------------
        // Create Razorpay order
        // -----------------------------------------

        const razorpayOrder =
            await razorpay.orders.create({
                amount: Math.round(
                    totalPrice * 100
                ),
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                notes: {
                    userId:
                        req.user._id.toString(),
                    couponCode:
                        appliedCouponCode || "",
                },
            });

        // -----------------------------------------
        // Return gateway data + server total
        // -----------------------------------------

        res.status(201).json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency:
                razorpayOrder.currency,

            // Useful for frontend display.
            // This is still calculated by the server.
            totalPrice,

            itemsPrice,
            couponDiscount,
            shippingPrice,
            taxPrice,
            couponCode:
                appliedCouponCode,
        });
    } catch (error) {
        console.error(
            "RAZORPAY CREATE ORDER ERROR:",
            error
        );

        res.status(500).json({
            message:
                error.error?.description ||
                error.message ||
                "Unable to create Razorpay order",
        });
    }
};