import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    const token = searchParams.get("token");

    const handleResetPassword = async (data) => {
        try {
            setLoading(true);

            console.log("Reset token:", token);
            console.log("Reset password:", data);

            // API integration will be added when the backend
            // supports password reset.
            await new Promise((resolve) => setTimeout(resolve, 800));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create a new password"
            description="Choose a strong password for your account"
        >
            <ResetPasswordForm
                onSubmit={handleResetPassword}
                loading={loading}
            />
        </AuthLayout>
    );
};

export default ResetPassword;