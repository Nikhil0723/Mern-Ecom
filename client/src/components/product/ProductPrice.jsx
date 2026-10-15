import React from "react";

const ProductPrice = ({
    price,
    originalPrice,
    currency = "₹",
    className = "",
}) => {
    const currentPrice = Number(price);
    const oldPrice = Number(originalPrice);

    const hasDiscount =
        Number.isFinite(oldPrice) &&
        oldPrice > currentPrice &&
        oldPrice > 0;

    const discountPercentage = hasDiscount
        ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
        : 0;

    return (
        <div className={`space-y-1 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold tracking-tight">
                    {currency}
                    {currentPrice.toLocaleString("en-IN")}
                </span>

                {hasDiscount && (
                    <>
                        <span className="text-sm text-muted-foreground line-through">
                            {currency}
                            {oldPrice.toLocaleString("en-IN")}
                        </span>

                        <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                            {discountPercentage}% OFF
                        </span>
                    </>
                )}
            </div>

            {hasDiscount && (
                <p className="text-xs text-muted-foreground">
                    You save{" "}
                    <span className="font-medium text-foreground">
                        {currency}
                        {(oldPrice - currentPrice).toLocaleString("en-IN")}
                    </span>
                </p>
            )}
        </div>
    );
};

export default ProductPrice;