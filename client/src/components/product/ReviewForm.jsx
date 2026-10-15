import React, { useState } from "react";

const ReviewForm = ({ onSubmit, submitting = false }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!comment.trim()) return;

        onSubmit?.({
            rating,
            comment: comment.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Your Rating
                </label>

                <select
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor="review-comment"
                    className="mb-2 block text-sm font-medium"
                >
                    Your Review
                </label>

                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={5}
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
};

export default ReviewForm;