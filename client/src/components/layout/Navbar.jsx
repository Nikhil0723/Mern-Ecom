import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    Search01Icon,
    FavouriteIcon,
    ShoppingCart01Icon,
    UserIcon,
    Logout01Icon,
    Settings01Icon,
    PackageIcon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { logout } from "@/store/authSlice";

import PageContainer from "./PageContainer";
import MobileNav from "./MobileNav";

const Navbar = () => {
    const userInfo = useSelector((state) => state.auth.userInfo);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/", { replace: true });
    };
    const cartItems = useSelector(
        (state) => state.cart.cartItems
    );

    const cartCount = cartItems.reduce(
        (total, item) => total + item.qty,
        0
    );
    const handleSearch = (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const search = formData.get("search")?.trim();

        if (!search) {
            navigate("/shop");
            return;
        }

        navigate(`/shop?search=${encodeURIComponent(search)}`);
    };

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <PageContainer>
                <div className="flex h-16 items-center justify-between gap-3">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="shrink-0 text-2xl font-bold tracking-tight"
                    >
                        SHOPLY
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-5 lg:flex">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors ${isActive("/")
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/shop"
                            className={`text-sm font-medium transition-colors ${isActive("/shop")
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Shop
                        </Link>

                        <Link
                            to="/shop?category=electronics"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Electronics
                        </Link>

                        <Link
                            to="/shop?category=clothing"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Clothing
                        </Link>

                        <Link
                            to="/shop?sort=featured"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Deals
                        </Link>
                    </nav>

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden flex-1 justify-center md:flex"
                    >
                        <div className="relative w-full max-w-md">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                strokeWidth={1.8}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                name="search"
                                type="search"
                                placeholder="Search products..."
                                className="h-10 rounded-full bg-muted/40 pl-10 pr-4 transition focus:bg-background"
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Wishlist */}
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="hidden rounded-full sm:inline-flex"
                        >
                            <Link
                                to="/account/wishlist"
                                aria-label="Wishlist"
                            >
                                <HugeiconsIcon
                                    icon={FavouriteIcon}
                                    size={21}
                                    strokeWidth={1.8}
                                />
                            </Link>
                        </Button>

                        {/* Account */}
                        {userInfo ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Account menu"
                                        className="rounded-full"
                                    >
                                        <HugeiconsIcon icon={UserIcon} size={20} />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56 bg-white">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {userInfo.name}
                                                </span>
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {userInfo.email}
                                                </span>
                                            </div>
                                        </DropdownMenuLabel>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => navigate("/account")}>
                                            <HugeiconsIcon icon={UserIcon} size={16} />
                                            <span>My Profile</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => navigate("/orders")}>
                                            <HugeiconsIcon icon={PackageIcon} size={16} />
                                            <span>My Orders</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => navigate("/account/wishlist")}
                                        >
                                            <HugeiconsIcon icon={FavouriteIcon} size={16} />
                                            <span>Wishlist</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    {userInfo.isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={() => navigate("/admin/")}
                                                className="cursor-pointer"
                                            >
                                                <HugeiconsIcon icon={Settings01Icon} size={16} />
                                                <span>Admin Dashboard</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}


                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <HugeiconsIcon icon={Logout01Icon} size={16} />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full"
                                onClick={() => navigate("/login")}
                                aria-label="Sign in"
                            >
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={21}
                                    strokeWidth={1.8}
                                />
                            </Button>
                        )}

                        {/* Cart */}
                        <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full"
                        >
                            <Link
                                to="/cart"
                                aria-label="Shopping cart"
                            >
                                <HugeiconsIcon
                                    icon={ShoppingCart01Icon}
                                    size={21}
                                    strokeWidth={1.8}
                                />

                                {cartCount > 0 && (
                                    <Badge
                                        className="absolute -right-1 -top-1 min-w-5 px-1 text-[10px]"
                                    >
                                        {cartCount}
                                    </Badge>
                                )}
                            </Link>
                        </Button>

                        {/* Mobile menu */}
                        <MobileNav />
                    </div>
                </div>
            </PageContainer>
        </nav>
    );
};

export default Navbar;