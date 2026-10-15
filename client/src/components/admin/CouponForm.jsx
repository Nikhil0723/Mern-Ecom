import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    ArrowLeft01Icon,
    DiscountTag01Icon,
    Calendar03Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
    createCoupon,
    updateCoupon,
} from "../../services/couponApi";

const couponSchema = z
    .object({
        code: z
            .string()
            .min(3, "Coupon code must be at least 3 characters")
            .max(30, "Coupon code is too long"),

        discountType: z.enum([
            "percentage",
            "fixed",
        ]),

        discountValue: z.coerce
            .number()
            .positive("Discount must be greater than 0"),

        minimumOrderValue: z.coerce
            .number()
            .min(0, "Minimum order value cannot be negative"),

        maximumDiscount: z.union([
            z.coerce
                .number()
                .positive()
                .nullable(),
            z.literal(""),
        ]),

        usageLimit: z.union([
            z.coerce
                .number()
                .int()
                .positive()
                .nullable(),
            z.literal(""),
        ]),

        startDate: z
            .string()
            .min(1, "Start date is required"),

        expiryDate: z
            .string()
            .min(1, "Expiry date is required"),

        isActive: z.boolean(),
    })
    .superRefine((data, ctx) => {
        if (
            data.discountType === "percentage" &&
            data.discountValue > 100
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["discountValue"],
                message:
                    "Percentage discount cannot exceed 100%",
            });
        }

        if (
            data.expiryDate &&
            data.startDate &&
            new Date(data.expiryDate) <=
            new Date(data.startDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expiryDate"],
                message:
                    "Expiry date must be after start date",
            });
        }
    });

