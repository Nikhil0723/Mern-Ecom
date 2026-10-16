import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    ArrowRight01Icon,
    ArrowUpRight01Icon,
    ShoppingCart01Icon,
    UserIcon,
    FavouriteIcon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import PageContainer from "@/components/layout/PageContainer";
import ProductGrid from "@/components/product/ProductGrid";

import useCategories from "@/hooks/useCategories";

import {
    getProducts,
    getFeaturedProducts,
} from "../../services/productApi";

import HomeOfferBanner from "../../components/home/HomeOfferBanner";

const FALLBACK_CATEGORIES = [
    {
        _id: "fallback-electronics",
        name: "Electronics",
        description: "Smart devices and everyday technology.",
    },
    {
        _id: "fallback-fashion",
        name: "Fashion",
        description: "Fresh styles for every occasion.",
    },
    {
        _id: "fallback-shoes",
        name: "Shoes",
        description: "Comfortable footwear for every day.",
    },
    {
        _id: "fallback-accessories",
        name: "Accessories",
        description: "Complete your look with the right accessories.",
    },
];

const FALLBACK_PRODUCTS = [
    {
        _id: "fallback-product-1",
        name: "Everyday Essentials",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        brand: "UrbanNest",
        category: "Featured",
        description: "Discover our everyday essentials.",
        price: 1999,
        originalPrice: 2499,
        countInStock: 10,
        rating: 4.5,
        numReviews: 24,
    },
    {
        _id: "fallback-product-2",
        name: "Premium Lifestyle",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        brand: "UrbanNest",
        category: "Featured",
        description: "Premium products selected for you.",
        price: 2999,
        originalPrice: 3499,
        countInStock: 10,
        rating: 4.6,
        numReviews: 18,
    },
    {
        _id: "fallback-product-3",
        name: "Modern Collection",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
        brand: "UrbanNest",
        category: "Featured",
        description: "Modern products for modern lifestyles.",
        price: 2499,
        originalPrice: 2999,
        countInStock: 10,
        rating: 4.4,
        numReviews: 16,
    },
    {
        _id: "fallback-product-4",
        name: "Daily Comfort",
        image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80",
        brand: "UrbanNest",
        category: "Featured",
        description: "Simple products made for everyday life.",
        price: 1799,
        originalPrice: 2199,
        countInStock: 10,
        rating: 4.3,
        numReviews: 12,
    },
];

