import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getActiveOffers } from "../../services/offerApi";

const FALLBACK_OFFER = {
    title: "Discover something new",
    subtitle: "Welcome to Shoply",
    description:
        "Explore our latest products and find something you'll love.",
    image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85",
    buttonText: "Shop Now",
    buttonLink: "/shop",
};

const HomeOfferBanner = () => {
    const [offers, setOffers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const data = await getActiveOffers();

                setOffers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(
                    "Failed to load homepage offers:",
                    error
                );

                setOffers([]);
            } finally {
                setLoading(false);
            }
        };

        loadOffers();
    }, []);

    /*
     * CMS offers take priority.
     * If there are no active offers, show fallback offer.
     */
    const displayedOffers =
        !loading && offers.length > 0
            ? offers
            : [FALLBACK_OFFER];

    const currentOffer =
        displayedOffers[currentIndex] ||
        displayedOffers[0];

    /*
     * Auto rotate offers
     */
    useEffect(() => {
        if (displayedOffers.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((current) =>
                current === displayedOffers.length - 1
                    ? 0
                    : current + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [displayedOffers.length]);

    const goToPrevious = () => {
        setCurrentIndex((current) =>
            current === 0
                ? displayedOffers.length - 1
                : current - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((current) =>
            current === displayedOffers.length - 1
                ? 0
                : current + 1
        );
    };

    if (!currentOffer) {
        return null;
    }

    return (
        <div className="py-4 sm:py-6 lg:py-8">
            <div className="relative overflow-hidden rounded-2xl border bg-muted shadow-sm sm:rounded-3xl">
                {/* Background image */}
                <img
                    src={currentOffer.image}
                    alt={currentOffer.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Main dark overlay */}
                <div className="absolute inset-0 bg-black/45" />

                {/* Left-to-right gradient for readable text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Hero content */}
                <div className="relative z-10 flex min-h-[430px] items-center px-6 py-14 sm:min-h-[500px] sm:px-10 sm:py-16 lg:min-h-[560px] lg:px-16 xl:px-20">
                    <div className="max-w-xl text-white">
                        {/* Subtitle */}
                        <Badge
                            variant="secondary"
                            className="border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur-md hover:bg-white/15"
                        >
                            {currentOffer.subtitle ||
                                "Featured collection"}
                        </Badge>

                        {/* Title */}
                        <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                            {currentOffer.title}
                        </h1>

                        {/* Description */}
                        {currentOffer.description && (
                            <p className="mt-5 max-w-lg text-sm leading-7 text-white/80 sm:text-base lg:text-lg">
                                {currentOffer.description}
                            </p>
                        )}

                        {/* CTA */}
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="h-11 rounded-full px-6 font-semibold shadow-lg sm:h-12 sm:px-7"
                            >
                                <Link
                                    to={
                                        currentOffer.buttonLink ||
                                        "/shop"
                                    } 
                                    className="flex gap-1"
                                >
                                    {currentOffer.buttonText ||
                                        "Shop Now"}

                                    <HugeiconsIcon
                                        icon={
                                            ArrowUpRight01Icon
                                        }
                                        size={18}
                                    />
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="h-11 rounded-full px-5 text-white hover:bg-white/10 hover:text-white sm:h-12"
                            >
                                <Link to="/shop">
                                    Explore Shop
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Previous button */}
                {displayedOffers.length > 1 && (
                    <button
                        type="button"
                        onClick={goToPrevious}
                        aria-label="Previous offer"
                        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 sm:left-6 sm:h-11 sm:w-11"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft01Icon}
                            size={20}
                        />
                    </button>
                )}

                {/* Next button */}
                {displayedOffers.length > 1 && (
                    <button
                        type="button"
                        onClick={goToNext}
                        aria-label="Next offer"
                        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 sm:right-6 sm:h-11 sm:w-11"
                    >
                        <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            size={20}
                        />
                    </button>
                )}

                {/* Slider indicators */}
                {displayedOffers.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                        {displayedOffers.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() =>
                                    setCurrentIndex(index)
                                }
                                aria-label={`Go to offer ${index + 1
                                    }`}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? "w-8 bg-white"
                                        : "w-2 bg-white/50 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeOfferBanner;