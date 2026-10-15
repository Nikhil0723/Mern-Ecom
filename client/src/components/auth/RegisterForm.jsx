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
import { Separator } from "@/components/ui/separator";

const formSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters.")
            .max(50, "Name must be less than 50 characters."),

        email: z
            .string()
            .min(1, "Email is required.")
            .email("Please enter a valid email address."),

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

const RegisterForm = ({ onSubmit, loading = false }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
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
                <CardTitle>Create your account</CardTitle>

                <CardDescription>
                    Join SHOPLY and start shopping today.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="register-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <FieldGroup>
                        {/* Name */}
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="register-name">
                                        Full name
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="register-name"
                                        placeholder="John Doe"
                                        autoComplete="name"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Email */}
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="register-email">
                                        Email
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="register-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Password */}
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="register-password">
                                        Password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="register-password"
                                        type="password"
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        aria-invalid={fieldState.invalid}
                                    />

                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        {/* Confirm password */}
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="register-confirm-password">
                                        Confirm password
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="register-confirm-password"
                                        type="password"
                                        placeholder="Confirm your password"
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

            <CardFooter className="flex flex-col gap-5">
                <Button
                    type="submit"
                    form="register-form"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Creating account..." : "Create account"}
                </Button>

                <div className="flex w-full items-center gap-3">
                    <Separator className="flex-1" />

                    <span className="text-xs text-muted-foreground">
                        OR
                    </span>

                    <Separator className="flex-1" />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RegisterForm;