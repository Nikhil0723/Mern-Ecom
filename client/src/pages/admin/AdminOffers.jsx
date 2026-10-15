import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    PlusSignIcon,
    PencilEdit02Icon,
    Delete02Icon,
    Tag01Icon,
    Loading03Icon,
    ImageAdd01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

import {
    getOffers,
    deleteOffer,
    updateOffer,
} from "../../services/offerApi";

const AdminOffers = () => {
    const navigate = useNavigate();

    const [offers, setOffers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    const [updatingId, setUpdatingId] =
        useState(null);

    /* ---------------------------------------------------------------------- */
    /* Fetch offers                                                           */
    /* ---------------------------------------------------------------------- */

    const fetchOffers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getOffers();

            setOffers(data);
        } catch (err) {
            console.error(
                "GET OFFERS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load offers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Search                                                                 */
    /* ---------------------------------------------------------------------- */

    const filteredOffers = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return offers;
        }

        return offers.filter((offer) => {
            return (
                offer.title
                    ?.toLowerCase()
                    .includes(keyword) ||
                offer.subtitle
                    ?.toLowerCase()
                    .includes(keyword)
            );
        });
    }, [offers, search]);

    /* ---------------------------------------------------------------------- */
    /* Stats                                                                  */
    /* ---------------------------------------------------------------------- */

    const stats = useMemo(() => {
        const now = new Date();

        const active = offers.filter(
            (offer) => offer.isActive
        ).length;

        const scheduled = offers.filter(
            (offer) =>
                offer.isActive &&
                new Date(offer.startDate) > now
        ).length;

        const expired = offers.filter(
            (offer) =>
                new Date(offer.endDate) < now
        ).length;

        return {
            total: offers.length,
            active,
            scheduled,
            expired,
        };
    }, [offers]);

    /* ---------------------------------------------------------------------- */
    /* Date helpers                                                           */
    /* ---------------------------------------------------------------------- */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const getOfferStatus = (offer) => {
        const now = new Date();

        const start = new Date(
            offer.startDate
        );

        const end = new Date(
            offer.endDate
        );

        if (!offer.isActive) {
            return {
                label: "Inactive",
                variant: "secondary",
            };
        }

        if (now < start) {
            return {
                label: "Scheduled",
                variant: "outline",
            };
        }

        if (now > end) {
            return {
                label: "Expired",
                variant: "destructive",
            };
        }

        return {
            label: "Live",
            variant: "default",
        };
    };

    /* ---------------------------------------------------------------------- */
    /* Toggle active                                                          */
    /* ---------------------------------------------------------------------- */

    const handleToggleActive = async (offer) => {
        try {
            setUpdatingId(offer._id);

            const updated = await updateOffer(
                offer._id,
                {
                    isActive: !offer.isActive,
                }
            );

            setOffers((current) =>
                current.map((item) =>
                    item._id === updated._id
                        ? updated
                        : item
                )
            );
        } catch (err) {
            console.error(
                "TOGGLE OFFER ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update offer."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Delete                                                                 */
    /* ---------------------------------------------------------------------- */

    const handleDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(true);

            await deleteOffer(
                deleteTarget._id
            );

            setOffers((current) =>
                current.filter(
                    (offer) =>
                        offer._id !==
                        deleteTarget._id
                )
            );

            setDeleteTarget(null);
        } catch (err) {
            console.error(
                "DELETE OFFER ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete offer."
            );
        } finally {
            setDeleting(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Loading                                                                */
    /* ---------------------------------------------------------------------- */

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={20}
                        className="animate-spin"
                    />

                    Loading offers...
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Offers & Banners
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage homepage promotional banners
                        and campaigns.
                    </p>
                </div>

                <Button variant="outline"
                    onClick={() =>
                        navigate("/admin/offers/new")
                    }
                >
                    <HugeiconsIcon
                        icon={PlusSignIcon}
                        size={18}
                    />

                    Create Offer
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    <span>{error}</span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError("")}
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={Tag01Icon}
                                    size={20}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Offers
                                </p>

                                <p className="text-2xl font-semibold">
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <span className="size-2.5 rounded-full bg-green-500" />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Active
                                </p>

                                <p className="text-2xl font-semibold">
                                    {stats.active}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={Tag01Icon}
                                    size={20}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Scheduled
                                </p>

                                <p className="text-2xl font-semibold">
                                    {stats.scheduled}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={Tag01Icon}
                                    size={20}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Expired
                                </p>

                                <p className="text-2xl font-semibold">
                                    {stats.expired}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-5">
                    <Input
                        placeholder="Search offers..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </CardContent>
            </Card>

            {/* Offers */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        All Offers
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {filteredOffers.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                                <HugeiconsIcon
                                    icon={ImageAdd01Icon}
                                    size={26}
                                />
                            </div>

                            <h3 className="font-medium">
                                No offers found
                            </h3>

                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                Create your first homepage
                                banner to start managing
                                promotions.
                            </p>

                            <Button
                                className="mt-5"
                                onClick={() =>
                                    navigate(
                                        "/admin/offers/new"
                                    )
                                }
                            >
                                <HugeiconsIcon
                                    icon={PlusSignIcon}
                                    size={18}
                                />

                                Create Offer
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOffers.map(
                                (offer) => {
                                    const status =
                                        getOfferStatus(
                                            offer
                                        );

                                    return (
                                        <div
                                            key={offer._id}
                                            className="overflow-hidden rounded-xl border"
                                        >
                                            <div className="grid lg:grid-cols-[280px_1fr_auto]">
                                                {/* Banner Preview */}
                                                <div className="relative aspect-[16/7] overflow-hidden bg-muted lg:aspect-auto lg:min-h-[160px]">
                                                    {offer.image ? (
                                                        <img
                                                            src={
                                                                offer.image
                                                            }
                                                            alt={
                                                                offer.title
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <HugeiconsIcon
                                                                icon={
                                                                    ImageAdd01Icon
                                                                }
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="absolute left-3 top-3">
                                                        <Badge
                                                            variant={
                                                                status.variant
                                                            }
                                                        >
                                                            {
                                                                status.label
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Information */}
                                                <div className="p-5">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-semibold">
                                                                {
                                                                    offer.title
                                                                }
                                                            </h3>

                                                            {offer.subtitle && (
                                                                <p className="mt-1 text-sm text-muted-foreground">
                                                                    {
                                                                        offer.subtitle
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Mobile active toggle */}
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                offer.isActive
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                offer._id
                                                            }
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    offer
                                                                )
                                                            }
                                                            className="lg:hidden"
                                                        >
                                                            {updatingId ===
                                                                offer._id ? (
                                                                <HugeiconsIcon
                                                                    icon={
                                                                        Loading03Icon
                                                                    }
                                                                    size={16}
                                                                    className="animate-spin"
                                                                />
                                                            ) : offer.isActive ? (
                                                                "Active"
                                                            ) : (
                                                                "Inactive"
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {offer.description && (
                                                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                                            {
                                                                offer.description
                                                            }
                                                        </p>
                                                    )}

                                                    <Separator className="my-4" />

                                                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                                                        <div>
                                                            <p className="text-muted-foreground">
                                                                Schedule
                                                            </p>

                                                            <p className="mt-1 font-medium">
                                                                {formatDate(
                                                                    offer.startDate
                                                                )}{" "}
                                                                —{" "}
                                                                {formatDate(
                                                                    offer.endDate
                                                                )}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-muted-foreground">
                                                                Button
                                                            </p>

                                                            <p className="mt-1 font-medium">
                                                                {
                                                                    offer.buttonText
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-end gap-2 border-t p-4 lg:flex-col lg:border-l lg:border-t-0 lg:p-5">
                                                    <Button
                                                        size="sm"
                                                        variant={
                                                            offer.isActive
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            offer._id
                                                        }
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                offer
                                                            )
                                                        }
                                                        className="hidden lg:flex"
                                                    >
                                                        {updatingId ===
                                                            offer._id ? (
                                                            <HugeiconsIcon
                                                                icon={
                                                                    Loading03Icon
                                                                }
                                                                size={16}
                                                                className="animate-spin"
                                                            />
                                                        ) : offer.isActive ? (
                                                            "Active"
                                                        ) : (
                                                            "Inactive"
                                                        )}
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/offers/${offer._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        <HugeiconsIcon
                                                            icon={
                                                                PencilEdit02Icon
                                                            }
                                                            size={18}
                                                        />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                offer
                                                            )
                                                        }
                                                    >
                                                        <HugeiconsIcon
                                                            icon={
                                                                Delete02Icon
                                                            }
                                                            size={18}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete offer?
                        </DialogTitle>

                        <DialogDescription>
                            This will permanently remove{" "}
                            <strong>
                                {deleteTarget?.title}
                            </strong>{" "}
                            from your offer CMS.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={deleting}
                            onClick={() =>
                                setDeleteTarget(null)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                        >
                            {deleting ? (
                                <>
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon
                                        icon={Delete02Icon}
                                        size={16}
                                    />

                                    Delete Offer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOffers;