import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";

import {
    UserIcon,
    PackageIcon,
    Location01Icon,
    FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const accountLinks = [
    {
        label: "Overview",
        path: "/account",
        icon: UserIcon,
    },
    {
        label: "Profile",
        path: "/account/profile",
        icon: UserIcon,
    },
    {
        label: "My Orders",
        path: "/orders",
        icon: PackageIcon,
    },
    {
        label: "Address",
        path: "/account/address",
        icon: Location01Icon,
    },
    {
        label: "Wishlist",
        path: "/account/wishlist",
        icon: FavouriteIcon,
    },
];

const AccountLayout = () => {
    return (
        <PageContainer className="py-8 sm:py-12">
            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <aside>
                    <div className="mb-5">
                        <p className="text-sm font-medium text-primary">
                            Account
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight">
                            My Account
                        </h1>
                    </div>

                    <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                        {accountLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === "/account"}
                                className={({ isActive }) =>
                                    [
                                        "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        "lg:w-full",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    ].join(" ")
                                }
                            >
                                <HugeiconsIcon
                                    icon={link.icon}
                                    size={18}
                                />

                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="min-w-0">
                    <Outlet />
                </main>
            </div>
        </PageContainer>
    );
};

export default AccountLayout;