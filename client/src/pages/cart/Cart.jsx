import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Delete02Icon,
    MinusSignIcon,
    PlusSignIcon,
    ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    removeFromCart,
    updateCartQuantity,
} from "@/store/cartSlice";

import CouponInput from "@/components/cart/CouponInput";

import { previewOrder } from "@/services/orderApi";
import { getAppliedCoupon } from "@/services/checkoutStorage";

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cartItems = useSelector(
        (state) => state.cart.cartItems
    );

    const [orderPreview, setOrderPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");

    const itemCount = cartItems.reduce(
        (total, item) => total + item.qty,
        0
    );

    const localSubtotal = cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
    );

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(price || 0);
    };

    const calculatePreview = async () => {
        if (!cartItems.length) {
            setOrderPreview(null);
            return;
        }

        try {
            setPreviewLoading(true);
            setPreviewError("");

            const appliedCoupon = getAppliedCoupon();

            const response = await previewOrder({
                orderItems: cartItems.map((item) => ({
                    product: item.product,
                    qty: item.qty,
                })),
                couponCode: appliedCoupon?.coupon?.code || null,
            });

            setOrderPreview(response);
        } catch (err) {
            console.error(
                "Failed to calculate order preview:",
                err
            );

            setOrderPreview(null);

            setPreviewError(
                err.response?.data?.message ||
                "Unable to calculate your order total."
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    useEffect(() => {
        calculatePreview();
    }, [cartItems]);

    const handleQuantityChange = (
        productId,
        qty,
        stock
    ) => {
        const nextQuantity = Math.min(
            Math.max(qty, 1),
            stock
        );

        dispatch(
            updateCartQuantity({
                productId,
                qty: nextQuantity,
            })
        );
    };

    const handleRemove = (productId) => {
        dispatch(removeFromCart(productId));
    };

    const handleCouponChange = () => {
        calculatePreview();
    };

    const handleCheckout = () => {
        navigate("/shipping");
    };

    if (cartItems.length === 0) {
        return (
            <div className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-lg p-8 text-center sm:p-10">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <HugeiconsIcon
                            icon={ShoppingCart01Icon}
                            size={30}
                            className="text-muted-foreground"
                        />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold">
                        Your cart is empty
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Looks like you haven't added anything to your
                        cart yet.
                    </p>

                    <Button asChild className="mt-6 p-4" size="lg">
                        <Link to="/shop" className="flex gap-1">
                            Continue Shopping
                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                size={18}
                            />
                        </Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="py-8 sm:py-10">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="link"
                        asChild
                        size="lg"
                        className="mb-4 -ml-2 border-none"
                    >
                        <Link to="/shop">
                            Continue Shopping
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Your Cart
                        </h1>

                        <Badge variant="secondary">
                            {itemCount}{" "}
                            {itemCount === 1 ? "item" : "items"}
                        </Badge>
                    </div>

                    <p className="mt-2 text-muted-foreground">
                        Review your items before continuing to checkout.
                    </p>
                </div>

                {/* Main layout */}
                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

                    {/* Cart items */}
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <Card
                                key={item.product}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">

                                    <Link
                                        to={`/product/${item.product}`}
                                        className="shrink-0"
                                    >
                                        <div className="h-32 w-full overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/product/${item.product}`}
                                                    className="line-clamp-2 font-semibold hover:underline"
                                                >
                                                    {item.name}
                                                </Link>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {formatPrice(item.price)} each
                                                </p>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    handleRemove(item.product)
                                                }
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete02Icon}
                                                    size={18}
                                                />
                                            </Button>
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">

                                            {/* Quantity */}
                                            <div>
                                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                    Quantity
                                                </p>

                                                <div className="flex h-10 items-center rounded-md border">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-none border-none"
                                                        disabled={item.qty <= 1}
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.product,
                                                                item.qty - 1,
                                                                item.countInStock
                                                            )
                                                        }
                                                    >
                                                        <HugeiconsIcon
                                                            icon={MinusSignIcon}
                                                            size={16}
                                                        />
                                                    </Button>

                                                    <span className="w-10 text-center text-sm font-medium">
                                                        {item.qty}
                                                    </span>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-none border-none"
                                                        disabled={
                                                            item.qty >=
                                                            item.countInStock
                                                        }
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                item.product,
                                                                item.qty + 1,
                                                                item.countInStock
                                                            )
                                                        }
                                                    >
                                                        <HugeiconsIcon
                                                            icon={PlusSignIcon}
                                                            size={16}
                                                        />
                                                    </Button>
                                                </div>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {item.countInStock} available
                                                </p>
                                            </div>

                                            {/* Item total */}
                                            <div className="text-right">
                                                <p className="text-lg font-semibold">
                                                    {formatPrice(
                                                        item.price * item.qty
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <aside>
                        <Card className="sticky top-24 p-6">
                            <h2 className="text-lg font-semibold">
                                Order Summary
                            </h2>

                            <div className="mt-5">
                                <CouponInput
                                    subtotal={localSubtotal}
                                    onCouponChange={handleCouponChange}
                                />
                            </div>

                            <Separator className="my-5" />

                            {previewError && (
                                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                                    <p className="text-sm text-destructive">
                                        {previewError}
                                    </p>
                                </div>
                            )}

                            {previewLoading && (
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Calculating your order total...
                                </p>
                            )}

                            <div className="space-y-3">

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                        Items
                                    </span>

                                    <span>{itemCount}</span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>

                                    <span>
                                        {formatPrice(
                                            orderPreview?.itemsPrice ??
                                            localSubtotal
                                        )}
                                    </span>
                                </div>

                                {orderPreview?.couponDiscount > 0 && (
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-muted-foreground">
                                            Coupon
                                            {orderPreview.couponCode
                                                ? ` (${orderPreview.couponCode})`
                                                : ""}
                                        </span>

                                        <span className="font-medium text-green-600">
                                            -
                                            {formatPrice(
                                                orderPreview.couponDiscount
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                        Shipping
                                    </span>

                                    <span>
                                        {orderPreview
                                            ? orderPreview.shippingPrice === 0
                                                ? "Free"
                                                : formatPrice(
                                                    orderPreview.shippingPrice
                                                )
                                            : "Calculated at checkout"}
                                    </span>
                                </div>

                                {orderPreview && (
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-muted-foreground">
                                            Tax
                                        </span>

                                        <span>
                                            {formatPrice(
                                                orderPreview.taxPrice
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-5" />

                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold">
                                    Total
                                </span>

                                <span className="text-xl font-bold">
                                    {orderPreview
                                        ? formatPrice(
                                            orderPreview.totalPrice
                                        )
                                        : formatPrice(localSubtotal)}
                                </span>
                            </div>

                            <Button
                                className="mt-6 w-full"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={
                                    previewLoading || !orderPreview
                                }
                            >
                                Proceed to Checkout

                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={18}
                                />
                            </Button>

                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Your final total is calculated securely by
                                the server.
                            </p>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Cart;