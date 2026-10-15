import React from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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

const formSchema = z
    .object({
        password: z
            .string()
            .min(6, "Password must be at least 6 characters."),

        confirmPassword: z
            .string()
            .min(1, "Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

const ResetPasswordForm = ({ onSubmit, loading = false }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const handleSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Set a new password</CardTitle>

                <CardDescription>
                    Choose a new password for your SHOPLY account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="reset-password-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <FieldGroup>
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="reset-password">
                                        New password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="reset-password"
                                        type="password"
                                        placeholder="Enter your new password"
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
                                    <FieldLabel htmlFor="reset-confirm-password">
                                        Confirm new password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="reset-confirm-password"
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
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
                <Button
                    type="submit"
                    form="reset-password-form"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update password"}
                </Button>

                <Link
                    to="/login"
                    className="text-center text-sm font-medium text-primary hover:underline"
                >
                    Back to sign in
                </Link>
            </CardFooter>
        </Card>
    );
};

export default ResetPasswordForm;