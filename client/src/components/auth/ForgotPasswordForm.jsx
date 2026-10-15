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

const formSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required.")
        .email("Please enter a valid email address."),
});

const ForgotPasswordForm = ({ onSubmit, loading = false }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Forgot your password?</CardTitle>

                <CardDescription>
                    Enter your email address and we'll help you get
                    back into your account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="forgot-password-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="forgot-password-email">
                                        Email
                                    </FieldLabel>

                                    <Input
                                        {...field}
                                        id="forgot-password-email"
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
                    </FieldGroup>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
                <Button
                    type="submit"
                    form="forgot-password-form"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send reset link"}
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

export default ForgotPasswordForm;