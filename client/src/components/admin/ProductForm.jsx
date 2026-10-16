import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import {
    ImageAdd01Icon,
    Cancel01Icon,
    Loading03Icon,
    ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import useCategories from "../../hooks/useCategories";

import {
    createProduct,
    updateProduct,
    uploadProductImage,
} from "../../services/adminProductApi";


const productSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Product name is required"),

        brand: z
            .string()
            .trim()
            .min(2, "Brand is required"),

        category: z
            .string()
            .min(1, "Category is required"),

        description: z
            .string()
            .trim()
            .min(10, "Description must be at least 10 characters"),

        price: z.coerce
            .number()
            .min(0, "Selling price must be 0 or greater"),

        originalPrice: z
            .union([
                z.coerce
                    .number()
                    .min(0, "Original price must be 0 or greater"),
                z.literal(""),
                z.null(),
            ])
            .optional(),

        countInStock: z.coerce
            .number()
            .int("Stock must be a whole number")
            .min(0, "Stock cannot be negative"),

        isFeatured: z.boolean().default(false),
    })
    .refine(
        (data) => {
            if (
                data.originalPrice === "" ||
                data.originalPrice === null ||
                data.originalPrice === undefined
            ) {
                return true;
            }

            return (
                Number(data.originalPrice) >= Number(data.price)
            );
        },
        {
            message:
                "Original price cannot be lower than selling price",
            path: ["originalPrice"],
        }
    );


