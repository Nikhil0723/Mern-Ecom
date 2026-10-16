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

import { Checkbox } from "@/components/ui/checkbox";

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

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [showInNavbar, setShowInNavbar] = useState(false);
    const [navbarOrder, setNavbarOrder] = useState("0");

    // Fetch all categories
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

    // Reset form fields
    const resetForm = () => {
        setName("");
        setDescription("");
        setShowInNavbar(false);
        setNavbarOrder("0");
        setEditingCategory(null);
    };

    // Open create dialog
    const openCreateDialog = () => {
        resetForm();
        setError("");
        setDialogOpen(true);
    };

    // Open edit dialog
    const openEditDialog = (category) => {
        setEditingCategory(category);

        setName(category.name || "");
        setDescription(category.description || "");
        setShowInNavbar(category.showInNavbar ?? false);
        setNavbarOrder(String(category.navbarOrder ?? 0));

        setError("");
        setDialogOpen(true);
    };

    // Create or update category
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        const parsedNavbarOrder = Number(navbarOrder);

        if (
            showInNavbar &&
            (
                navbarOrder.trim() === "" ||
                !Number.isInteger(parsedNavbarOrder) ||
                parsedNavbarOrder < 0
            )
        ) {
            setError(
                "Navbar order must be a non-negative whole number."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const categoryData = {
                name: name.trim(),
                description: description.trim(),
                showInNavbar,
                navbarOrder: parsedNavbarOrder,
            };

            if (editingCategory) {
                const updatedCategory = await updateCategory(
                    editingCategory._id,
                    categoryData
                );

                setCategories((current) =>
                    current
                        .map((category) =>
                            category._id === editingCategory._id
                                ? updatedCategory
                                : category
                        )
                        .sort((a, b) =>
                            a.name.localeCompare(b.name)
                        )
                );
            } else {
                const newCategory = await createCategory(
                    categoryData
                );

                setCategories((current) =>
                    [...current, newCategory].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                );
            }

            setDialogOpen(false);
            resetForm();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDelete = async () => {
        if (!categoryToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteCategory(categoryToDelete._id);

            setCategories((current) =>
                current.filter(
                    (category) =>
                        category._id !== categoryToDelete._id
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

    // Loading state
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
                            Manage the product categories used across
                            your store and navigation menus.
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
                    <div
                        role="alert"
                        className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                    >
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

                {/* Categories list */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
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
                                    Create your first product category.
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
                                                            {category.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        {category.showInNavbar ? (
                                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                                                                In navbar · Order{" "}
                                                                {category.navbarOrder ?? 0}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                                                Hidden from navbar
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    openEditDialog(category)
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
                                                    setDeleteDialogOpen(true);
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

                        if (!open) {
                            resetForm();
                        }
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
                                ? "Update this category and its navbar settings."
                                : "Add a category to your store and optionally show it in the navbar."}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Category name */}
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
                                required
                            />
                        </div>

                        {/* Description */}
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
                                    setDescription(event.target.value)
                                }
                                placeholder="Short category description..."
                                rows={4}
                                disabled={saving}
                            />
                        </div>

                        {/* Navbar settings */}
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="category-show-in-navbar"
                                    checked={showInNavbar}
                                    onCheckedChange={(checked) =>
                                        setShowInNavbar(checked === true)
                                    }
                                    disabled={saving}
                                />

                                <div className="space-y-1">
                                    <label
                                        htmlFor="category-show-in-navbar"
                                        className="text-sm font-medium"
                                    >
                                        Show in navbar
                                    </label>

                                    <p className="text-sm text-muted-foreground">
                                        Display this category in the desktop
                                        and mobile navigation menus.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="category-navbar-order"
                                    className="text-sm font-medium"
                                >
                                    Navbar order
                                </label>

                                <Input
                                    id="category-navbar-order"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={navbarOrder}
                                    onChange={(event) =>
                                        setNavbarOrder(event.target.value)
                                    }
                                    disabled={saving || !showInNavbar}
                                />

                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first. Categories
                                    with the same order are sorted
                                    alphabetically.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={saving}>
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

            {/* Delete confirmation dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    if (!deleting) {
                        setDeleteDialogOpen(open);

                        if (!open) {
                            setCategoryToDelete(null);
                        }
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
                            <strong>{categoryToDelete?.name}</strong>?
                            <br />
                            Products currently using this category will keep
                            their existing category name.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
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