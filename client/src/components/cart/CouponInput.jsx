import React, { useEffect, useState } from "react";
import { validateCoupon } from "@/services/couponApi";
import {
    getAppliedCoupon,
    removeAppliedCoupon,
    saveAppliedCoupon,
} from "@/services/checkoutStorage";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    DiscountTag01Icon,
    Cancel01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const CouponInput = ({
    subtotal = 0,
    onCouponChange,
}) => {
    const [code, setCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const savedCoupon = getAppliedCoupon();

        if (savedCoupon) {
            setAppliedCoupon(savedCoupon);
            setCode(savedCoupon.coupon?.code || "");
        }
    }, []);

    const handleApply = async () => {
        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
            setError("Please enter a coupon code.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await validateCoupon({
                code: normalizedCode,
                orderAmount: subtotal,
            });

            saveAppliedCoupon(response);
            setAppliedCoupon(response);
            setCode(response.coupon?.code || normalizedCode);

            onCouponChange?.();
        } catch (err) {
            console.error("Coupon validation failed:", err);

            removeAppliedCoupon();
            setAppliedCoupon(null);

            setError(
                err.response?.data?.message ||
                "Invalid or expired coupon."
            );
        } finally {
            setLoading(false);
        }
    };
    const handleRemove = () => {
        removeAppliedCoupon();
        setAppliedCoupon(null);
        setCode("");
        setError("");

        onCouponChange?.();
    };
    if (appliedCoupon?.coupon) {
        const coupon = appliedCoupon.coupon;

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={DiscountTag01Icon}
                        size={18}
                    />

                    <p className="font-medium">
                        Coupon
                    </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <HugeiconsIcon
                                icon={Tick02Icon}
                                size={16}
                                className="text-primary"
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {coupon.code}
                                </span>

                                <Badge variant="secondary">
                                    Applied
                                </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Coupon will be revalidated when the order is placed.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        disabled={loading}
                    >
                        <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={18}
                        />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <HugeiconsIcon
                    icon={DiscountTag01Icon}
                    size={18}
                />

                <p className="font-medium">
                    Have a coupon?
                </p>
            </div>

            <div className="flex gap-2">
                <Input
                    value={code}
                    onChange={(event) => {
                        setCode(event.target.value.toUpperCase());
                        setError("");
                    }}
                    placeholder="Enter coupon code"
                    disabled={loading}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handleApply();
                        }
                    }}
                />

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                >
                    {loading ? "Checking..." : "Apply"}
                </Button>
            </div>

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
};

export default CouponInput;