import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import PageContainer from "@/components/layout/PageContainer";
import ProductGrid from "@/components/product/ProductGrid";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
    FavouriteIcon,
    ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { removeFromWishlist } from "@/store/wishlistSlice";
import { addToCart } from "@/store/cartSlice";

const Wishlist = () => {
    const dispatch = useDispatch();

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    const handleAddToCart = (product) => {
        if (!product.countInStock) return;

        dispatch(
            addToCart({
                product: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
                qty: 1,
            })
        );
    };

    if (wishlistItems.length === 0) {
        return (
            <PageContainer className="py-8 sm:py-12">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8">
                        <p className="text-sm font-medium text-primary">
                            Account
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Wishlist
                        </h1>
                    </div>

                    <Card>
                        <CardContent className="flex flex-col items-center p-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <HugeiconsIcon
                                    icon={FavouriteIcon}
                                    size={30}
                                />
                            </div>

                            <h2 className="mt-5 text-xl font-semibold">
                                Your wishlist is empty
                            </h2>

                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Save products you love and come back to them
                                whenever you want.
                            </p>

                            <Button asChild varient="lg" className="mt-6">
                                <Link to="/shop" >
                                    Browse products
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Account
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Wishlist
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Products you've saved for later.
                        </p>
                    </div>

                    <span className="text-sm text-muted-foreground">
                        {wishlistItems.length}{" "}
                        {wishlistItems.length === 1
                            ? "product"
                            : "products"}
                    </span>
                </div>

                <ProductGrid
                    products={wishlistItems}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={(product) =>
                        dispatch(removeFromWishlist(product._id))
                    }
                />
            </div>
        </PageContainer>
    );
};

export default Wishlist;