import React, { useState } from "react";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authApi";
import { setCredentials } from "../../store/authSlice";

const Register = () => {
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleRegister = async (data) => {
        try {
            setLoading(true);
            setError("");

            const user = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            dispatch(setCredentials(user));

            navigate("/", { replace: true });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout
            title="Create your account"
            description="Join SHOPLY and start shopping today"
        >  {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
            </div>
        )}
            <RegisterForm
                onSubmit={handleRegister}
                loading={loading}
            />
        </AuthLayout>
    );
};

export default Register;