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
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const MobileNav = () => {
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

                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                    <SheetHeader>
                        <SheetTitle className="text-left text-xl font-bold">
                            SHOPLY
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

                        <MobileNavLink
                            to="/shop?category=electronics"
                            icon={ShoppingBag01Icon}
                            label="Electronics"
                        />

                        <MobileNavLink
                            to="/shop?category=clothing"
                            icon={ShoppingBag01Icon}
                            label="Clothing"
                        />

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

const MobileNavLink = ({ to, icon, label }) => {
    return (
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
};

export default MobileNav;