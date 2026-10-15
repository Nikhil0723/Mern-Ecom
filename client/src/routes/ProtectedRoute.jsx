import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
    const userInfo = useSelector((state) => state.auth.userInfo);
    const location = useLocation();

    if (!userInfo) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;