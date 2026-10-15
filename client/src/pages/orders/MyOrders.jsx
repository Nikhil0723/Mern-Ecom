import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PageContainer from "@/components/layout/PageContainer";
import { getMyOrders } from "@/services/orderApi";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  PackageIcon,
  ArrowRight01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                className="h-48 animate-pulse"
              />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Card>
            <CardContent className="flex flex-col items-center p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <HugeiconsIcon
                  icon={PackageIcon}
                  size={24}
                />
              </div>

              <h1 className="mt-4 text-xl font-semibold">
                Couldn't load your orders
              </h1>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {error}
              </p>

              <Button
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <PageContainer className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">
              Account
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              My Orders
            </h1>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon
                  icon={ShoppingBag01Icon}
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No orders yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                You haven't placed any orders yet.
                Start shopping and your orders will appear
                here.
              </p>

              <Button asChild className="mt-6">
                <Link to="/shop">
                  Start shopping
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    className="ml-2"
                  />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Account
          </p>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                View and track all your orders.
              </p>
            </div>

            <Badge variant="ghost" className="border-none text-sm hover-none" >
              {orders.length}{" "}
              {orders.length === 1 ? "order" : "orders"}
            </Badge>
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.createdAt);

            const formattedDate =
              orderDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

            const itemCount = order.orderItems.reduce(
              (total, item) => total + item.qty,
              0
            );

            return (
              <Card
                key={order._id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <CardHeader className="bg-muted/30">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Order #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </CardTitle>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Placed on {formattedDate}
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="link"
                      size="lg"
                      className="border-none"
                    >
                      <Link
                        to={`/order/${order._id}`}
                      >
                        View order

                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Items
                      </p>

                      <p className="mt-1 font-medium">
                        {itemCount}{" "}
                        {itemCount === 1
                          ? "item"
                          : "items"}
                      </p>
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Payment
                      </p>

                      <div className="mt-1">
                        <p className="font-medium">
                          {order.paymentMethod ===
                            "COD"
                            ? "Cash on Delivery"
                            : order.paymentMethod}
                        </p>

                        <Badge
                          variant={
                            order.isPaid
                              ? "default"
                              : "secondary"
                          }
                          className="mt-1"
                        >
                          {order.isPaid
                            ? "Paid"
                            : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Delivery
                      </p>

                      <div className="mt-1">
                        <Badge
                          variant={
                            order.isDelivered
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.isDelivered
                            ? "Delivered"
                            : "Processing"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Bottom */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon
                        icon={PackageIcon}
                        size={17}
                      />

                      <span>
                        {order.orderItems.length}{" "}
                        {order.orderItems.length === 1
                          ? "product"
                          : "products"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <span className="text-sm text-muted-foreground">
                        Total
                      </span>

                      <span className="text-xl font-bold">
                        ₹
                        {order.totalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default MyOrders;