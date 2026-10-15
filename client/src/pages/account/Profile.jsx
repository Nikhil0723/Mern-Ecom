import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import ProfileForm from "@/components/account/ProfileForm";
import PageContainer from "@/components/layout/PageContainer";

import {
    getProfile,
    updateProfile,
} from "@/services/authApi";

import { setCredentials } from "@/store/authSlice";

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userInfo = useSelector(
        (state) => state.auth.userInfo
    );

    const [profile, setProfile] = useState(userInfo);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProfile();

                setProfile({
                    ...userInfo,
                    ...data,
                    token: userInfo?.token,
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate("/login", { replace: true });
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate, userInfo]);

    const handleUpdateProfile = async (data) => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                name: data.name,
                email: data.email,
            };

            if (data.password) {
                payload.password = data.password;
            }

            const updatedUser = await updateProfile(payload);

            const updatedCredentials = {
                ...userInfo,
                ...updatedUser,
                token: updatedUser.token || userInfo.token,
            };

            dispatch(setCredentials(updatedCredentials));

            setProfile(updatedCredentials);
            setSuccess("Your profile has been updated successfully.");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageContainer className="py-12">
                <div className="mx-auto max-w-2xl">
                    <Card>
                        <CardContent className="p-8">
                            <div className="space-y-4">
                                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                                <div className="h-10 animate-pulse rounded bg-muted" />
                                <div className="h-10 animate-pulse rounded bg-muted" />
                                <div className="h-10 animate-pulse rounded bg-muted" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">
                        My profile
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Manage your account information.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <ProfileForm
                    user={profile}
                    onSubmit={handleUpdateProfile}
                    loading={saving}
                />
            </div>
        </PageContainer>
    );
};

export default Profile;