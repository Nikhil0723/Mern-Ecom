import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    ArrowLeft01Icon,
    Cancel01Icon,
    ImageAdd01Icon,
    Loading03Icon,
    EyeIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import {
    createOffer,
    updateOffer,
} from "../../services/offerApi";

import {
    uploadProductImage,
} from "../../services/adminProductApi";


const offerSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(2, "Offer title is required"),

        subtitle: z
            .string()
            .trim()
            .max(
                120,
                "Subtitle cannot exceed 120 characters"
            ),

        description: z
            .string()
            .trim()
            .max(
                300,
                "Description cannot exceed 300 characters"
            ),

        buttonText: z
            .string()
            .trim()
            .min(1, "Button text is required")
            .max(
                30,
                "Button text cannot exceed 30 characters"
            ),

        buttonLink: z
            .string()
            .trim()
            .min(1, "Button link is required"),

        startDate: z
            .string()
            .min(1, "Start date is required"),

        endDate: z
            .string()
            .min(1, "End date is required"),

        isActive: z
            .boolean()
            .default(true),
    })
    .refine(
        (data) => {
            if (!data.startDate || !data.endDate) {
                return true;
            }

            return (
                new Date(data.endDate) >
                new Date(data.startDate)
            );
        },
        {
            message:
                "End date must be later than start date",
            path: ["endDate"],
        }
    );


const formatDateTimeLocal = (date) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    const year = value.getFullYear();

    const month = String(
        value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        value.getDate()
    ).padStart(2, "0");

    const hours = String(
        value.getHours()
    ).padStart(2, "0");

    const minutes = String(
        value.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};


const OfferForm = ({
    offer = null,
    mode = "create",
}) => {
    const navigate = useNavigate();

    const isEdit = mode === "edit";

    const [selectedImage, setSelectedImage] =
        useState(null);

    const [imagePreview, setImagePreview] =
        useState(offer?.image || "");

    const [publicId, setPublicId] =
        useState(offer?.publicId || "");

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [previewMode, setPreviewMode] =
        useState("desktop");


    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(offerSchema),

        defaultValues: {
            title: offer?.title || "",
            subtitle: offer?.subtitle || "",
            description: offer?.description || "",
            buttonText:
                offer?.buttonText || "Shop Now",
            buttonLink:
                offer?.buttonLink || "/shop",

            startDate: formatDateTimeLocal(
                offer?.startDate
            ),

            endDate: formatDateTimeLocal(
                offer?.endDate
            ),

            isActive:
                offer?.isActive ?? true,
        },
    });

    const title = watch("title");
    const subtitle = watch("subtitle");
    const description = watch("description");
    const buttonText = watch("buttonText");
    const buttonLink = watch("buttonLink");


    useEffect(() => {
        if (!offer) {
            return;
        }

        reset({
            title: offer.title || "",
            subtitle: offer.subtitle || "",
            description: offer.description || "",
            buttonText:
                offer.buttonText || "Shop Now",
            buttonLink:
                offer.buttonLink || "/shop",

            startDate: formatDateTimeLocal(
                offer.startDate
            ),

            endDate: formatDateTimeLocal(
                offer.endDate
            ),

            isActive:
                offer.isActive ?? true,
        });

        setImagePreview(offer.image || "");
        setPublicId(offer.publicId || "");
        setSelectedImage(null);
    }, [offer, reset]);


    const handleImageChange = (event) => {
        const file =
            event.target.files?.[0];

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

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Image size must be less than 5MB."
            );

            event.target.value = "";
            return;
        }

        setSelectedImage(file);

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };


    const removeSelectedImage = () => {
        setSelectedImage(null);

        if (isEdit && offer?.image) {
            setImagePreview(offer.image);
            setPublicId(offer.publicId || "");
        } else {
            setImagePreview("");
            setPublicId("");
        }
    };

