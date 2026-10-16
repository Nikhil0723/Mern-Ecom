import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import { getCategories } from "@/services/categoryApi";

const categoryToSlug = (name = "") =>
    name
        .toLowerCase()
        .trim()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const getCategoryUrl = (category) =>
    `/shop?category=${encodeURIComponent(
        category.slug || categoryToSlug(category.name)
    )}`;

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();

                const data = Array.isArray(response)
                    ? response
                    : response?.categories ||
                    response?.data?.categories ||
                    response?.data ||
                    [];

                const categoryList = Array.isArray(data) ? data : [];

                setCategories(
                    categoryList
                        .filter((category) => category?.name)
                        .sort((a, b) =>
                            a.name.localeCompare(b.name)
                        )
                        .slice(0, 3)
                );
            } catch (error) {
                console.error("Failed to fetch footer categories:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    return (
        <footer className="mt-16 border-t bg-muted/30">
            <PageContainer>
                <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link
                            to="/"
                            className="text-xl font-bold tracking-tight"
                        >
                            UrbanNest
                        </Link>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                            Discover quality products at great prices. Shop
                            easily, securely, and confidently.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-semibold">Shop</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <Link
                                to="/shop"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                All Products
                            </Link>

                            {categories.map((category) => (
                                <Link
                                    key={category._id || category.id || category.name}
                                    to={getCategoryUrl(category)}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    {category.name}
                                </Link>
                            ))}

                            <Link
                                to="/shop?sort=featured"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Deals
                            </Link>
                        </div>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-sm font-semibold">Account</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <Link
                                to="/account"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                My Account
                            </Link>

                            <Link
                                to="/orders"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                My Orders
                            </Link>

                            <Link
                                to="/account/wishlist"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Wishlist
                            </Link>

                            <Link
                                to="/cart"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Cart
                            </Link>
                        </div>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold">Support</h3>

                        <div className="mt-4 flex flex-col gap-3">
                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Contact Us
                            </Link>

                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Shipping Information
                            </Link>

                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Returns & Refunds
                            </Link>

                            <Link
                                to="/"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} UrbanNest. All rights
                        reserved.
                    </p>

                    <p>Built with React & shadcn/ui</p>
                </div>
            </PageContainer>
        </footer>
    );
};

export default Footer;