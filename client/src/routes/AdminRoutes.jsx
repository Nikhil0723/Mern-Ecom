import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
    const userInfo = useSelector(
        (state) => state.auth.userInfo
    );

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    if (!userInfo.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;