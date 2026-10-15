import React, { useEffect, useState } from "react";

import { getMyOrders } from "@/services/orderApi";
import api from "@/services/api";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
    PackageIcon,
    ShoppingBag01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [ordersResponse, productsResponse, usersResponse] =
                    await Promise.all([
                        api.get("/api/orders"),
                        api.get("/api/products"),
                        api.get("/api/users"),
                    ]);

                setOrders(ordersResponse.data);
                setProducts(
                    productsResponse.data.products ||
                    productsResponse.data
                );
                setUsers(usersResponse.data);
            } catch (err) {
                console.error(
                    "Failed to load admin dashboard:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <Card
                            key={item}
                            className="h-32 animate-pulse"
                        />
                    ))}
                </div>

                <Card className="h-80 animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <h2 className="text-lg font-semibold">
                        Dashboard unavailable
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const totalRevenue = orders.reduce(
        (total, order) =>
            total + Number(order.totalPrice || 0),
        0
    );

    const pendingOrders = orders.filter(
        (order) => !order.isDelivered
    ).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-sm font-medium text-primary">
                    Overview
                </p>

                <h2 className="mt-1 text-3xl font-bold tracking-tight">
                    Dashboard
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Here's an overview of your store.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={ShoppingBag01Icon}
                                    size={20}
                                />
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Products
                            </span>
                        </div>

                        <p className="mt-5 text-2xl font-bold">
                            {products.length}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Total products
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={20}
                                />
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Orders
                            </span>
                        </div>

                        <p className="mt-5 text-2xl font-bold">
                            {orders.length}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {pendingOrders} pending delivery
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={20}
                                />
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Customers
                            </span>
                        </div>

                        <p className="mt-5 text-2xl font-bold">
                            {users.length}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={20}
                                />
                            </div>

                            <span className="text-xs text-muted-foreground">
                                Revenue
                            </span>
                        </div>

                        <p className="mt-5 text-2xl font-bold">
                            ₹{totalRevenue.toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Order total value
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent orders */}
            <Card>
                <div className="p-6">
                    <h3 className="font-semibold">
                        Recent orders
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Latest customer orders.
                    </p>
                </div>

                <Separator />

                <CardContent className="p-0">
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No orders yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {orders.slice(0, 5).map((order) => (
                                <div
                                    key={order._id}
                                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.user?.name ||
                                                "Customer"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                order.isDelivered
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {order.isDelivered
                                                ? "Delivered"
                                                : "Processing"}
                                        </Badge>

                                        <span className="font-semibold">
                                            ₹
                                            {order.totalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;