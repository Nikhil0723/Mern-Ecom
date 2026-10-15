import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getAdminOrder,
    markOrderAsDelivered,
} from "../../services/adminOrderApi";

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
    UserIcon,
    Home01Icon,
    CheckmarkCircle01Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [delivering, setDelivering] = useState(false);
    const [error, setError] = useState("");

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminOrder(id);

            setOrder(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load order."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleMarkDelivered = async () => {
        try {
            setDelivering(true);
            setError("");

            const updatedOrder =
                await markOrderAsDelivered(id);

            setOrder(updatedOrder);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to mark order as delivered."
            );
        } finally {
            setDelivering(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(price || 0));
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    const formatDateTime = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        className="animate-spin"
                    />

                    Loading order...
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="space-y-4">
                <Button
                    type="button"
                    variant="link"
                    className="mb-2 -ml-3 border-none "
                    onClick={() =>
                        navigate("/admin/orders")
                    }
                >

                    Back to Products
                </Button>

                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <Button
                        type="button"
                        variant="link"
                        className="mb-2 -ml-3 border-none "
                        onClick={() =>
                            navigate("/admin/orders")
                        }
                    >

                        Back to Products
                    </Button>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Order #{order._id.slice(-8)}
                        </h1>

                        {order.isDelivered ? (
                            <Badge>
                                Delivered
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                Pending Delivery
                            </Badge>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                    </p>
                </div>

                {!order.isDelivered && (
                    <Button
                        onClick={handleMarkDelivered}
                        disabled={delivering}
                    >
                        {delivering ? (
                            <>
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    size={18}
                                    className="animate-spin"
                                />

                                Updating...
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={18}
                                />

                                Mark as Delivered
                            </>
                        )}
                    </Button>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Main */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={20}
                                />

                                Customer
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Name
                                    </p>

                                    <p className="font-medium">
                                        {order.user?.name || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Email
                                    </p>

                                    <p className="font-medium">
                                        {order.user?.email || "-"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={Home01Icon}
                                    size={20}
                                />

                                Shipping Address
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {order.shippingAddress ? (
                                <div className="text-sm leading-6">
                                    <p>
                                        {order.shippingAddress.address}
                                    </p>

                                    <p>
                                        {order.shippingAddress.city},{" "}
                                        {order.shippingAddress.state}
                                    </p>

                                    <p>
                                        {order.shippingAddress.pincode}
                                    </p>

                                    <p>
                                        {order.shippingAddress.country}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No shipping address available.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={20}
                                />

                                Order Items
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="divide-y">
                                {order.orderItems?.map((item) => (
                                    <div
                                        key={item.product || item._id}
                                        className="flex gap-4 p-5"
                                    >
                                        <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-contain p-2"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {item.name}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Quantity: {item.qty}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {formatPrice(item.price)} each
                                            </p>
                                        </div>

                                        <div className="text-right font-medium">
                                            {formatPrice(
                                                item.price * item.qty
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Items
                                </span>

                                <span>
                                    {formatPrice(order.itemsPrice)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>

                                <span>
                                    {formatPrice(order.shippingPrice)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Tax
                                </span>

                                <span>
                                    {formatPrice(order.taxPrice)}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex justify-between">
                                <span className="font-semibold">
                                    Total
                                </span>

                                <span className="text-lg font-semibold">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Payment
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Method
                                </p>

                                <p className="mt-1 font-medium">
                                    {order.paymentMethod || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>

                                <div className="mt-2">
                                    {order.isPaid ? (
                                        <Badge>
                                            Paid
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Unpaid
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {order.paidAt && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Paid at
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {formatDateTime(order.paidAt)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Delivery
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>

                                <div className="mt-2">
                                    {order.isDelivered ? (
                                        <Badge>
                                            Delivered
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            Pending
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {order.deliveredAt && (
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Delivered at
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {formatDateTime(
                                            order.deliveredAt
                                        )}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;