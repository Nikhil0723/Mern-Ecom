import React from "react";

const StockBadge = ({ stock = 0 }) => {
    if (stock <= 0) {
        return (
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                Out of Stock
            </span>
        );
    }

    if (stock <= 5) {
        return (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                Only {stock} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            In Stock
        </span>
    );
};

export default StockBadge;