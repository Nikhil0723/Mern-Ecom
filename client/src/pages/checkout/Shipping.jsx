import React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import PageContainer from "@/components/layout/PageContainer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  saveShippingAddress,
} from "@/services/checkoutStorage";
import { getSavedAddress, saveAddress } from "@/services/addressStorage";
const shippingSchema = z.object({
  address: z
    .string()
    .min(5, "Please enter your complete address"),

  city: z
    .string()
    .min(2, "Please enter your city"),

  state: z
    .string()
    .min(2, "Please enter your state"),

  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),

  country: z
    .string()
    .min(2, "Please enter your country"),
});


const Shipping = () => {
  const navigate = useNavigate();

  const userInfo = useSelector((state) => state.auth.userInfo);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  useEffect(() => {
    const savedAddress = getSavedAddress();

    if (savedAddress) {
      reset(savedAddress);
    }
  }, [reset]);


  useEffect(() => {
    if (!userInfo) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/shipping",
        },
      });

      return;
    }

    if (!cartItems.length) {
      navigate("/cart", { replace: true });
    }
  }, [userInfo, cartItems.length, navigate]);

  const onSubmit = async (data) => {
    saveShippingAddress(data);
    saveAddress(data);
    navigate("/payment");
  };

  if (!userInfo || !cartItems.length) {
    return null;
  }



  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <CheckoutSteps currentStep="shipping" />

        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            Checkout
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Shipping address
          </h1>

          <p className="mt-2 text-muted-foreground">
            Where should we deliver your order?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery information</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="address">
                    Address
                  </FieldLabel>

                  <Input
                    id="address"
                    placeholder="House no., street, area"
                    {...register("address")}
                  />

                  {errors.address && (
                    <FieldError>
                      {errors.address.message}
                    </FieldError>
                  )}
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="city">
                      City
                    </FieldLabel>

                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register("city")}
                    />

                    {errors.city && (
                      <FieldError>
                        {errors.city.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="state">
                      State
                    </FieldLabel>

                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      {...register("state")}
                    />

                    {errors.state && (
                      <FieldError>
                        {errors.state.message}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="pincode">
                      Pincode
                    </FieldLabel>

                    <Input
                      id="pincode"
                      inputMode="numeric"
                      placeholder="400001"
                      {...register("pincode")}
                    />

                    {errors.pincode && (
                      <FieldError>
                        {errors.pincode.message}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="country">
                      Country
                    </FieldLabel>

                    <Input
                      id="country"
                      placeholder="India"
                      {...register("country")}
                    />

                    {errors.country && (
                      <FieldError>
                        {errors.country.message}
                      </FieldError>
                    )}
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex justify-end border-t pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Continue to payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Shipping;