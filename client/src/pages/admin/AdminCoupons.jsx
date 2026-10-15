import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    Add01Icon,
    Delete02Icon,
    PencilEdit02Icon,
    DiscountTag01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    getCoupons,
    deleteCoupon,
} from "../../services/couponApi";

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [couponToDelete, setCouponToDelete] =
        useState(null);

    const [deleting, setDeleting] = useState(false);

    const loadCoupons = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCoupons();

            setCoupons(Array.isArray(data) ? data : []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load coupons."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const filteredCoupons = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return coupons;
        }

        return coupons.filter((coupon) =>
            coupon.code
                ?.toLowerCase()
                .includes(query)
        );
    }, [coupons, search]);

    const getCouponStatus = (coupon) => {
        const now = new Date();

        if (!coupon.isActive) {
            return {
                label: "Inactive",
                variant: "secondary",
            };
        }

        if (now < new Date(coupon.startDate)) {
            return {
                label: "Scheduled",
                variant: "outline",
            };
        }

        if (now > new Date(coupon.expiryDate)) {
            return {
                label: "Expired",
                variant: "destructive",
            };
        }

        if (
            coupon.usageLimit !== null &&
            coupon.usageCount >=
            coupon.usageLimit
        ) {
            return {
                label: "Limit reached",
                variant: "destructive",
            };
        }

        return {
            label: "Active",
            variant: "default",
        };
    };

    const confirmDelete = (coupon) => {
        setCouponToDelete(coupon);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;

        try {
            setDeleting(true);

            await deleteCoupon(
                couponToDelete._id
            );

            setCoupons((current) =>
                current.filter(
                    (coupon) =>
                        coupon._id !==
                        couponToDelete._id
                )
            );

            setDeleteDialogOpen(false);
            setCouponToDelete(null);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete coupon."
            );
        } finally {
            setDeleting(false);
        }
    };

    const activeCount = coupons.filter(
        (coupon) =>
            getCouponStatus(coupon).label ===
            "Active"
    ).length;

    const scheduledCount = coupons.filter(
        (coupon) =>
            getCouponStatus(coupon).label ===
            "Scheduled"
    ).length;

    const expiredCount = coupons.filter(
        (coupon) =>
            getCouponStatus(coupon).label ===
            "Expired" ||
            getCouponStatus(coupon).label ===
            "Limit reached"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">
                        Promotions
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Coupons
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create and manage discount codes for
                        your customers.
                    </p>
                </div>

                <Button asChild variant="outline">
                    <Link to="/admin/coupons/new" className="flex gap-1">
                        <HugeiconsIcon
                            icon={Add01Icon}
                            size={18}
                        />
                        Create Coupon
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total coupons"
                    value={coupons.length}
                />

                <StatCard
                    label="Active"
                    value={activeCount}
                />

                <StatCard
                    label="Scheduled"
                    value={scheduledCount}
                />

                <StatCard
                    label="Expired / used"
                    value={expiredCount}
                />
            </div>

            {/* Error */}
            {error && (
                <Card className="border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                </Card>
            )}

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="border-b p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                All coupons
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {filteredCoupons.length} coupon
                                {filteredCoupons.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search coupon..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            Loading coupons...
                        </p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                            <HugeiconsIcon
                                icon={
                                    DiscountTag01Icon
                                }
                                size={24}
                                className="text-muted-foreground"
                            />
                        </div>

                        <h3 className="mt-4 font-semibold">
                            No coupons found
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first coupon to offer
                            discounts to customers.
                        </p>

                        <Button
                            asChild
                            variant="outline"
                            className="mt-5"
                        >
                            <Link to="/admin/coupons/new">
                                Create Coupon
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-6 py-4 font-medium">
                                        Coupon
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Discount
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Validity
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Usage
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCoupons.map(
                                    (coupon) => {
                                        const status =
                                            getCouponStatus(
                                                coupon
                                            );

                                        return (
                                            <tr
                                                key={
                                                    coupon._id
                                                }
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="font-mono font-bold tracking-wide">
                                                            {
                                                                coupon.code
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Min. order ₹
                                                            {Number(
                                                                coupon.minimumOrderValue ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <Badge variant="outline">
                                                        {coupon.discountType ===
                                                            "percentage"
                                                            ? `${coupon.discountValue}% OFF`
                                                            : `₹${coupon.discountValue} OFF`}
                                                    </Badge>

                                                    {coupon.maximumDiscount !==
                                                        null &&
                                                        coupon.discountType ===
                                                        "percentage" && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Max ₹
                                                                {
                                                                    coupon.maximumDiscount
                                                                }
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <p className="text-xs">
                                                        {new Date(
                                                            coupon.startDate
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground">
                                                        to{" "}
                                                        {new Date(
                                                            coupon.expiryDate
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p>
                                                        {
                                                            coupon.usageCount
                                                        }
                                                        {" / "}
                                                        {coupon.usageLimit ??
                                                            "∞"}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <Badge
                                                        variant={
                                                            status.variant
                                                        }
                                                    >
                                                        {
                                                            status.label
                                                        }
                                                    </Badge>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            asChild
                                                            size="icon"
                                                            variant="outline"
                                                        >
                                                            <Link
                                                                to={`/admin/coupons/${coupon._id}/edit`}
                                                            >
                                                                <HugeiconsIcon
                                                                    icon={
                                                                        PencilEdit02Icon
                                                                    }
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            <HugeiconsIcon
                                                                icon={
                                                                    Delete02Icon
                                                                }
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Delete dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={
                    setDeleteDialogOpen
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete coupon?
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>
                                {couponToDelete?.code}
                            </strong>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialogOpen(
                                    false
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Coupon"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const StatCard = ({ label, value }) => {
    return (
        <Card className="p-5">
            <p className="text-sm text-muted-foreground">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>
        </Card>
    );
};

export default AdminCoupons;