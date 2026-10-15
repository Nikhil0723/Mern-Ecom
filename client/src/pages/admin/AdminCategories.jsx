import React, { useEffect, useState } from "react";

import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
} from "../../services/categoryApi";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

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
    Loading03Icon,
    Tag01Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [categoryToDelete, setCategoryToDelete] =
        useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCategories();

            setCategories(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setName("");
        setDescription("");
        setError("");
        setDialogOpen(true);
    };

    const openEditDialog = (category) => {
        setEditingCategory(category);
        setName(category.name || "");
        setDescription(
            category.description || ""
        );
        setError("");
        setDialogOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const categoryData = {
                name: name.trim(),
                description: description.trim(),
            };

            if (editingCategory) {
                const updatedCategory =
                    await updateCategory(
                        editingCategory._id,
                        categoryData
                    );

                setCategories((current) =>
                    current.map((category) =>
                        category._id ===
                            editingCategory._id
                            ? updatedCategory
                            : category
                    )
                );
            } else {
                const newCategory =
                    await createCategory(
                        categoryData
                    );

                setCategories((current) =>
                    [...current, newCategory].sort(
                        (a, b) =>
                            a.name.localeCompare(b.name)
                    )
                );
            }

            setDialogOpen(false);
            setName("");
            setDescription("");
            setEditingCategory(null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteCategory(
                categoryToDelete._id
            );

            setCategories((current) =>
                current.filter(
                    (category) =>
                        category._id !==
                        categoryToDelete._id
                )
            );

            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete category."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        className="animate-spin"
                    />

                    Loading categories...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Manage the product categories used
                            across your store.
                        </p>
                    </div>

                    <Button onClick={openCreateDialog} variant="outline">
                        <HugeiconsIcon
                            icon={PlusSignIcon}
                            size={18}
                        />

                        Add Category
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-muted">
                            <HugeiconsIcon
                                icon={Tag01Icon}
                                size={22}
                            />
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Categories
                            </p>

                            <p className="text-2xl font-semibold">
                                {categories.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            All Categories
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="p-0">
                        {categories.length === 0 ? (
                            <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <HugeiconsIcon
                                        icon={Tag01Icon}
                                        size={22}
                                    />
                                </div>

                                <h3 className="mt-4 font-medium">
                                    No categories yet
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first product
                                    category.
                                </p>

                                <Button
                                    className="mt-4"
                                    onClick={openCreateDialog}
                                >
                                    <HugeiconsIcon
                                        icon={PlusSignIcon}
                                        size={18}
                                    />

                                    Add Category
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {categories.map((category) => (
                                    <div
                                        key={category._id}
                                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    <HugeiconsIcon
                                                        icon={Tag01Icon}
                                                        size={17}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-medium">
                                                        {category.name}
                                                    </p>

                                                    {category.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {
                                                                category.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditDialog(
                                                        category
                                                    )
                                                }
                                            >
                                                <HugeiconsIcon
                                                    icon={PencilEdit02Icon}
                                                    size={16}
                                                />

                                                Edit
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setCategoryToDelete(
                                                        category
                                                    );

                                                    setDeleteDialogOpen(
                                                        true
                                                    );
                                                }}
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete02Icon}
                                                    size={16}
                                                />

                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit dialog */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!saving) {
                        setDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory
                                ? "Edit Category"
                                : "Create Category"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingCategory
                                ? "Update this category."
                                : "Add a new category to your store."}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="category-name"
                                className="text-sm font-medium"
                            >
                                Name
                            </label>

                            <Input
                                id="category-name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="e.g. Electronics"
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="category-description"
                                className="text-sm font-medium"
                            >
                                Description
                            </label>

                            <Textarea
                                id="category-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Short category description..."
                                rows={4}
                                disabled={saving}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setDialogOpen(false)
                                }
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <HugeiconsIcon
                                            icon={Loading03Icon}
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Saving...
                                    </>
                                ) : editingCategory ? (
                                    "Update Category"
                                ) : (
                                    "Create Category"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setDeleteDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Delete category?
                        </DialogTitle>

                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>
                                {categoryToDelete?.name}
                            </strong>
                            ?
                            <br />
                            Products currently using this category
                            will keep their existing category name.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialogOpen(false)
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <HugeiconsIcon
                                        icon={Loading03Icon}
                                        size={17}
                                        className="animate-spin"
                                    />

                                    Deleting...
                                </>
                            ) : (
                                "Delete Category"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminCategories;