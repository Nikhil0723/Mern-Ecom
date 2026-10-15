import React, { useState } from "react";

import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (data) => {
        try {
            setLoading(true);

            console.log("Forgot password:", data);

            // API integration will be added when the backend
            // supports password reset.
            await new Promise((resolve) => setTimeout(resolve, 800));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            description="We'll help you get back into your account"
        >
            <ForgotPasswordForm
                onSubmit={handleForgotPassword}
                loading={loading}
            />
        </AuthLayout>
    );
};

export default ForgotPassword;