const ProductForm = ({
    product = null,
    mode = "create",
}) => {
    const navigate = useNavigate();

    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories();

    const isEdit = mode === "edit";

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState(product?.image || "");

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(productSchema),

        defaultValues: {
            name: product?.name || "",
            brand: product?.brand || "",
            category: product?.category || "",
            description: product?.description || "",
            price: product?.price ?? "",
            originalPrice: product?.originalPrice ?? "",
            countInStock: product?.countInStock ?? "",
            isFeatured: product?.isFeatured ?? false,
        },
    });

    const selectedCategory = watch("category");
    const sellingPrice = watch("price");
    const originalPrice = watch("originalPrice");
    const isFeatured = watch("isFeatured");


    useEffect(() => {
        if (!product) {
            return;
        }

        reset({
            name: product.name || "",
            brand: product.brand || "",
            category: product.category || "",
            description: product.description || "",
            price: product.price ?? "",
            originalPrice: product.originalPrice ?? "",
            countInStock: product.countInStock ?? "",
            isFeatured: product.isFeatured ?? false,
        });

        setImagePreview(product.image || "");
        setSelectedImage(null);
    }, [product, reset]);


    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Only JPG, JPEG, PNG, and WEBP images are allowed."
            );

            event.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError("Image size must be less than 5MB.");

            event.target.value = "";
            return;
        }

        setSelectedImage(file);

        const previewUrl = URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);

        if (isEdit && product?.image) {
            setImagePreview(product.image);
        } else {
            setImagePreview("");
        }
    };


    const onSubmit = async (data) => {
        try {
            setError("");
            setSuccess("");
            setSaving(true);

            let imageUrl = product?.image || "";

            /* New product requires image */
            if (!isEdit && !selectedImage) {
                setError("Please select a product image.");
                setSaving(false);
                return;
            }

            /* Upload new image */
            if (selectedImage) {
                setUploadingImage(true);

                const formData = new FormData();

                formData.append("image", selectedImage);

                const uploadResponse =
                    await uploadProductImage(formData);

                imageUrl = uploadResponse.image;

                setUploadingImage(false);
            }

            /* Normalize original price */
            const normalizedOriginalPrice =
                data.originalPrice === "" ||
                    data.originalPrice === null ||
                    data.originalPrice === undefined
                    ? null
                    : Number(data.originalPrice);

            /* Final product payload */
            const productData = {
                name: data.name.trim(),

                price: Number(data.price),

                originalPrice: normalizedOriginalPrice,

                image: imageUrl,

                brand: data.brand.trim(),

                category: data.category,

                countInStock: Number(data.countInStock),

                description: data.description.trim(),

                isFeatured: Boolean(data.isFeatured),
            };

            console.log("PRODUCT DATA:", productData);

            /* Update */
            if (isEdit) {
                await updateProduct(
                    product._id,
                    productData
                );

                setSuccess(
                    "Product updated successfully."
                );

                setTimeout(() => {
                    navigate("/admin/products");
                }, 700);

                return;
            }

            /* Create */
            await createProduct(productData);

            setSuccess(
                "Product created successfully."
            );

            setTimeout(() => {
                navigate("/admin/products");
            }, 700);
        } catch (err) {
            console.error(
                "PRODUCT SAVE ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Something went wrong."
            );
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    const isLoading =
        saving || uploadingImage;

    const numericSellingPrice =
        Number(sellingPrice);

    const numericOriginalPrice =
        Number(originalPrice);

    const hasDiscount =
        Number.isFinite(numericOriginalPrice) &&
        numericOriginalPrice > numericSellingPrice &&
        numericOriginalPrice > 0;

    const discountPercentage =
        hasDiscount
            ? Math.round(
                ((numericOriginalPrice -
                    numericSellingPrice) /
                    numericOriginalPrice) *
                100
            )
            : 0;


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Button
                        type="button"
                        variant="link"
                        className="mb-2 -ml-3 border-none "
                        onClick={() =>
                            navigate("/admin/products")
                        }
                    >

                        Back to Products
                    </Button>

                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit
                            ? "Edit Product"
                            : "Create Product"}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        {isEdit
                            ? "Update your product information, pricing and visibility."
                            : "Add a new product to your store."}
                    </p>
                </div>

                {isEdit && (
                    <Badge variant="secondary">
                        Editing Product
                    </Badge>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* Category error */}
            {categoriesError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {categoriesError}
                </div>
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-6 lg:grid-cols-[1fr_380px]"
            >

                <div className="space-y-6">
                    {/* Product Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Product Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Name */}
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Product Name
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        id="name"
                                        placeholder="Enter product name"
                                        disabled={isLoading}
                                        {...register("name")}
                                    />

                                    {errors.name && (
                                        <FieldError>
                                            {errors.name.message}
                                        </FieldError>
                                    )}
                                </FieldContent>
                            </Field>

                            {/* Brand + Category */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Brand */}
                                <Field>
                                    <FieldLabel htmlFor="brand">
                                        Brand
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="brand"
                                            placeholder="e.g. Nike"
                                            disabled={isLoading}
                                            {...register("brand")}
                                        />

                                        {errors.brand && (
                                            <FieldError>
                                                {errors.brand.message}
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>

                                {/* Category */}
                                <Field>
                                    <FieldLabel htmlFor="category">
                                        Category
                                    </FieldLabel>

                                    <FieldContent>
                                        <Select
                                            value={selectedCategory}
                                            onValueChange={(value) =>
                                                setValue(
                                                    "category",
                                                    value,
                                                    {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }
                                            disabled={
                                                categoriesLoading ||
                                                isLoading
                                            }
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue
                                                    placeholder={
                                                        categoriesLoading
                                                            ? "Loading categories..."
                                                            : "Select category"
                                                    }
                                                />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {categories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category._id}
                                                            value={category.name}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>

                                        {errors.category && (
                                            <FieldError>
                                                {errors.category.message}
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>
                            </div>

                            {/* Description */}
                            <Field>
                                <FieldLabel htmlFor="description">
                                    Description
                                </FieldLabel>

                                <FieldContent>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the product..."
                                        rows={7}
                                        disabled={isLoading}
                                        {...register("description")}
                                    />

                                    {errors.description && (
                                        <FieldError>
                                            {errors.description.message}
                                        </FieldError>
                                    )}
                                </FieldContent>
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Pricing & Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Pricing & Inventory
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Price fields */}
                            <div className="grid gap-6 sm:grid-cols-3">
                                {/* Selling price */}
                                <Field>
                                    <FieldLabel htmlFor="price">
                                        Selling Price
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="12999"
                                            disabled={isLoading}
                                            {...register("price")}
                                        />

                                        <FieldDescription>
                                            Current price customers will
                                            pay.
                                        </FieldDescription>

                                        {errors.price && (
                                            <FieldError>
                                                {errors.price.message}
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>

                                {/* Original price */}
                                <Controller
                                    name="originalPrice"
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel htmlFor="originalPrice">
                                                Original Price
                                            </FieldLabel>

                                            <FieldContent>
                                                <Input
                                                    id="originalPrice"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="15999"
                                                    disabled={isLoading}
                                                    value={
                                                        field.value ?? ""
                                                    }
                                                    onChange={(event) => {
                                                        const value =
                                                            event.target.value;

                                                        field.onChange(
                                                            value === ""
                                                                ? ""
                                                                : Number(value)
                                                        );
                                                    }}
                                                />

                                                <FieldDescription>
                                                    Leave empty if there is no
                                                    discount.
                                                </FieldDescription>

                                                {errors.originalPrice && (
                                                    <FieldError>
                                                        {
                                                            errors
                                                                .originalPrice
                                                                .message
                                                        }
                                                    </FieldError>
                                                )}
                                            </FieldContent>
                                        </Field>
                                    )}
                                />

                                {/* Stock */}
                                <Field>
                                    <FieldLabel htmlFor="countInStock">
                                        Stock
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="countInStock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="20"
                                            disabled={isLoading}
                                            {...register(
                                                "countInStock"
                                            )}
                                        />

                                        <FieldDescription>
                                            Available inventory.
                                        </FieldDescription>

                                        {errors.countInStock && (
                                            <FieldError>
                                                {
                                                    errors.countInStock
                                                        .message
                                                }
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>
                            </div>

                            {/* Discount preview */}
                            {hasDiscount && (
                                <div className="rounded-xl border bg-muted/40 p-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm text-muted-foreground">
                                            Customer sees:
                                        </span>

                                        <span className="text-lg font-bold">
                                            ₹
                                            {numericSellingPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>

                                        <span className="text-sm text-muted-foreground line-through">
                                            ₹
                                            {numericOriginalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>

                                        <Badge variant="secondary">
                                            {discountPercentage}% OFF
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Featured Product */}
                            <Controller
                                name="isFeatured"
                                control={control}
                                render={({ field }) => (
                                    <div
                                        className={`rounded-xl border p-4 transition-colors ${field.value
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-background"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="isFeatured"
                                                checked={Boolean(
                                                    field.value
                                                )}
                                                onCheckedChange={(checked) =>
                                                    field.onChange(
                                                        checked === true
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="mt-0.5"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <label
                                                    htmlFor="isFeatured"
                                                    className="cursor-pointer text-sm font-medium leading-none"
                                                >
                                                    Featured Product
                                                </label>

                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Show this product in the
                                                    Featured Products section
                                                    on the home page.
                                                </p>
                                            </div>

                                            {field.value && (
                                                <Badge
                                                    variant="secondary"
                                                    className="shrink-0"
                                                >
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>

                                        {errors.isFeatured && (
                                            <div className="mt-2">
                                                <FieldError>
                                                    {
                                                        errors.isFeatured
                                                            .message
                                                    }
                                                </FieldError>
                                            </div>
                                        )}
                                    </div>
                                )}
                            />

                            {isFeatured && (
                                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                                    ✓ This product will appear in
                                    the Featured Products section on
                                    the home page.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>
                            Product Image
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Image preview */}
                        <div className="relative overflow-hidden rounded-xl border bg-muted/30">
                            {imagePreview ? (
                                <div className="relative aspect-square">
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="h-full w-full object-contain p-6"
                                    />

                                    {selectedImage && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute right-3 top-3"
                                            onClick={
                                                removeSelectedImage
                                            }
                                            disabled={isLoading}
                                        >
                                            <HugeiconsIcon
                                                icon={Cancel01Icon}
                                                size={18}
                                            />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                                        <HugeiconsIcon
                                            icon={ImageAdd01Icon}
                                            size={26}
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            No image selected
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Upload a product image
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* File input */}
                        <Field>
                            <FieldLabel htmlFor="image">
                                {isEdit
                                    ? "Change Image"
                                    : "Upload Image"}
                            </FieldLabel>

                            <FieldContent>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={
                                        handleImageChange
                                    }
                                    disabled={isLoading}
                                    className="cursor-pointer"
                                />

                                <FieldDescription>
                                    JPG, JPEG, PNG or WEBP.
                                    Maximum 5MB.
                                </FieldDescription>
                            </FieldContent>
                        </Field>

                        {/* Selected image */}
                        {selectedImage && (
                            <div className="rounded-lg bg-muted p-3 text-sm">
                                <p className="font-medium">
                                    Selected image
                                </p>

                                <p className="mt-1 truncate text-muted-foreground">
                                    {selectedImage.name}
                                </p>
                            </div>
                        )}

                        {/* Upload status */}
                        {uploadingImage && (
                            <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    size={18}
                                    className="animate-spin"
                                />

                                Uploading image to Cloudinary...
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={18}
                                        className="animate-spin"
                                    />

                                    {uploadingImage
                                        ? "Uploading Image..."
                                        : isEdit
                                            ? "Updating Product..."
                                            : "Creating Product..."}
                                </>
                            ) : isEdit ? (
                                "Update Product"
                            ) : (
                                "Create Product"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default ProductForm;