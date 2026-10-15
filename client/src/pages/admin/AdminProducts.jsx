import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    getAdminProducts,
    deleteProduct,
} from "@/services/adminProductApi";

import PageContainer from "@/components/layout/PageContainer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
    PlusSignIcon,
    PencilEdit01Icon,
    Delete02Icon,
    PackageIcon,
    Search01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminProducts();

            setProducts(
                data.products || data
            );
        } catch (err) {
            console.error(
                "Failed to load products:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return products;
        }

        return products.filter((product) =>
            [
                product.name,
                product.brand,
                product.category,
            ]
                .filter(Boolean)
                .some((value) =>
                    value.toLowerCase().includes(keyword)
                )
        );
    }, [products, search]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteProduct(id);

            setProducts((currentProducts) =>
                currentProducts.filter(
                    (product) => product._id !== id
                )
            );
        } catch (err) {
            console.error(
                "Failed to delete product:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete product."
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <PageContainer className="py-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="h-8 w-48 animate-pulse rounded bg-muted" />

                    <Card className="h-[500px] animate-pulse" />
                </div>
            </PageContainer>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">
                        Catalog
                    </p>

                    <h2 className="mt-1 text-3xl font-bold tracking-tight">
                        Products
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Manage your store products and inventory.
                    </p>
                </div>

                <Button asChild variant="outline">
                    <Link to="/admin/products/new" className=" flex gap-1">
                        <HugeiconsIcon
                            icon={PlusSignIcon}
                            size={16}
                            data-icon="inline-start"
                        />
                        Add product
                    </Link>
                </Button>
            </div>

            {/* Error */}
            {error && (
                <Card className="border-destructive/50">
                    <CardContent className="p-4 text-sm text-destructive">
                        {error}
                    </CardContent>
                </Card>
            )}

            {/* Products */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-base">
                                All products
                            </CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {filteredProducts.length} of{" "}
                                {products.length} products
                            </p>
                        </div>

                        <div className="relative w-full lg:max-w-sm">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search products..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-0">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={24}
                                />
                            </div>

                            <h3 className="mt-4 font-semibold">
                                No products found
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Try a different search term.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Product
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Price
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Stock
                                        </th>

                                        <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Rating
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map(
                                        (product) => {
                                            const stock =
                                                Number(
                                                    product.countInStock
                                                ) || 0;

                                            return (
                                                <tr
                                                    key={product._id}
                                                    className="border-b last:border-0 hover:bg-muted/20"
                                                >
                                                    {/* Product */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[280px] truncate font-medium">
                                                                    {product.name}
                                                                </p>

                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {product.brand}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-5 py-4">
                                                        <Badge variant="secondary">
                                                            {product.category}
                                                        </Badge>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-5 py-4 font-medium">
                                                        ₹
                                                        {Number(
                                                            product.price || 0
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                    {/* Stock */}
                                                    <td className="px-5 py-4">
                                                        <Badge
                                                            variant={
                                                                stock === 0
                                                                    ? "destructive"
                                                                    : stock <= 5
                                                                        ? "secondary"
                                                                        : "default"
                                                            }
                                                        >
                                                            {stock === 0
                                                                ? "Out of stock"
                                                                : `${stock} in stock`}
                                                        </Badge>
                                                    </td>

                                                    {/* Rating */}
                                                    <td className="px-5 py-4">
                                                        <span className="font-medium">
                                                            {Number(
                                                                product.rating || 0
                                                            ).toFixed(1)}
                                                        </span>

                                                        <span className="ml-1 text-sm text-muted-foreground">
                                                            ({product.numReviews || 0})
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="icon"
                                                            >
                                                                <Link
                                                                    to={`/admin/products/${product._id}/edit`}
                                                                    aria-label={`Edit ${product.name}`}
                                                                >
                                                                    <HugeiconsIcon
                                                                        icon={PencilEdit01Icon}
                                                                        size={16}
                                                                    />
                                                                </Link>
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                disabled={
                                                                    deletingId ===
                                                                    product._id
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product._id
                                                                    )
                                                                }
                                                                aria-label={`Delete ${product.name}`}
                                                            >
                                                                <HugeiconsIcon
                                                                    icon={Delete02Icon}
                                                                    size={16}
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
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProducts;