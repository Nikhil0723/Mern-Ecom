import React from "react";
import { Link } from "react-router-dom";

import {
    Menu01Icon,
    Home01Icon,
    ShoppingBag01Icon,
    Tag01Icon,
    UserIcon,
    PackageIcon,
    FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

// Keep this consistent with Navbar.jsx
const categoryToSlug = (name = "") =>
    name
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const MobileNav = ({ categories = [] }) => {
    const getCategoryUrl = (category) => {
        const slug = category.slug || categoryToSlug(category.name);

        return `/shop?category=${encodeURIComponent(slug)}`;
    };

    return (
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <button
                        type="button"
                        className="rounded-full p-2.5 transition-colors hover:bg-muted"
                        aria-label="Open menu"
                    >
                        <HugeiconsIcon
                            icon={Menu01Icon}
                            size={22}
                            strokeWidth={1.8}
                        />
                    </button>
                </SheetTrigger>

                <SheetContent
                    side="left"
                    className="w-[280px] sm:w-[320px]"
                >
                    <SheetHeader>
                        <SheetTitle className="text-left text-xl font-bold">
                            UrbanNest
                        </SheetTitle>
                    </SheetHeader>

                    <div className="mt-8 flex flex-col gap-2">
                        <MobileNavLink
                            to="/"
                            icon={Home01Icon}
                            label="Home"
                        />

                        <MobileNavLink
                            to="/shop"
                            icon={ShoppingBag01Icon}
                            label="Shop"
                        />

                        {categories.slice(0, 3).map((category) => (
                            <MobileNavLink
                                key={category._id}
                                to={getCategoryUrl(category)}
                                icon={ShoppingBag01Icon}
                                label={category.name}
                            />
                        ))}

                        <MobileNavLink
                            to="/shop?sort=featured"
                            icon={Tag01Icon}
                            label="Deals"
                        />

                        <div className="my-3 border-t" />

                        <MobileNavLink
                            to="/account"
                            icon={UserIcon}
                            label="My Account"
                        />

                        <MobileNavLink
                            to="/orders"
                            icon={PackageIcon}
                            label="My Orders"
                        />

                        <MobileNavLink
                            to="/account/wishlist"
                            icon={FavouriteIcon}
                            label="Wishlist"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

const MobileNavLink = ({ to, icon, label }) => (
    <Link
        to={to}
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
    >
        <HugeiconsIcon
            icon={icon}
            size={20}
            strokeWidth={1.8}
            className="text-muted-foreground"
        />

        <span>{label}</span>
    </Link>
);

export default MobileNav;