import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";


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
    PackageIcon,
    Location01Icon,
    CreditCardIcon,
    CheckmarkCircle02Icon,
    Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getOrderById } from "../../services/orderApi";

const OrderDetails = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getOrderById(id);

                setOrder(data);
            } catch (err) {
                console.error("Failed to load order:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load order."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id]);

    if (loading) {
        return (
            <PageContainer className="py-10">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />

                    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            <Card className="h-48 animate-pulse" />
                            <Card className="h-48 animate-pulse" />
                            <Card className="h-64 animate-pulse" />
                        </div>

                        <Card className="h-80 animate-pulse" />
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error || !order) {
        return (
            <PageContainer className="py-16">
                <div className="mx-auto max-w-md">
                    <Card>
                        <CardContent className="flex flex-col items-center p-8 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <PackageIcon className="h-6 w-6" />
                            </div>

                            <h1 className="mt-4 text-xl font-semibold">
                                Order not found
                            </h1>

                            <p className="mt-2 text-sm text-muted-foreground">
                                {error || "We couldn't find this order."}
                            </p>

                            <Button asChild variant="link">
                                <Link to="/orders">
                                    Back to orders
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    const orderDate = new Date(order.createdAt);

    const formattedDate = orderDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );

    const formattedTime = orderDate.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );

    const paymentLabel =
        order.paymentMethod === "COD"
            ? "Cash on Delivery"
            : "Credit / Debit Card";

    return (
        <PageContainer className="py-8 sm:py-12">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="link"
                        asChild
                        className="-ml-3 mb-4"
                    >
                        <Link to="/orders" >
                            Back to orders
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                Order details
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Placed on {formattedDate} at {formattedTime}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {order.isDelivered ? (
                                <Badge>
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle02Icon}
                                        size={14}
                                        className="mr-1"
                                    />
                                    Delivered
                                </Badge>
                            ) : (
                                <Badge variant="secondary">
                                    <HugeiconsIcon
                                        icon={Clock01Icon}
                                        size={14}
                                        className="mr-1"
                                    />
                                    Processing
                                </Badge>
                            )}

                            {order.isPaid ? (
                                <Badge variant="outline">
                                    Paid
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    Payment pending
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        {/* Order status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order status</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-border" />

                                    <div className="relative flex gap-4 pb-8">
                                        <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <HugeiconsIcon
                                                icon={CheckmarkCircle02Icon}
                                                size={18}
                                            />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Order placed
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Your order has been received.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex gap-4 pb-8">
                                        <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                                            <HugeiconsIcon
                                                icon={
                                                    order.isDelivered
                                                        ? CheckmarkCircle02Icon
                                                        : Clock01Icon
                                                }
                                                size={18}
                                            />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                {order.isDelivered
                                                    ? "Delivered"
                                                    : "Processing"}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {order.isDelivered
                                                    ? "Your order has been delivered."
                                                    : "We're preparing your order."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex gap-4">
                                        <div
                                            className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${order.isDelivered
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "bg-background"
                                                }`}
                                        >
                                            <HugeiconsIcon
                                                icon={PackageIcon}
                                                size={18}
                                            />
                                        </div>

                                        <div>
                                            <p className="font-medium">
                                                Delivery
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {order.isDelivered
                                                    ? "Order successfully delivered."
                                                    : "Delivery will be updated once shipped."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={Location01Icon}
                                            size={18}
                                        />
                                    </div>

                                    <CardTitle>Shipping address</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-6">
                                    <p className="font-medium">
                                        {order.shippingAddress.address}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.state}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {order.shippingAddress.pincode}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={CreditCardIcon}
                                            size={18}
                                        />
                                    </div>

                                    <CardTitle>Payment</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                    <div>
                                        <p className="font-medium">
                                            {paymentLabel}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.isPaid
                                                ? "Payment completed"
                                                : order.paymentMethod === "COD"
                                                    ? "Pay when your order is delivered"
                                                    : "Payment pending"}
                                        </p>
                                    </div>

                                    <Badge
                                        variant={
                                            order.isPaid
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {order.isPaid ? "Paid" : "Pending"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
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
                                        <CardTitle>Order items</CardTitle>

                                        <p className="text-sm text-muted-foreground">
                                            {order.orderItems.length}{" "}
                                            {order.orderItems.length === 1
                                                ? "product"
                                                : "products"}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="divide-y">
                                    {order.orderItems.map((item) => (
                                        <div
                                            key={item._id}
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
                                                <Link
                                                    to={`/product/${item.product}`}
                                                    className="line-clamp-2 font-medium hover:underline"
                                                >
                                                    {item.name}
                                                </Link>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    ₹
                                                    {item.price.toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    × {item.qty}
                                                </p>
                                            </div>

                                            <p className="font-semibold">
                                                ₹
                                                {(item.price * item.qty).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>
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
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Items
                                </span>

                                <span>
                                    ₹
                                    {order.itemsPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>

                                <span>
                                    {order.shippingPrice === 0
                                        ? "Free"
                                        : `₹${order.shippingPrice.toLocaleString(
                                            "en-IN"
                                        )}`}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Tax
                                </span>

                                <span>
                                    ₹
                                    {order.taxPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    Total
                                </span>

                                <span className="text-2xl font-bold">
                                    ₹
                                    {order.totalPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>
                            </div>

                            <Separator />

                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Order ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs">
                                    {order._id}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default OrderDetails;