import React from "react";

import { Button } from "@/components/ui/button";

import {
    MinusSignIcon,
    PlusSignIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const QuantitySelector = ({
    quantity,
    onDecrease,
    onIncrease,
    min = 1,
    max = Infinity,
}) => {
    const canDecrease = quantity > min;
    const canIncrease = quantity < max;

    return (
        <div className="flex h-11 items-center rounded-md border bg-background">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none border-none"
                disabled={!canDecrease}
                onClick={onDecrease}
                aria-label="Decrease quantity"
            >
                <HugeiconsIcon icon={MinusSignIcon} size={18} />
            </Button>

            <span className="flex h-full min-w-12 items-center justify-center border-x px-3 text-sm font-medium">
                {quantity}
            </span>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none border-none"
                disabled={!canIncrease}
                onClick={onIncrease}
                aria-label="Increase quantity"
            >
                <HugeiconsIcon icon={PlusSignIcon} size={18} />
            </Button>
        </div>
    );
};

export default QuantitySelector;