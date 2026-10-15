import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAdminOrders,
} from "../../services/adminOrderApi";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import {
    Search01Icon,
    EyeIcon,
    PackageIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const AdminOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAdminOrders();

                setOrders(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return orders.filter((order) => {
            const orderId = order._id?.toLowerCase() || "";

            const customerName =
                order.user?.name?.toLowerCase() || "";

            const customerEmail =
                order.user?.email?.toLowerCase() || "";

            const matchesSearch =
                !searchValue ||
                orderId.includes(searchValue) ||
                customerName.includes(searchValue) ||
                customerEmail.includes(searchValue);

            const matchesStatus =
                status === "all" ||
                (status === "paid" && order.isPaid) ||
                (status === "unpaid" && !order.isPaid) ||
                (status === "delivered" && order.isDelivered) ||
                (status === "pending" && !order.isDelivered);

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, status]);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(price || 0));
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading orders...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Orders
                </h1>

                <p className="text-sm text-muted-foreground">
                    Manage customer orders and delivery status.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <HugeiconsIcon
                                icon={PackageIcon}
                                size={20}
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Orders
                            </p>

                            <p className="text-2xl font-semibold">
                                {orders.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">
                            Pending
                        </p>

                        <p className="mt-1 text-2xl font-semibold">
                            {
                                orders.filter(
                                    (order) => !order.isDelivered
                                ).length
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">
                            Delivered
                        </p>

                        <p className="mt-1 text-2xl font-semibold">
                            {
                                orders.filter(
                                    (order) => order.isDelivered
                                ).length
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground">
                            Revenue
                        </p>

                        <p className="mt-1 text-2xl font-semibold">
                            {formatPrice(
                                orders.reduce(
                                    (total, order) =>
                                        total +
                                        Number(order.totalPrice || 0),
                                    0
                                )
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by order ID, customer name or email..."
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={status}
                            onValueChange={setStatus}
                        >
                            <SelectTrigger className="w-full md:w-[190px]">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Orders
                                </SelectItem>

                                <SelectItem value="pending">
                                    Pending Delivery
                                </SelectItem>

                                <SelectItem value="delivered">
                                    Delivered
                                </SelectItem>

                                <SelectItem value="paid">
                                    Paid
                                </SelectItem>

                                <SelectItem value="unpaid">
                                    Unpaid
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Orders</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {filteredOrders.length} order
                                {filteredOrders.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                    {filteredOrders.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={22}
                                />
                            </div>

                            <h3 className="mt-4 font-medium">
                                No orders found
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Try changing your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-6 py-4 text-left font-medium">
                                            Order
                                        </th>

                                        <th className="px-6 py-4 text-left font-medium">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-left font-medium">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-left font-medium">
                                            Total
                                        </th>

                                        <th className="px-6 py-4 text-left font-medium">
                                            Payment
                                        </th>

                                        <th className="px-6 py-4 text-left font-medium">
                                            Delivery
                                        </th>

                                        <th className="px-6 py-4 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs">
                                                    #{order._id.slice(-8)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {order.user?.name ||
                                                            "Unknown"}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        {order.user?.email || "-"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                {formatPrice(
                                                    order.totalPrice
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {order.isPaid ? (
                                                    <Badge>
                                                        Paid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Unpaid
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {order.isDelivered ? (
                                                    <Badge>
                                                        Delivered
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/orders/${order._id}`
                                                        )
                                                    }
                                                >
                                                    <HugeiconsIcon
                                                        icon={EyeIcon}
                                                        size={16}
                                                    />

                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOrders;