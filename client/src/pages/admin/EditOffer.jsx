import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import OfferForm from "../../components/admin/OfferForm";

import { getOffer } from "../../services/offerApi";

const EditOffer = () => {
    const { id } = useParams();

    const [offer, setOffer] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                setLoading(true);

                const data =
                    await getOffer(id);

                setOffer(data);
            } catch (err) {
                console.error(
                    "GET OFFER ERROR:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load offer."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                Loading offer...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="rounded-lg border p-6 text-center">
                Offer not found.
            </div>
        );
    }

    return (
        <OfferForm
            mode="edit"
            offer={offer}
        />
    );
};

export default EditOffer;