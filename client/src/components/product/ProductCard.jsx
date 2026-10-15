import React from "react";
import { Link } from "react-router-dom";

import {
    FavouriteIcon,
    ShoppingCartAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";

import ProductPrice from "./ProductPrice";
import ProductRating from "./ProductRating";
import StockBadge from "./StockBadge";

import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "@/store/wishlistSlice";

const ProductCard = ({ product, onAddToCart }) => {
    const dispatch = useDispatch();

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    const isWishlisted = wishlistItems.some(
        (item) => item._id === product._id
    );

    const {
        _id,
        id,
        name,
        image,
        price,
        originalPrice,
        rating = 0,
        numReviews = 0,
        countInStock = 0,
        isFeatured = false,
    } = product;

    const productId = _id || id;

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background transition-shadow duration-300 hover:shadow-lg">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <Link
                    to={`/product/${productId}`}
                    className="block h-full"
                >
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Featured Badge */}
                {isFeatured && (
                    <Badge className="absolute left-3 top-3 z-10">
                        Featured
                    </Badge>
                )}

                {/* Wishlist */}
                <button
                    type="button"
                    onClick={() =>
                        dispatch(toggleWishlist(product))
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
                    aria-label={
                        isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                >
                    <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={18}
                        className={
                            isWishlisted
                                ? "fill-current text-red-500"
                                : ""
                        }
                    />
                </button>

                {/* Add to Cart */}
                {countInStock > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            onAddToCart?.(product)
                        }
                        className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-primary/90"
                        aria-label="Add to cart"
                    >
                        <HugeiconsIcon
                            icon={ShoppingCartAdd01Icon}
                            size={19}
                            strokeWidth={1.8}
                        />
                    </button>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col p-4">
                {/* Rating */}
                <div className="mb-2">
                    <ProductRating
                        rating={rating}
                        reviewCount={numReviews}
                    />
                </div>

                {/* Product Name */}
                <Link
                    to={`/product/${productId}`}
                    className="line-clamp-2 text-sm font-semibold leading-5 transition-colors hover:text-primary"
                >
                    {name}
                </Link>

                {/* Price + Discount */}
                <div className="mt-3">
                    <ProductPrice
                        price={price}
                        originalPrice={originalPrice}
                    />
                </div>

                {/* Stock */}
                <div className="mt-auto pt-3">
                    <StockBadge stock={countInStock} />
                </div>
            </div>
        </article>
    );
};

export default ProductCard;