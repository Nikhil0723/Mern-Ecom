import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"],
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

       minimumOrderValue: {
    type: Number,
    default: 0,
    min: 0,
},

maximumDiscount: {
    type: Number,
    default: null,
    min: 0,
},

usageLimit: {
    type: Number,
    default: null,
    min: 1,
    validate: {
        validator: Number.isInteger,
        message: "Usage limit must be a whole number",
    },
},

usageCount: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "Usage count must be a whole number",
    },
},

        startDate: {
            type: Date,
            required: true,
        },

        expiryDate: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;