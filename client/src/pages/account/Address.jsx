import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { getSavedAddress, saveAddress, removeSavedAddress } from "@/services/addressStorage";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

import {
  Location01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const addressSchema = z.object({
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
    .regex(
      /^\d{6}$/,
      "Please enter a valid 6-digit pincode"
    ),

  country: z
    .string()
    .min(2, "Please enter your country"),
});

const Address = () => {
  const [savedAddress, setSavedAddress] = useState(null);
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  useEffect(() => {
    const address = getSavedAddress();

    if (address) {
      setSavedAddress(address);
      reset(address);
    }
  }, [reset]);

  const handleSave = (data) => {
    saveAddress(data);
    setSavedAddress(data);
    setEditing(false);
  };

  const handleEdit = () => {
    if (savedAddress) {
      reset(savedAddress);
    }

    setEditing(true);
  };

  const handleDelete = () => {
    removeSavedAddress();
    setSavedAddress(null);

    reset({
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
  };

  if (!editing && savedAddress) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">
            Account
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Saved Address
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your default shipping address.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={20}
                  />
                </div>

                <div>
                  <CardTitle className="text-base">
                    Default shipping address
                  </CardTitle>

                  <Badge
                    variant="secondary"
                    className="mt-1"
                  >
                    Default
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border bg-muted/30 p-5 text-sm leading-6">
              <p className="font-medium">
                {savedAddress.address}
              </p>

              <p className="text-muted-foreground">
                {savedAddress.city},{" "}
                {savedAddress.state}
              </p>

              <p className="text-muted-foreground">
                {savedAddress.pincode}
              </p>

              <p className="text-muted-foreground">
                {savedAddress.country}
              </p>
            </div>

            <Separator className="my-5" />

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={handleEdit}
              >
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  size={17}
                  className="mr-2"
                />
                Edit address
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={17}
                  className="mr-2"
                />
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          Account
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight">
          {savedAddress ? "Edit Address" : "Add Address"}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Save your shipping address for faster checkout.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping address</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(handleSave)}
            className="space-y-5"
          >
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

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="city">
                  City
                </FieldLabel>

                <Input
                  id="city"
                  placeholder="City"
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
                  placeholder="State"
                  {...register("state")}
                />

                {errors.state && (
                  <FieldError>
                    {errors.state.message}
                  </FieldError>
                )}
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pincode">
                  Pincode
                </FieldLabel>

                <Input
                  id="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
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
                  placeholder="Country"
                  {...register("country")}
                />

                {errors.country && (
                  <FieldError>
                    {errors.country.message}
                  </FieldError>
                )}
              </Field>
            </div>

            <Separator />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {savedAddress && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset(savedAddress);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : "Save address"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Address;