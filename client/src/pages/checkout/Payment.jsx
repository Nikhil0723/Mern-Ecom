import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import PageContainer from "@/components/layout/PageContainer";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

import {
  getPaymentMethod,
  getShippingAddress,
  savePaymentMethod,
} from "@/services/checkoutStorage";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ShoppingCart01Icon,
  ArrowRight01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const Payment = () => {
  const navigate = useNavigate();

  const userInfo = useSelector(
    (state) => state.auth.userInfo
  );

  const cartItems = useSelector(
    (state) => state.cart.cartItems
  );

  const [paymentMethod, setPaymentMethod] =
    React.useState(
      getPaymentMethod() || "COD"
    );

  useEffect(() => {
    if (!userInfo) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/payment",
        },
      });

      return;
    }

    if (!cartItems.length) {
      navigate("/cart", {
        replace: true,
      });

      return;
    }

    if (!getShippingAddress()) {
      navigate("/shipping", {
        replace: true,
      });
    }
  }, [
    userInfo,
    cartItems.length,
    navigate,
  ]);

  const handleContinue = () => {
    savePaymentMethod(paymentMethod);

    navigate("/placeorder");
  };

  if (
    !userInfo ||
    !cartItems.length ||
    !getShippingAddress()
  ) {
    return null;
  }

  const totalItems = cartItems.reduce(
    (total, item) => total + item.qty,
    0
  );

  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <CheckoutSteps currentStep="payment" />

        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Checkout
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Payment method
          </h1>

          <p className="mt-2 text-muted-foreground">
            Choose how you'd like to pay for your order.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>
                Choose payment method
              </CardTitle>
            </CardHeader>

            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="gap-4 "
              >
                <Label
                  htmlFor="cod"
                  className="flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value="COD"
                    id="cod"

                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Cash on Delivery
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Pay when your order is delivered.
                        </p>
                      </div>

                      <Badge variant="secondary">
                        Available
                      </Badge>
                    </div>
                  </div>
                </Label>

                <Label
                  htmlFor="razorpay"
                  className="flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value="RAZORPAY"
                    id="razorpay"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Razorpay
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Pay securely with UPI, cards, net banking and more.
                        </p>
                      </div>

                      <Badge variant="secondary">
                        Available
                      </Badge>
                    </div>
                  </div>
                </Label>
              </RadioGroup>



              <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted/50 p-4">
                <HugeiconsIcon
                  icon={SecurityCheckIcon}
                  className="h-5 w-5 shrink-0"
                />

                <p className="text-sm text-muted-foreground">
                  Your payment preference is saved securely
                  for this checkout.
                </p>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    navigate("/shipping")
                  }
                >
                  Back to shipping
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleContinue}
                >
                  Continue to review

                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-2 h-4 w-4"
                  />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                Order summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <HugeiconsIcon
                    icon={ShoppingCart01Icon}
                    className="h-4 w-4"
                  />

                  Items
                </div>

                <span className="font-medium">
                  {totalItems}
                </span>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  Final order total
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Your product prices, discount, tax,
                  shipping, and final total will be
                  verified and calculated securely on the
                  server during order placement.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment method
                </span>

                <Badge variant="secondary">
                  {paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Razorpay"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default Payment;