const Home = () => {

    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories();

    const displayedCategories =
        !categoriesLoading && categories.length > 0
            ? categories
            : FALLBACK_CATEGORIES;

  
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [latestProducts, setLatestProducts] = useState([]);

    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");


    useEffect(() => {
        const loadProducts = async () => {
            try {
                setProductsLoading(true);
                setProductsError("");

                const [featuredResponse, latestResponse] =
                    await Promise.all([
                        getFeaturedProducts(),
                        getProducts({
                            sort: "newest",
                            page: 1,
                            limit: 8,
                        }),
                    ]);

                setFeaturedProducts(
                    featuredResponse?.products ||
                    (Array.isArray(featuredResponse)
                        ? featuredResponse
                        : [])
                );

                setLatestProducts(
                    latestResponse?.products ||
                    (Array.isArray(latestResponse)
                        ? latestResponse
                        : [])
                );
            } catch (error) {
                console.error(
                    "Failed to load home products:",
                    error
                );

                setProductsError(
                    error.response?.data?.message ||
                    "Unable to load products."
                );

                setFeaturedProducts([]);
                setLatestProducts([]);
            } finally {
                setProductsLoading(false);
            }
        };

        loadProducts();
    }, []);


    const realLatestProducts = latestProducts;

    const displayedFeaturedProducts =
        featuredProducts.length > 0
            ? featuredProducts
            : realLatestProducts.length > 0
                ? realLatestProducts
                : FALLBACK_PRODUCTS;

    const displayedLatestProducts =
        latestProducts.length > 0
            ? latestProducts
            : FALLBACK_PRODUCTS;

    const showingFallbackFeatured =
        !productsLoading &&
        featuredProducts.length === 0 &&
        latestProducts.length === 0;

    const showingLatestFallback =
        !productsLoading &&
        latestProducts.length === 0;

    return (
        <div>

            <section className="relative overflow-hidden bg-muted/40">
                <PageContainer>
                    <HomeOfferBanner />
                </PageContainer>
            </section>

            <section className="py-16 sm:py-20">
                <PageContainer>
                    <SectionHeading
                        eyebrow="Shop by category"
                        title="Find what you're looking for"
                        description="Browse our categories and discover something new."
                        link="/shop"
                    />

                    {/* Loading */}
                    {categoriesLoading && (
                        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 4 }).map(
                                (_, index) => (
                                    <Card
                                        key={index}
                                        className="aspect-[4/5] animate-pulse"
                                    />
                                )
                            )}
                        </div>
                    )}

                    {/* Backend error but fallback categories available */}
                    {!categoriesLoading &&
                        categoriesError && (
                            <div className="mt-5 text-center text-xs text-muted-foreground">
                                Showing popular categories.
                            </div>
                        )}

                    {/* Categories */}
                    {!categoriesLoading && (
                        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {displayedCategories.map(
                                (category) => (
                                    <Link
                                        key={category._id}
                                        to={`/shop?category=${encodeURIComponent(
                                            category.name
                                        )}`}
                                        className="group"
                                    >
                                        <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <div className="flex aspect-[5/3] items-center justify-center bg-muted">
                                                <HugeiconsIcon
                                                    icon={Tag01Icon}
                                                    size={48}
                                                    className="text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary"
                                                />
                                            </div>

                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-20 text-white">
                                                <h3 className="font-semibold">
                                                    {category.name}
                                                </h3>

                                                {category.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-white/75">
                                                        {
                                                            category.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </PageContainer>
            </section>


            <section className="bg-muted/30 py-16 sm:py-20">
                <PageContainer>
                    <SectionHeading
                        eyebrow="Featured"
                        title={
                            featuredProducts.length > 0
                                ? "Popular right now"
                                : "Popular picks"
                        }
                        description="Discover products worth checking out."
                        link="/shop?sort=rating"
                    />

                    <div className="mt-10">
                        {productsLoading && <ProductLoading />}

                        {!productsLoading && (
                            <>
                                {showingFallbackFeatured && (
                                    <div className="mb-6 text-center">
                                        <Badge variant="secondary">
                                            Discover our collection
                                        </Badge>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Add featured products from the
                                            admin panel to customize this
                                            section.
                                        </p>
                                    </div>
                                )}

                                <ProductGrid
                                    products={
                                        displayedFeaturedProducts
                                    }
                                />
                            </>
                        )}
                    </div>
                </PageContainer>
            </section>


            <section className="py-16 sm:py-20">
                <PageContainer>
                    <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10 lg:px-16 lg:py-16">
                        <div className="relative z-10 max-w-xl">
                            <p className="text-sm font-medium uppercase tracking-wider opacity-80">
                                Shop the collection
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Upgrade your everyday.
                            </h2>

                            <p className="mt-4 max-w-lg text-sm leading-6 opacity-80 sm:text-base">
                                Explore our latest products and find
                                something you'll love.
                            </p>

                            <Button
                                asChild
                                variant="secondary"
                                className="mt-7"
                                size="lg"
                            >
                                <Link to="/shop" className="flex gap-1">
                                    Shop the collection

                                    <HugeiconsIcon
                                        icon={ArrowUpRight01Icon}
                                        size={18}
                                    />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </PageContainer>
            </section>


            <section className="py-16 sm:py-20">
                <PageContainer>
                    <SectionHeading
                        eyebrow="New arrivals"
                        title="Fresh picks for you"
                        description="Check out the latest additions to our collection."
                        link="/shop?sort=newest"
                    />

                    <div className="mt-10">
                        {productsLoading && <ProductLoading />}

                        {!productsLoading && (
                            <>
                                {showingLatestFallback && (
                                    <div className="mb-6 text-center">
                                        <Badge variant="secondary">
                                            UrbanNest collection
                                        </Badge>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Latest products will appear here
                                            as you add them to your store.
                                        </p>
                                    </div>
                                )}

                                <ProductGrid
                                    products={
                                        displayedLatestProducts
                                    }
                                />
                            </>
                        )}
                    </div>
                </PageContainer>
            </section>


            <section className="border-y bg-muted/30 py-14">
                <PageContainer>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <Feature
                            icon={ShoppingCart01Icon}
                            title="Easy Shopping"
                            description="Find the products you want quickly and easily."
                        />

                        <Feature
                            icon={FavouriteIcon}
                            title="Quality Products"
                            description="Discover products selected for your everyday needs."
                        />

                        <Feature
                            icon={UserIcon}
                            title="Customer Account"
                            description="Manage your orders, wishlist, and profile in one place."
                        />

                        <Feature
                            icon={ShoppingCart01Icon}
                            title="Simple Checkout"
                            description="A smooth and straightforward shopping experience."
                        />
                    </div>
                </PageContainer>
            </section>


            <section className="py-16 sm:py-20">
                <PageContainer>
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-sm font-medium text-primary">
                            Stay in the loop
                        </span>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight">
                            Get updates & exclusive offers
                        </h2>

                        <p className="mt-3 text-muted-foreground">
                            Subscribe to receive product updates,
                            special offers, and shopping inspiration.
                        </p>

                        <form
                            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
                            onSubmit={(event) =>
                                event.preventDefault()
                            }
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="h-11 flex-1 rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />

                            <button
                                type="submit"
                                className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </PageContainer>
            </section>
        </div>
    );
};

const SectionHeading = ({
    eyebrow,
    title,
    description,
    link,
}) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
                <p className="text-sm font-medium text-primary">
                    {eyebrow}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>

            {link && (
                <Button variant="link" className="border-none">
                    <Link
                        to={link}
                    >
                        View all

                    </Link>
                </Button>
            )}
        </div>
    );
};


const ProductLoading = () => {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <Card
                    key={index}
                    className="h-[360px] animate-pulse"
                />
            ))}
        </div>
    );
};


const Feature = ({
    icon,
    title,
    description,
}) => {
    return (
        <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HugeiconsIcon
                    icon={icon}
                    size={21}
                />
            </div>

            <div>
                <h3 className="text-sm font-semibold">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default Home;