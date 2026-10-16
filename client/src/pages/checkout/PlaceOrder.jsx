import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import { useRazorpay } from "react-razorpay";

import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "@/services/paymentApi";
import {
    getPaymentMethod,
    getShippingAddress,
    getAppliedCoupon,
    clearCheckoutStorage,
} from "@/services/checkoutStorage";

import { previewOrder, createOrder } from "@/services/orderApi";
import { clearCart } from "@/store/cartSlice";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Location01Icon,
    PackageIcon,
    CreditCardIcon,
    DiscountTag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const PlaceOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { Razorpay } = useRazorpay();
    const userInfo = useSelector((state) => state.auth.userInfo);
    const cartItems = useSelector((state) => state.cart.cartItems);

    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [orderPreview, setOrderPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userInfo) {
            navigate("/login", {
                replace: true,
                state: {
                    from: "/placeorder",
                },
            });

            return;
        }

        if (!cartItems.length) {
            navigate("/cart", { replace: true });
            return;
        }

        const savedShipping = getShippingAddress();
        const savedPayment = getPaymentMethod();
        const savedCoupon = getAppliedCoupon();

        if (!savedShipping) {
            navigate("/shipping", { replace: true });
            return;
        }

        if (!savedPayment) {
            navigate("/payment", { replace: true });
            return;
        }

        setShippingAddress(savedShipping);
        setPaymentMethod(savedPayment);
        setAppliedCoupon(savedCoupon);
    }, [userInfo, cartItems.length, navigate]);
    useEffect(() => {
        const calculatePreview = async () => {
            if (!cartItems.length) return;

            try {
                setPreviewLoading(true);
                setError("");

                const appliedCoupon = getAppliedCoupon();

                const response = await previewOrder({
                    orderItems: cartItems.map((item) => ({
                        product: item.product,
                        qty: item.qty,
                    })),
                    couponCode:
                        appliedCoupon?.coupon?.code || null,
                });

                setOrderPreview(response);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to calculate your order total."
                );
            } finally {
                setPreviewLoading(false);
            }
        };

        calculatePreview();
    }, [cartItems]);
    const totalItems = cartItems.reduce(
        (total, item) => total + item.qty,
        0
    );

    const handlePlaceOrder = async () => {
        if (
            !shippingAddress ||
            !paymentMethod ||
            !cartItems.length ||
            !orderPreview
        ) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const orderItems = cartItems.map((item) => ({
                product: item.product,
                qty: item.qty,
            }));

            const couponCode =
                appliedCoupon?.coupon?.code || null;

            if (paymentMethod === "COD") {
                const orderData = {
                    orderItems,
                    shippingAddress,
                    paymentMethod: "COD",
                    couponCode,
                };

                const createdOrder =
                    await createOrder(orderData);

                dispatch(clearCart());
                clearCheckoutStorage();

                navigate(`/order/${createdOrder._id}`);

                return;
            }


            if (paymentMethod === "RAZORPAY") {

                const razorpayOrder =
                    await createRazorpayOrder({
                        orderItems,
                        couponCode,
                    });


                const options = {
                    key: import.meta.env
                        .VITE_RAZORPAY_KEY_ID,

                    amount: razorpayOrder.amount,

                    currency:
                        razorpayOrder.currency,

                    name: "Your Store",
                    description:
                        "Complete your purchase",

                    order_id:
                        razorpayOrder.id,

                    prefill: {
                        name:
                            userInfo?.name || "",
                        email:
                            userInfo?.email || "",
                    },

                    notes: {
                        couponCode:
                            razorpayOrder.couponCode || "",
                    },

                    theme: {
                        color: "#000000",
                    },

                    handler: async function (
                        response
                    ) {
                        try {
                            setLoading(true);
                            setError("");


                            const verification =
                                await verifyRazorpayPayment({
                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_signature:
                                        response.razorpay_signature,
                                });

                            const createdOrder =
                                await createOrder({
                                    orderItems,
                                    shippingAddress,
                                    paymentMethod: "Razorpay",
                                    couponCode,
                                    paymentResult: verification.paymentResult,
                                });

                            dispatch(clearCart());
                            clearCheckoutStorage();

                            navigate(
                                `/order/${createdOrder._id}`
                            );
                        } catch (err) {
                            console.error(
                                "Razorpay verification/order error:",
                                err
                            );

                            setError(
                                err.response?.data?.message ||
                                "Payment was successful, but we couldn't complete your order. Please contact support."
                            );
                        } finally {
                            setLoading(false);
                        }
                    },

                    modal: {
                        ondismiss: function () {
                            setLoading(false);

                            setError(
                                "Payment was cancelled. Your order has not been placed."
                            );
                        },
                    },
                };

                const razorpay =
                    new Razorpay(options);

                razorpay.open();

                return;
            }


            setError(
                "Please select a valid payment method."
            );
        } catch (err) {
            console.error(
                "Checkout error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to process your order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!userInfo || !cartItems.length || !shippingAddress) {
        return null;
    }

    return (
        <PageContainer className="py-8 sm:py-12">
            <div className="mx-auto max-w-6xl">
                <CheckoutSteps currentStep="placeorder" />

                <div className="mb-8">
                    <p className="text-sm font-medium text-primary">
                        Final step
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                        Review your order
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Check your details before placing the order.
                    </p>
                </div>

                {error && (
                    <Card className="mb-6 border-destructive/40">
                        <CardContent className="p-4">
                            <p className="text-sm text-destructive">
                                {error}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        {/* Shipping */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={Location01Icon}
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <CardTitle className="text-lg">
                                            Shipping address
                                        </CardTitle>

                                        <p className="text-sm text-muted-foreground">
                                            Where your order will be delivered
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/shipping")}
                                    disabled={loading}
                                >
                                    Edit
                                </Button>
                            </CardHeader>

                            <CardContent>
                                <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6">
                                    <p className="font-medium">
                                        {shippingAddress.address}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {shippingAddress.city}, {shippingAddress.state}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {shippingAddress.pincode}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {shippingAddress.country}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={CreditCardIcon}
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <CardTitle className="text-lg">
                                            Payment method
                                        </CardTitle>

                                        <p className="text-sm text-muted-foreground">
                                            Selected payment option
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/payment")}
                                    disabled={loading}
                                >
                                    Edit
                                </Button>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                    <div>
                                        <p className="font-medium">
                                            {paymentMethod === "COD"
                                                ? "Cash on Delivery"
                                                : "Razorpay"}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {paymentMethod === "COD"
                                                ? "Pay when your order arrives."
                                                : "Razorpay secure payment"}
                                        </p>
                                    </div>

                                    <Badge>
                                        {paymentMethod === "COD"
                                            ? "COD"
                                            : "Razorpay"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Coupon */}
                        {appliedCoupon?.coupon?.code && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                            <HugeiconsIcon
                                                icon={DiscountTag01Icon}
                                                size={18}
                                            />
                                        </div>

                                        <div>
                                            <CardTitle className="text-lg">
                                                Coupon applied
                                            </CardTitle>

                                            <p className="text-sm text-muted-foreground">
                                                Your coupon will be validated again by the server
                                                before the order is created.
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                        <div>
                                            <p className="font-medium">
                                                {appliedCoupon.coupon.code}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Discount applied at checkout
                                            </p>
                                        </div>

                                        <Badge variant="secondary">
                                            Applied
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Products */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={PackageIcon}
                                            size={18}
                                        />
                                    </div>

                                    <div>
                                        <CardTitle className="text-lg">
                                            Order items
                                        </CardTitle>

                                        <p className="text-sm text-muted-foreground">
                                            {totalItems}{" "}
                                            {totalItems === 1 ? "item" : "items"}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="divide-y">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.product}
                                            className="flex gap-4 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 font-medium">
                                                    {item.name}
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Quantity: {item.qty}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Final price is confirmed by the server.
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <Card className="h-fit lg:sticky lg:top-24">
                        <CardHeader>
                            <CardTitle>Order summary</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {previewLoading ? (
                                <p className="text-sm text-muted-foreground">
                                    Calculating your final total...
                                </p>
                            ) : orderPreview ? (
                                <>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Items
                                            </span>
                                            <span>{totalItems}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span>
                                                ₹{orderPreview.itemsPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        {orderPreview.couponDiscount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Coupon
                                                    {orderPreview.couponCode
                                                        ? ` (${orderPreview.couponCode})`
                                                        : ""}
                                                </span>

                                                <span className="font-medium text-green-600">
                                                    -₹
                                                    {orderPreview.couponDiscount.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Tax
                                            </span>

                                            <span>
                                                ₹{orderPreview.taxPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Shipping
                                            </span>

                                            <span>
                                                {orderPreview.shippingPrice === 0
                                                    ? "Free"
                                                    : `₹${orderPreview.shippingPrice.toLocaleString(
                                                        "en-IN"
                                                    )}`}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">
                                            Total
                                        </span>

                                        <span className="text-2xl font-bold">
                                            ₹{orderPreview.totalPrice.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-destructive">
                                    Unable to calculate your order total.
                                </p>
                            )}

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={handlePlaceOrder}
                                disabled={loading || previewLoading || !orderPreview}
                            >
                                {loading ? "Placing order..." : "Place Order"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default PlaceOrder;