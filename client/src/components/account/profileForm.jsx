import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters.")
        .max(50, "Name must be less than 50 characters."),

    email: z
        .string()
        .min(1, "Email is required.")
        .email("Enter a valid email address."),

    password: z
        .string()
        .optional()
        .or(z.literal("")),

    confirmPassword: z
        .string()
        .optional()
        .or(z.literal("")),
}).refine(
    (data) => {
        if (!data.password && !data.confirmPassword) {
            return true;
        }

        return data.password === data.confirmPassword;
    },
    {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    }
);

const ProfileForm = ({
    user,
    onSubmit,
    loading = false,
}) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            password: "",
            confirmPassword: "",
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>
                    Update your account information and password.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="profile-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="profile-name">
                                        Full name
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="profile-name"
                                        autoComplete="name"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="profile-email">
                                        Email
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="profile-email"
                                        type="email"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <div className="border-t pt-6">
                            <p className="mb-4 text-sm font-medium">
                                Change password
                            </p>

                            <div className="space-y-5">
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="profile-password">
                                                New password
                                            </FieldLabel>

                                            <Input
                                                {...field}
                                                id="profile-password"
                                                type="password"
                                                placeholder="Leave blank to keep current password"
                                                autoComplete="new-password"
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="confirmPassword"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="profile-confirm-password">
                                                Confirm new password
                                            </FieldLabel>

                                            <Input
                                                {...field}
                                                id="profile-confirm-password"
                                                type="password"
                                                placeholder="Confirm your new password"
                                                autoComplete="new-password"
                                                aria-invalid={fieldState.invalid}
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            form="profile-form"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
};

export default ProfileForm;