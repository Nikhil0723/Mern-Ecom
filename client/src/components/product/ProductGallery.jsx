import React, { useState } from "react";

const ProductGallery = ({ images = [], name = "Product" }) => {
    const validImages = images.filter(Boolean);

    const [selectedImage, setSelectedImage] = useState(
        validImages[0] || "",
    );

    if (!validImages.length) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                No image available
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
                <img
                    src={selectedImage}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Thumbnails */}
            {validImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {validImages.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${selectedImage === image
                                    ? "border-primary"
                                    : "border-transparent"
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${name} ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;