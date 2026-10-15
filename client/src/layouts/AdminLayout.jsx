import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";

import {
    Home01Icon,
    ShoppingBag01Icon,
    PackageIcon,
    UserIcon,
    Tag01Icon,
    DiscountTag01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const adminLinks = [
    {
        label: "Dashboard",
        path: "/admin",
        icon: Home01Icon,
    },
    {
        label: "Products",
        path: "/admin/products",
        icon: ShoppingBag01Icon,
    },
    {
        label: "Orders",
        path: "/admin/orders",
        icon: PackageIcon,
    },
    {
        label: "Users",
        path: "/admin/users",
        icon: UserIcon,
    },
    {
        label: "Categories",
        path: "/admin/categories",
        icon: Tag01Icon,
    },
    {
        label: "Offers",
        path: "/admin/offers",
        icon: Tag01Icon,
    },
    {
        label: "Coupons",
        path: "/admin/coupons",
        icon: DiscountTag01Icon,
    }
];

const AdminLayout = () => {
    return (
        <PageContainer className="py-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <aside>
                    <div className="mb-5">
                        <p className="text-sm font-medium text-primary">
                            Administration
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight">
                            Admin Panel
                        </h1>
                    </div>

                    <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                        {adminLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === "/admin"}
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

export default AdminLayout;