import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CouponForm from "../../components/admin/CouponForm";

import { getCoupon } from "../../services/couponApi";

const EditCoupon = () => {
    const { id } = useParams();

    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCoupon = async () => {
            try {
                const data = await getCoupon(id);
                setCoupon(data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Failed to load coupon."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCoupon();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading coupon...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <p className="text-sm text-destructive">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <CouponForm
            mode="edit"
            coupon={coupon}
        />
    );
};

export default EditCoupon;