const onSubmit = async (data) => {
        try {
            setError("");
            setSuccess("");
            setSaving(true);

            let imageUrl =
                offer?.image || "";

            let imagePublicId =
                publicId || "";

            /* New offer requires image */
            if (!isEdit && !selectedImage) {
                setError(
                    "Please select a banner image."
                );

                setSaving(false);
                return;
            }

            /* Upload image */
            if (selectedImage) {
                setUploadingImage(true);

                const formData =
                    new FormData();

                formData.append(
                    "image",
                    selectedImage
                );

                const uploadResponse =
                    await uploadProductImage(
                        formData
                    );

                imageUrl =
                    uploadResponse.image;

                imagePublicId =
                    uploadResponse.public_id || "";

                setPublicId(imagePublicId);

                setUploadingImage(false);
            }

            if (!imageUrl) {
                setError(
                    "Banner image is required."
                );

                setSaving(false);
                return;
            }

            const offerData = {
                title: data.title.trim(),

                subtitle:
                    data.subtitle.trim(),

                description:
                    data.description.trim(),

                image: imageUrl,

                publicId: imagePublicId,

                buttonText:
                    data.buttonText.trim(),

                buttonLink:
                    data.buttonLink.trim(),

                startDate: new Date(
                    data.startDate
                ).toISOString(),

                endDate: new Date(
                    data.endDate
                ).toISOString(),

                isActive:
                    Boolean(data.isActive),
            };

            console.log(
                "OFFER DATA:",
                offerData
            );

            /* Update */
            if (isEdit) {
                await updateOffer(
                    offer._id,
                    offerData
                );

                setSuccess(
                    "Offer updated successfully."
                );

                setTimeout(() => {
                    navigate("/admin/offers");
                }, 700);

                return;
            }

            /* Create */
            await createOffer(
                offerData
            );

            setSuccess(
                "Offer created successfully."
            );

            setTimeout(() => {
                navigate("/admin/offers");
            }, 700);
        } catch (err) {
            console.error(
                "OFFER SAVE ERROR:",
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

    const previewWidth =
        previewMode === "desktop"
            ? "w-full"
            : "max-w-sm mx-auto";

    const previewStyle = useMemo(
        () => ({
            backgroundImage: imagePreview
                ? `linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.35), rgba(0,0,0,0.05)), url("${imagePreview}")`
                : undefined,
        }),
        [imagePreview]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="mb-2 -ml-3"
                        onClick={() =>
                            navigate("/admin/offers")
                        }
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={18}
                        />

                        Back to Offers
                    </Button>

                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit
                            ? "Edit Offer"
                            : "Create Offer"}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {isEdit
                            ? "Update your homepage banner and campaign."
                            : "Create a promotional banner for your homepage."}
                    </p>
                </div>

                {isEdit && (
                    <Badge variant="secondary">
                        Editing Offer
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

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-6 xl:grid-cols-[1fr_520px]"
            >

                <div className="space-y-6">
                    {/* Offer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Offer Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Title */}
                            <Field>
                                <FieldLabel htmlFor="title">
                                    Title
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        id="title"
                                        placeholder="Summer Sale"
                                        disabled={isLoading}
                                        {...register("title")}
                                    />

                                    <FieldDescription>
                                        Main heading displayed on
                                        the banner.
                                    </FieldDescription>

                                    {errors.title && (
                                        <FieldError>
                                            {errors.title.message}
                                        </FieldError>
                                    )}
                                </FieldContent>
                            </Field>

                            {/* Subtitle */}
                            <Field>
                                <FieldLabel htmlFor="subtitle">
                                    Subtitle
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        id="subtitle"
                                        placeholder="Up to 50% off"
                                        disabled={isLoading}
                                        {...register("subtitle")}
                                    />

                                    <FieldDescription>
                                        Short promotional message.
                                    </FieldDescription>

                                    {errors.subtitle && (
                                        <FieldError>
                                            {
                                                errors.subtitle
                                                    .message
                                            }
                                        </FieldError>
                                    )}
                                </FieldContent>
                            </Field>

                            {/* Description */}
                            <Field>
                                <FieldLabel htmlFor="description">
                                    Description
                                </FieldLabel>

                                <FieldContent>
                                    <Textarea
                                        id="description"
                                        placeholder="Shop our latest collection at amazing prices."
                                        rows={4}
                                        disabled={isLoading}
                                        {...register(
                                            "description"
                                        )}
                                    />

                                    <FieldDescription>
                                        Optional supporting text.
                                    </FieldDescription>

                                    {errors.description && (
                                        <FieldError>
                                            {
                                                errors.description
                                                    .message
                                            }
                                        </FieldError>
                                    )}
                                </FieldContent>
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Button */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Call To Action
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Button text */}
                                <Field>
                                    <FieldLabel htmlFor="buttonText">
                                        Button Text
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="buttonText"
                                            placeholder="Shop Now"
                                            disabled={isLoading}
                                            {...register(
                                                "buttonText"
                                            )}
                                        />

                                        {errors.buttonText && (
                                            <FieldError>
                                                {
                                                    errors.buttonText
                                                        .message
                                                }
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>

                                {/* Button link */}
                                <Field>
                                    <FieldLabel htmlFor="buttonLink">
                                        Button Link
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="buttonLink"
                                            placeholder="/shop"
                                            disabled={isLoading}
                                            {...register(
                                                "buttonLink"
                                            )}
                                        />

                                        <FieldDescription>
                                            Example: /shop or
                                            /shop?category=Clothing
                                        </FieldDescription>

                                        {errors.buttonLink && (
                                            <FieldError>
                                                {
                                                    errors.buttonLink
                                                        .message
                                                }
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Campaign Schedule
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Start */}
                                <Field>
                                    <FieldLabel htmlFor="startDate">
                                        Start Date
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="startDate"
                                            type="datetime-local"
                                            disabled={isLoading}
                                            {...register(
                                                "startDate"
                                            )}
                                        />

                                        {errors.startDate && (
                                            <FieldError>
                                                {
                                                    errors.startDate
                                                        .message
                                                }
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>

                                {/* End */}
                                <Field>
                                    <FieldLabel htmlFor="endDate">
                                        End Date
                                    </FieldLabel>

                                    <FieldContent>
                                        <Input
                                            id="endDate"
                                            type="datetime-local"
                                            disabled={isLoading}
                                            {...register(
                                                "endDate"
                                            )}
                                        />

                                        {errors.endDate && (
                                            <FieldError>
                                                {
                                                    errors.endDate
                                                        .message
                                                }
                                            </FieldError>
                                        )}
                                    </FieldContent>
                                </Field>
                            </div>

                            <Separator />

                            {/* Active */}
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <div
                                        className={`rounded-xl border p-4 transition-colors ${field.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="isActive"
                                                checked={Boolean(
                                                    field.value
                                                )}
                                                onCheckedChange={(
                                                    checked
                                                ) =>
                                                    field.onChange(
                                                        checked === true
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="mt-0.5"
                                            />

                                            <div>
                                                <label
                                                    htmlFor="isActive"
                                                    className="cursor-pointer text-sm font-medium"
                                                >
                                                    Active Offer
                                                </label>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    The banner can appear
                                                    on the homepage when
                                                    the current date is
                                                    within the campaign
                                                    schedule.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Banner Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Banner Image
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <Field>
                                <FieldLabel htmlFor="banner">
                                    {isEdit
                                        ? "Change Banner"
                                        : "Upload Banner"}
                                </FieldLabel>

                                <FieldContent>
                                    <Input
                                        id="banner"
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

                            {uploadingImage && (
                                <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Uploading banner to
                                    Cloudinary...
                                </div>
                            )}

                            {selectedImage && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={
                                        removeSelectedImage
                                    }
                                    disabled={isLoading}
                                >
                                    <HugeiconsIcon
                                        icon={Cancel01Icon}
                                        size={16}
                                    />

                                    Remove Selected Image
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>
                                        Banner Preview
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Preview how the banner will
                                        appear on your homepage.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={
                                            previewMode ===
                                                "desktop"
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            setPreviewMode(
                                                "desktop"
                                            )
                                        }
                                    >
                                        Desktop
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={
                                            previewMode ===
                                                "mobile"
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() =>
                                            setPreviewMode(
                                                "mobile"
                                            )
                                        }
                                    >
                                        Mobile
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div
                                className={`overflow-hidden rounded-2xl border bg-muted transition-all ${previewWidth}`}
                            >
                                <div
                                    className="relative flex min-h-[260px] items-center overflow-hidden bg-muted bg-cover bg-center p-8 sm:min-h-[320px]"
                                    style={previewStyle}
                                >
                                    {!imagePreview && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground">
                                            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-background/80">
                                                <HugeiconsIcon
                                                    icon={
                                                        ImageAdd01Icon
                                                    }
                                                    size={26}
                                                />
                                            </div>

                                            <p className="font-medium">
                                                No banner image
                                            </p>

                                            <p className="mt-1 text-sm">
                                                Upload an image to see
                                                the preview.
                                            </p>
                                        </div>
                                    )}

                                    {imagePreview && (
                                        <div className="relative z-10 max-w-xl text-white">
                                            {subtitle && (
                                                <Badge
                                                    variant="secondary"
                                                    className="mb-3 border-0 bg-white/15 text-white backdrop-blur"
                                                >
                                                    {subtitle}
                                                </Badge>
                                            )}

                                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                                {title ||
                                                    "Your Offer Title"}
                                            </h2>

                                            <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                                                {description ||
                                                    "Your promotional description will appear here."}
                                            </p>

                                            <Button
                                                type="button"
                                                className="mt-6"
                                            >
                                                {buttonText ||
                                                    "Shop Now"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <HugeiconsIcon
                                    icon={EyeIcon}
                                    size={16}
                                />

                                Live preview updates as you
                                edit the form.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Offer Summary
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Title
                                </span>

                                <span className="max-w-[60%] truncate font-medium">
                                    {title || "—"}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Button
                                </span>

                                <span className="font-medium">
                                    {buttonText || "—"}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Link
                                </span>

                                <span className="max-w-[60%] truncate font-medium">
                                    {buttonLink || "—"}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Image
                                </span>

                                <Badge
                                    variant={
                                        imagePreview
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {imagePreview
                                        ? "Uploaded"
                                        : "Missing"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button
                        type="submit"
                        form=""
                        className="hidden"
                    >
                        Save
                    </Button>
                </div>
            </form>

            {/* Fixed action bar */}
            <div className="sticky bottom-4 z-20 flex justify-end">
                <div className="flex w-full items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() =>
                            navigate("/admin/offers")
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        disabled={isLoading}
                        onClick={handleSubmit(
                            onSubmit
                        )}
                    >
                        {isLoading ? (
                            <>
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    size={18}
                                    className="animate-spin"
                                />

                                {uploadingImage
                                    ? "Uploading..."
                                    : isEdit
                                        ? "Updating..."
                                        : "Creating..."}
                            </>
                        ) : isEdit ? (
                            "Update Offer"
                        ) : (
                            "Create Offer"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OfferForm;