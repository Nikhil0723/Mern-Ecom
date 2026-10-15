import React, { useState } from "react";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authApi";
import { setCredentials } from "../../store/authSlice";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError("");

            console.log("LOGIN FORM DATA:", data);

            const user = await loginUser(data);

            console.log("LOGIN API RESPONSE:", user);

            dispatch(setCredentials(user));

            console.log("CREDENTIALS SAVED");

            const redirect = location.state?.from || "/";

            navigate(redirect, { replace: true });
        } catch (error) {
            console.error("LOGIN ERROR:", error);
            console.error("LOGIN ERROR RESPONSE:", error.response);
            console.error("LOGIN ERROR DATA:", error.response?.data);
            console.error("LOGIN ERROR MESSAGE:", error.message);

            setError(
                error.response?.data?.message ||
                "Unable to sign in. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to your SHOPLY account"
        >  {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
            </div>
        )}

            <LoginForm
                onSubmit={handleLogin}
                loading={loading}
            />
        </AuthLayout>
    );
};

export default Login;