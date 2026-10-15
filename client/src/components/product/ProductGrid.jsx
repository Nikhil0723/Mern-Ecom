
import React from "react";
import { Card } from "@/components/ui/card";
import ProductCard from "./ProductCard";

const ProductGrid = ({
    products = [],
    onAddToCart,
    onToggleWishlist,
    columns = 4,
    loading = false,
}) => {
    const gridColumns = {
        2: "grid-cols-2",
        3: "grid-cols-2 sm:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    };

    const gridClass =
        `grid gap-4 sm:gap-5 ${gridColumns[columns] || gridColumns[4]}`;

    // Product loading skeletons
    if (loading) {
        return (
            <div className={gridClass} aria-label="Loading products" aria-busy="true">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Card
                        key={index}
                        className="overflow-hidden border-border/70 p-0"
                    >
                        <div className="aspect-square animate-pulse bg-muted" />

                        <div className="space-y-3 p-3 sm:p-4">
                            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />

                            <div className="flex items-center justify-between pt-1">
                                <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                            </div>

                            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    // Empty state
    if (!products.length) {
        return (
            <Card className="flex min-h-72 flex-col items-center justify-center border-dashed px-6 py-12 text-center shadow-none">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                    <span className="text-2xl" aria-hidden="true">
                        🔎
                    </span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight">
                    No products found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    We couldn't find any products matching your current search or filters.
                    Try a different search or remove some filters.
                </p>
            </Card>
        );
    }

    return (
        <div className={gridClass}>
            {products.map((product) => (
                <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
