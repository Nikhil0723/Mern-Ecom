import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const steps = [
    {
        key: "shipping",
        label: "Shipping",
        path: "/shipping",
    },
    {
        key: "payment",
        label: "Payment",
        path: "/payment",
    },
    {
        key: "placeorder",
        label: "Review",
        path: "/placeorder",
    },
];

const CheckoutSteps = ({ currentStep }) => {
    const currentIndex = steps.findIndex(
        (step) => step.key === currentStep
    );

    return (
        <div className="mb-8 flex items-center justify-center">
            {steps.map((step, index) => {
                const completed = index < currentIndex;
                const active = index === currentIndex;

                return (
                    <React.Fragment key={step.key}>
                        <Link
                            to={completed ? step.path : "#"}
                            className={cn(
                                "flex items-center gap-2 text-sm font-medium transition-colors",
                                active && "text-foreground",
                                completed && "text-primary",
                                !active && !completed && "text-muted-foreground"
                            )}
                            onClick={(event) => {
                                if (!completed) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            <span
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                                    active &&
                                    "border-primary bg-primary text-primary-foreground",
                                    completed &&
                                    "border-primary bg-primary text-primary-foreground",
                                    !active &&
                                    !completed &&
                                    "border-muted-foreground/30"
                                )}
                            >
                                {completed ? <Check className="h-4 w-4" /> : index + 1}
                            </span>

                            <span className="hidden sm:inline">{step.label}</span>
                        </Link>

                        {index < steps.length - 1 && (
                            <Separator
                                className={cn(
                                    "mx-3 w-10 sm:w-16",
                                    index < currentIndex && "bg-primary"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default CheckoutSteps;