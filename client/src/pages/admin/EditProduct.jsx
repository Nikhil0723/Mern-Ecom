import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductForm from "../../components/admin/ProductForm";

import { getAdminProduct } from "../../services/adminProductApi";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAdminProduct(id);

                setProduct(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load product."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Loading product...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/products")}
                    className="text-sm underline"
                >
                    Back to products
                </button>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <ProductForm
            mode="edit"
            product={product}
        />
    );
};

export default EditProduct;