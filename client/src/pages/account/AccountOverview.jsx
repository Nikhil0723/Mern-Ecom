import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "@/store/authSlice";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
    UserIcon,
    PackageIcon,
    ShoppingBag01Icon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const AccountOverview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userInfo = useSelector(
        (state) => state.auth.userInfo
    );

    const handleLogout = () => {
        dispatch(logout());
        navigate("/", { replace: true });
    };


    return (
        <div className="space-y-6">
            {/* Welcome */}
            <Card className="overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                Welcome back
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight">
                                {userInfo?.name || "Shopper"}
                            </h2>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Manage your account, orders and preferences.
                            </p>
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <HugeiconsIcon
                                icon={UserIcon}
                                size={28}
                                className="text-primary"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="transition-shadow hover:shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={PackageIcon}
                                    size={20}
                                />
                            </div>

                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                size={18}
                                className="text-muted-foreground"
                            />
                        </div>

                        <h3 className="mt-5 font-semibold">
                            My Orders
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            View your order history and track purchases.
                        </p>

                        <Button
                            asChild
                            variant="link"
                            className="mt-3 h-auto px-0"
                        >
                            <Link to="/orders">
                                View orders
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={16}
                                    className="ml-1"
                                />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={20}
                                />
                            </div>

                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                size={18}
                                className="text-muted-foreground"
                            />
                        </div>

                        <h3 className="mt-5 font-semibold">
                            Profile
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your personal information and password.
                        </p>

                        <Button
                            asChild
                            variant="link"
                            className="mt-3 h-auto px-0"
                        >
                            <Link to="/account/profile">
                                Edit profile
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={16}
                                    className="ml-1"
                                />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Account information */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">
                                Account information
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Your current account details.
                            </p>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                        >
                            <Link to="/account/profile">
                                Edit
                            </Link>
                        </Button>
                    </div>

                    <Separator className="my-5" />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Name
                            </p>

                            <p className="mt-1 font-medium">
                                {userInfo?.name || "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Email
                            </p>

                            <p className="mt-1 break-all font-medium">
                                {userInfo?.email || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Shopping */}
            <Card>
                <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <HugeiconsIcon
                                icon={ShoppingBag01Icon}
                                size={20}
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Continue shopping
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Discover products and find something you'll
                                love.
                            </p>
                        </div>
                    </div>

                    <Button asChild>
                        <Link to="/shop">
                            Browse shop
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Logout */}
            <div className="flex justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default AccountOverview;