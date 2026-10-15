import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

const ProductRating = ({
    rating = 0,
    reviewCount = 0,
    showCount = true,
}) => {
    const roundedRating = Math.round(Number(rating));

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <HugeiconsIcon
                        key={star}
                        icon={StarIcon}
                        size={16}
                        strokeWidth={1.8}
                        className={
                            star <= roundedRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        }
                    />
                ))}
            </div>

            {showCount && (
                <span className="text-sm text-muted-foreground">
                    ({reviewCount})
                </span>
            )}
        </div>
    );
};

export default ProductRating;