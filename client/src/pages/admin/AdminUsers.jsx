import React, { useEffect, useMemo, useState } from "react";

import {
    getAdminUsers,
    deleteAdminUser,
} from "../../services/adminUserApi";

import { Button } from "@/components/ui/button";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    Search01Icon,
    UserIcon,
    Delete02Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [userToDelete, setUserToDelete] =
        useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminUsers();

            setUsers(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return users;
        }

        return users.filter((user) => {
            const name =
                user.name?.toLowerCase() || "";

            const email =
                user.email?.toLowerCase() || "";

            return (
                name.includes(value) ||
                email.includes(value)
            );
        });
    }, [users, search]);

    const handleDelete = async () => {
        if (!userToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteAdminUser(userToDelete._id);

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (user) =>
                        user._id !== userToDelete._id
                )
            );

            setUserToDelete(null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete user."
            );
        } finally {
            setDeleting(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        className="animate-spin"
                    />

                    Loading users...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Users
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage customers and administrators.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                <HugeiconsIcon
                                    icon={UserIcon}
                                    size={20}
                                />
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Users
                                </p>

                                <p className="text-2xl font-semibold">
                                    {users.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Customers
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                {
                                    users.filter(
                                        (user) => !user.isAdmin
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Administrators
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                {
                                    users.filter(
                                        (user) => user.isAdmin
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name or email..."
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users table */}
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>All Users</CardTitle>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {filteredUsers.length} user
                                {filteredUsers.length !== 1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>
                    </CardHeader>

                    <Separator />

                    <CardContent className="p-0">
                        {filteredUsers.length === 0 ? (
                            <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <HugeiconsIcon
                                        icon={UserIcon}
                                        size={22}
                                    />
                                </div>

                                <h3 className="mt-4 font-medium">
                                    No users found
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try changing your search.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-6 py-4 text-left font-medium">
                                                User
                                            </th>

                                            <th className="px-6 py-4 text-left font-medium">
                                                Role
                                            </th>

                                            <th className="px-6 py-4 text-left font-medium">
                                                Joined
                                            </th>

                                            <th className="px-6 py-4 text-right font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                                            <HugeiconsIcon
                                                                icon={UserIcon}
                                                                size={17}
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="font-medium">
                                                                {user.name}
                                                            </p>

                                                            <p className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {user.isAdmin ? (
                                                        <Badge>
                                                            Admin
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Customer
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {formatDate(
                                                        user.createdAt
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={deleting}
                                                        onClick={() =>
                                                            setUserToDelete(user)
                                                        }
                                                    >
                                                        <HugeiconsIcon
                                                            icon={Delete02Icon}
                                                            size={16}
                                                        />

                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete confirmation */}
            <AlertDialog
                open={Boolean(userToDelete)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setUserToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete user?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>
                                {userToDelete?.name}
                            </strong>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                                "Delete User"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AdminUsers;