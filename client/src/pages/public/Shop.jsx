import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  FilterHorizontalIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import ProductGrid from "@/components/product/ProductGrid";
import useCategories from "@/hooks/useCategories";
import { getProducts } from "@/services/productApi";

const Shop = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const searchQuery =
    searchParams.get("search") || "";

  const categoryQuery =
    searchParams.get("category") || "";

  const brandQuery =
    searchParams.get("brand") || "";

  const sortQuery =
    searchParams.get("sort") || "default";

  const pageQuery =
    Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] =
    useState(searchQuery);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(pageQuery);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts({
          keyword: searchQuery || undefined,

          category:
            categoryQuery || undefined,

          brand:
            brandQuery || undefined,

          sort:
            sortQuery !== "default"
              ? sortQuery
              : undefined,

          page: pageQuery,

          limit: 12,
        });

        setProducts(data.products || []);

        setPage(data.page || 1);

        setPages(data.pages || 1);

        setTotal(data.total || 0);
      } catch (err) {
        console.error(
          "Failed to load products:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [
    searchQuery,
    categoryQuery,
    brandQuery,
    sortQuery,
    pageQuery,
  ]);

  const handleSearch = (event) => {
    event.preventDefault();

    const params =
      new URLSearchParams(searchParams);

    const value = searchInput.trim();

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.delete("page");

    setSearchParams(params);
  };

  const handleCategoryChange = (
    categoryName,
    checked
  ) => {
    const params =
      new URLSearchParams(searchParams);

    if (checked) {
      params.set(
        "category",
        categoryName
      );
    } else {
      params.delete("category");
    }

    // Reset pagination whenever
    // category changes.
    params.delete("page");

    setSearchParams(params);
  };

  const clearCategory = () => {
    const params =
      new URLSearchParams(searchParams);

    params.delete("category");
    params.delete("page");

    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    const params =
      new URLSearchParams(searchParams);

    if (value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.delete("page");

    setSearchParams(params);
  };
  const clearFilters = () => {
    setSearchInput("");

    setSearchParams({});
  };

  const goToPage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pages
    ) {
      return;
    }

    const params =
      new URLSearchParams(searchParams);

    if (nextPage === 1) {
      params.delete("page");
    } else {
      params.set(
        "page",
        String(nextPage)
      );
    }

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const filters = (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Categories
          </Label>

          {categoryQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCategory}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Loading categories */}
          {categoriesLoading && (
            <>
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />

                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </>
          )}

          {/* Category error */}
          {!categoriesLoading &&
            categoriesError && (
              <p className="text-sm text-destructive">
                {categoriesError}
              </p>
            )}

          {/* No categories */}
          {!categoriesLoading &&
            !categoriesError &&
            categories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No categories available.
              </p>
            )}

          {/* Backend categories */}
          {!categoriesLoading &&
            !categoriesError &&
            categories.length > 0 &&
            categories.map((category) => {
              const isSelected =
                categoryQuery.toLowerCase() ===
                category.name.toLowerCase();

              return (
                <div
                  key={category._id}
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(
                        category.name,
                        checked
                      )
                    }
                  />

                  <Label
                    htmlFor={`category-${category._id}`}
                    className="cursor-pointer font-normal"
                  >
                    {category.name}
                  </Label>
                </div>
              );
            })}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="mb-3 block text-sm font-semibold ">
          Sort by
        </Label>

        <RadioGroup
          value={sortQuery}
          onValueChange={
            handleSortChange
          }
          className="space-y-3 "
        >
          {/* Featured */}
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="default"
              id="sort-default"
            />

            <Label htmlFor="sort-default">
              Featured
            </Label>
          </div>

          {/* Newest */}
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="newest"
              id="sort-newest"
            />

            <Label htmlFor="sort-newest">
              Newest
            </Label>
          </div>

          {/* Price low */}
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="price_asc"
              id="sort-price-asc"
            />

            <Label htmlFor="sort-price-asc">
              Price: Low to High
            </Label>
          </div>

          {/* Price high */}
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="price_desc"
              id="sort-price-desc"
            />

            <Label htmlFor="sort-price-desc">
              Price: High to Low
            </Label>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="rating"
              id="sort-rating"
            />

            <Label htmlFor="sort-rating">
              Top Rated
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge
                variant="secondary"
                className="mb-3"
              >
                Shop
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Find something you love
              </h1>

              <p className="mt-2 text-muted-foreground">
                Browse our latest products
                and discover your next
                favorite.
              </p>
            </div>

            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="md:hidden"
                >
                  <HugeiconsIcon
                    icon={
                      FilterHorizontalIcon
                    }
                    size={18}
                  />

                  Filters
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[300px]"
              >
                <SheetHeader>
                  <SheetTitle>
                    Filters
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                  {filters}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-8 flex gap-2  "
        >
          <div className="relative flex-1 flex items-center ">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="pl-10 py-4 "
            />
          </div>

          <Button type="submit" className="p-4">
            Search
          </Button>
        </form>

        <div className="grid gap-8 md:grid-cols-[240px_1fr]">

          <aside className="hidden md:block">
            <Card className="sticky top-24 p-5">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">
                  Filters
                </h2>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
              </div>

              {filters}
            </Card>
          </aside>

          <section>

            {/* Product toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

              <div>
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? "Loading products..."
                    : `${total} products`}
                </p>

                {/* Active category */}
                {categoryQuery && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryQuery}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={
                        clearCategory
                      }
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Sort */}
              <Select
                value={sortQuery}
                onValueChange={
                  handleSortChange
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent className="bg-white">
                  <SelectItem value="default">
                    Featured
                  </SelectItem>

                  <SelectItem value="newest">
                    Newest
                  </SelectItem>

                  <SelectItem value="price_asc">
                    Price: Low to High
                  </SelectItem>

                  <SelectItem value="price_desc">
                    Price: High to Low
                  </SelectItem>

                  <SelectItem value="rating">
                    Top Rated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>


            {!error && (
              <ProductGrid
                products={products}
                loading={loading}
              />
            )}

            {!loading && error && (
              <Card className="flex flex-col items-center justify-center p-10 text-center">
                <h2 className="text-lg font-semibold">
                  Something went wrong
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {error}
                </p>

                <Button
                  className="mt-5"
                  size="md"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </Card>
            )}

            {!loading && !error && products.length > 0 && pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>

                <span className="px-3 text-sm text-muted-foreground">
                  Page {page} of {pages}
                </span>

                <Button
                  variant="outline"
                  size="lg"
                  disabled={page >= pages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  );
};

export default Shop;