const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(
        parsedDate.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        parsedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const CouponForm = ({
    mode = "create",
    coupon = null,
}) => {
    const navigate = useNavigate();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            discountValue: 10,
            minimumOrderValue: 0,
            maximumDiscount: "",
            usageLimit: "",
            startDate: "",
            expiryDate: "",
            isActive: true,
        },
    });

    const discountType = watch("discountType");
    const discountValue = watch("discountValue");
    const minimumOrderValue = watch(
        "minimumOrderValue"
    );

    useEffect(() => {
        if (!coupon) return;

        reset({
            code: coupon.code || "",
            discountType:
                coupon.discountType || "percentage",
            discountValue:
                coupon.discountValue ?? 10,
            minimumOrderValue:
                coupon.minimumOrderValue ?? 0,
            maximumDiscount:
                coupon.maximumDiscount ?? "",
            usageLimit: coupon.usageLimit ?? "",
            startDate: formatDateForInput(
                coupon.startDate
            ),
            expiryDate: formatDateForInput(
                coupon.expiryDate
            ),
            isActive:
                coupon.isActive ?? true,
        });
    }, [coupon, reset]);

    const onSubmit = async (data) => {
        try {
            setServerError("");
            setSuccessMessage("");

            const payload = {
                code: data.code.trim().toUpperCase(),
                discountType: data.discountType,
                discountValue: Number(
                    data.discountValue
                ),
                minimumOrderValue: Number(
                    data.minimumOrderValue
                ),
                maximumDiscount:
                    data.maximumDiscount === "" ||
                        data.maximumDiscount === null
                        ? null
                        : Number(
                            data.maximumDiscount
                        ),
                usageLimit:
                    data.usageLimit === "" ||
                        data.usageLimit === null
                        ? null
                        : Number(data.usageLimit),
                startDate: data.startDate,
                expiryDate: data.expiryDate,
                isActive: data.isActive,
            };

            if (mode === "edit") {
                await updateCoupon(
                    coupon._id,
                    payload
                );

                setSuccessMessage(
                    "Coupon updated successfully."
                );
            } else {
                await createCoupon(payload);

                setSuccessMessage(
                    "Coupon created successfully."
                );
            }

            setTimeout(() => {
                navigate("/admin/coupons");
            }, 700);
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    const previewDiscount =
        discountType === "percentage"
            ? `${discountValue || 0}% OFF`
            : `₹${discountValue || 0} OFF`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2 -ml-2"
                        onClick={() =>
                            navigate("/admin/coupons")
                        }
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={18}
                        />
                        Back to coupons
                    </Button>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {mode === "edit"
                            ? "Edit Coupon"
                            : "Create Coupon"}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {mode === "edit"
                            ? "Update your coupon and discount settings."
                            : "Create a discount code for your customers."}
                    </p>
                </div>

                <Badge
                    variant={
                        mode === "edit"
                            ? "secondary"
                            : "default"
                    }
                    className="w-fit"
                >
                    {mode === "edit"
                        ? "Editing coupon"
                        : "New coupon"}
                </Badge>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-6 lg:grid-cols-[1fr_360px]"
            >
                {/* Main form */}
                <div className="space-y-6">
                    {/* Basic information */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <HugeiconsIcon
                                    icon={
                                        DiscountTag01Icon
                                    }
                                    size={21}
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Coupon details
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Configure the discount customers
                                    will receive.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                data-invalid={
                                    !!errors.code
                                }
                            >
                                <FieldLabel>
                                    Coupon code
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        {...register(
                                            "code"
                                        )}
                                        placeholder="WELCOME10"
                                        className="uppercase"
                                    />

                                    <FieldDescription>
                                        Customers will enter this
                                        code during checkout.
                                    </FieldDescription>

                                    <FieldError>
                                        {
                                            errors.code
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>

                            <Field
                                data-invalid={
                                    !!errors.discountType
                                }
                            >
                                <FieldLabel>
                                    Discount type
                                </FieldLabel>

                                <FieldContent>
                                    <Controller
                                        name="discountType"
                                        control={control}
                                        render={({
                                            field,
                                        }) => (
                                            <Select
                                                value={
                                                    field.value
                                                }
                                                onValueChange={
                                                    field.onChange
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    <SelectItem value="percentage">
                                                        Percentage
                                                    </SelectItem>

                                                    <SelectItem value="fixed">
                                                        Fixed amount
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />

                                    <FieldError>
                                        {
                                            errors
                                                .discountType
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>

                            <Field
                                data-invalid={
                                    !!errors.discountValue
                                }
                            >
                                <FieldLabel>
                                    Discount value
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register(
                                            "discountValue"
                                        )}
                                        placeholder={
                                            discountType ===
                                                "percentage"
                                                ? "10"
                                                : "500"
                                        }
                                    />

                                    <FieldDescription>
                                        {discountType ===
                                            "percentage"
                                            ? "Enter a value between 1% and 100%."
                                            : "Enter the fixed discount amount in ₹."}
                                    </FieldDescription>

                                    <FieldError>
                                        {
                                            errors
                                                .discountValue
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>

                            <Field
                                data-invalid={
                                    !!errors.minimumOrderValue
                                }
                            >
                                <FieldLabel>
                                    Minimum order value
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register(
                                            "minimumOrderValue"
                                        )}
                                        placeholder="1000"
                                    />

                                    <FieldDescription>
                                        Minimum cart value required
                                        to use this coupon.
                                    </FieldDescription>

                                    <FieldError>
                                        {
                                            errors
                                                .minimumOrderValue
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>

                            {discountType ===
                                "percentage" && (
                                    <Field
                                        data-invalid={
                                            !!errors
                                                .maximumDiscount
                                        }
                                    >
                                        <FieldLabel>
                                            Maximum discount
                                        </FieldLabel>

                                        <FieldContent>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                {...register(
                                                    "maximumDiscount"
                                                )}
                                                placeholder="500"
                                            />

                                            <FieldDescription>
                                                Optional maximum discount
                                                amount in ₹.
                                            </FieldDescription>

                                            <FieldError>
                                                {
                                                    errors
                                                        .maximumDiscount
                                                        ?.message
                                                }
                                            </FieldError>
                                        </FieldContent>
                                    </Field>
                                )}

                            <Field
                                data-invalid={
                                    !!errors.usageLimit
                                }
                            >
                                <FieldLabel>
                                    Usage limit
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        {...register(
                                            "usageLimit"
                                        )}
                                        placeholder="100"
                                    />

                                    <FieldDescription>
                                        Leave empty for unlimited
                                        usage.
                                    </FieldDescription>

                                    <FieldError>
                                        {
                                            errors
                                                .usageLimit
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>
                        </div>
                    </Card>

                    {/* Dates */}
                    <Card className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <HugeiconsIcon
                                    icon={Calendar03Icon}
                                    size={21}
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Validity
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Choose when customers can use
                                    this coupon.
                                </p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                data-invalid={
                                    !!errors.startDate
                                }
                            >
                                <FieldLabel>
                                    Start date
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        type="date"
                                        {...register(
                                            "startDate"
                                        )}
                                    />

                                    <FieldError>
                                        {
                                            errors
                                                .startDate
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>

                            <Field
                                data-invalid={
                                    !!errors.expiryDate
                                }
                            >
                                <FieldLabel>
                                    Expiry date
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        type="date"
                                        {...register(
                                            "expiryDate"
                                        )}
                                    />

                                    <FieldError>
                                        {
                                            errors
                                                .expiryDate
                                                ?.message
                                        }
                                    </FieldError>
                                </FieldContent>
                            </Field>
                        </div>

                        <div className="mt-6 rounded-xl border bg-muted/30 p-4">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={
                                                field.value
                                            }
                                            onCheckedChange={
                                                field.onChange
                                            }
                                        />

                                        <div>
                                            <p className="text-sm font-medium">
                                                Active coupon
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                Customers can use this
                                                coupon when it is active
                                                and within its validity
                                                dates.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </Card>

                    {/* Error / success */}
                    {serverError && (
                        <Card className="border-destructive/30 bg-destructive/5 p-4">
                            <p className="text-sm text-destructive">
                                {serverError}
                            </p>
                        </Card>
                    )}

                    {successMessage && (
                        <Card className="border-green-500/30 bg-green-500/5 p-4">
                            <p className="text-sm text-green-600">
                                {successMessage}
                            </p>
                        </Card>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    "/admin/coupons"
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Saving..."
                                : mode === "edit"
                                    ? "Update Coupon"
                                    : "Create Coupon"}
                        </Button>
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <Card className="sticky top-6 overflow-hidden">
                        <div className="border-b bg-muted/30 p-5">
                            <p className="text-sm font-medium">
                                Coupon preview
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                This is how the discount looks in
                                the admin panel.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="rounded-2xl border bg-background p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Badge>
                                            {discountType ===
                                                "percentage"
                                                ? "Percentage"
                                                : "Fixed"}
                                        </Badge>

                                        <h3 className="mt-4 text-2xl font-bold tracking-tight">
                                            {previewDiscount}
                                        </h3>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <HugeiconsIcon
                                            icon={
                                                DiscountTag01Icon
                                            }
                                            size={22}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-dashed p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Coupon code
                                    </p>

                                    <p className="mt-1 font-mono text-lg font-bold tracking-wider">
                                        {watch(
                                            "code"
                                        ) ||
                                            "COUPONCODE"}
                                    </p>
                                </div>

                                <div className="mt-5 space-y-2 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Minimum order
                                        </span>

                                        <span className="font-medium">
                                            ₹
                                            {Number(
                                                minimumOrderValue ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    </div>

                                    {discountType ===
                                        "percentage" &&
                                        watch(
                                            "maximumDiscount"
                                        ) && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-muted-foreground">
                                                    Max discount
                                                </span>

                                                <span className="font-medium">
                                                    ₹
                                                    {Number(
                                                        watch(
                                                            "maximumDiscount"
                                                        )
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                    <div className="flex justify-between gap-4">
                                        <span className="text-muted-foreground">
                                            Status
                                        </span>

                                        <Badge
                                            variant={
                                                watch(
                                                    "isActive"
                                                )
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {watch(
                                                "isActive"
                                            )
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl bg-muted/50 p-4">
                                <div className="flex gap-3">
                                    <HugeiconsIcon
                                        icon={Tick02Icon}
                                        size={18}
                                        className="mt-0.5 shrink-0 text-primary"
                                    />

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        The backend will validate the
                                        coupon again during checkout,
                                        including validity dates,
                                        minimum order value and usage
                                        limits.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default CouponForm;