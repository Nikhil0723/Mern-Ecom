import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title, description }) => {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-12">
                <div className="w-full">
                    {/* Brand */}
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-2xl font-bold tracking-tight"
                        >
                            SHOPLY
                        </Link>

                        <h1 className="mt-6 text-2xl font-bold tracking-tight">
                            {title}
                        </h1>

                        {description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        © {new Date().getFullYear()} SHOPLY. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;