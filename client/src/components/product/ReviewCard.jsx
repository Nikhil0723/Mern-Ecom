import React from "react";
import ProductRating from "./ProductRating";

const ReviewCard = ({ review }) => {
    if (!review) return null;

    const {
        name = "Customer",
        rating = 0,
        comment = "",
        createdAt,
    } = review;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : null;

    return (
        <article className="border-b py-5 last:border-b-0">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold">{name}</p>

                    {formattedDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {formattedDate}
                        </p>
                    )}
                </div>

                <ProductRating
                    rating={rating}
                    showCount={false}
                />
            </div>

            {comment && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {comment}
                </p>
            )}
        </article>
    );
};

export default ReviewCard;