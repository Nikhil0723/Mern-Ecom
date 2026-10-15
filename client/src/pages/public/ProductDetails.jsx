import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toast"

import {
  ArrowLeft01Icon,
  FavouriteIcon,
  ShoppingCartAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import ProductGallery from "@/components/product/ProductGallery";
import ProductPrice from "@/components/product/ProductPrice";
import ProductRating from "@/components/product/ProductRating";
import StockBadge from "@/components/product/StockBadge";
import QuantitySelector from "@/components/product/QuantitySelector";
import ReviewCard from "@/components/product/ReviewCard";
import ReviewForm from "@/components/product/ReviewForm";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice";
import { createProductReview, getProductById } from "@/services/productApi";
const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleReviewSubmit = async (reviewData) => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    try {
      setReviewSubmitting(true);

      await createProductReview(product._id, reviewData);

      const updatedProduct = await getProductById(product._id);
      setProduct(updatedProduct);

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit review."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const [quantity, setQuantity] = useState(1);

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  const isWishlisted = wishlistItems.some(
    (item) => item._id === product?._id
  );

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(id);

        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Card className="aspect-square animate-pulse" />

          <div className="space-y-5">
            <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded-md bg-muted" />
            <div className="h-24 animate-pulse rounded-md bg-muted" />
            <div className="h-12 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This product could not be found."}
          </p>

          <Button asChild className="mt-6">
            <Link to="/shop">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={18}
              />
              Back to Shop
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const image = product.image;

  const reviews = product.reviews || [];

  const isInStock = product.countInStock > 0;

  const maxQuantity = Number(product.countInStock) || 1;

  const handleQuantityChange = (value) => {
    setQuantity(
      Math.min(
        Math.max(value, 1),
        maxQuantity
      )
    );
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: quantity,
      })
    );
  };

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/shop">Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery
            images={[image]}
            productName={product.name}
          />

          {/* Product information */}
          <div className="flex flex-col">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {product.category}
                </Badge>

                {product.brand && (
                  <Badge variant="outline">
                    {product.brand}
                  </Badge>
                )}
              </div>
              {product.isFeatured && (
                <Badge variant="secondary" className="w-fit">
                  Featured Product
                </Badge>
              )}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <ProductRating
                  rating={product.rating}
                  numReviews={product.numReviews}
                />

                <StockBadge
                  countInStock={product.countInStock}
                />
              </div>

              <div className="mt-6">
                <ProductPrice
                  price={product.price}
                  originalPrice={product.originalPrice}
                />
              </div>

              <Separator className="my-6" />

              <p className="leading-7 text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="mt-8">
              <Separator className="mb-6" />

              {isInStock ? (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <QuantitySelector
                      quantity={quantity}
                      min={1}
                      max={maxQuantity}
                      onDecrease={() =>
                        handleQuantityChange(quantity - 1)
                      }
                      onIncrease={() =>
                        handleQuantityChange(quantity + 1)
                      }
                    />
                    <Button
                      size="lg"
                      className="flex-1 sm:flex-none "
                      onClick={handleAddToCart}
                    >
                      <HugeiconsIcon
                        icon={ShoppingCartAdd01Icon}
                        size={20}
                      />
                      Add to Cart
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      aria-label="Add to wishlist"
                      onClick={() => dispatch(toggleWishlist(product))}
                    >
                      <HugeiconsIcon
                        icon={FavouriteIcon}
                        size={20}
                        className={
                          isWishlisted
                            ? "fill-current text-red-500"
                            : ""
                        }
                      />
                    </Button>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {product.countInStock} available
                  </p>
                </>
              ) : (
                <Button
                  size="lg"
                  disabled
                  className="w-full sm:w-auto"
                >
                  Out of Stock
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details / Reviews */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">
                Description
              </TabsTrigger>

              <TabsTrigger value="reviews">
                Reviews ({product.numReviews || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="mt-6"
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold">
                  Product Description
                </h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {product.description}
                </p>
              </Card>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="mt-6"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No reviews yet.
                      </p>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                      />
                    ))
                  )}
                </div>

                <Card className="p-6">
                  <h2 className="mb-5 text-lg font-semibold">
                    Write a Review
                  </h2>

                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    submitting={reviewSubmitting}
                  />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;