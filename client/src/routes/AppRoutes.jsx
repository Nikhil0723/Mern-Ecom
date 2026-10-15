import React from "react";
import { Routes, Route } from "react-router-dom";

import StoreLayout from "@/layouts/StoreLayout";
import Home from "@/pages/public/Home";
import Shop from "../pages/public/Shop";
import ProductDetails from "../pages/public/ProductDetails";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoutes";
import Profile from "../pages/account/Profile";
import Cart from "../pages/cart/Cart";
import Shipping from "../pages/checkout/Shipping";
import Payment from "../pages/checkout/Payment";
import PlaceOrder from "../pages/checkout/PlaceOrder";
import OrderDetails from "../pages/orders/OrderDetails";
import MyOrders from "../pages/orders/MyOrders";
import AccountOverview from "../pages/account/AccountOverview";
import AccountLayout from "../layouts/AccountLayout";
import Address from "../pages/account/Address";
import Wishlist from "../pages/account/Wishlist";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute from "./AdminRoutes";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import CreateProduct from "../pages/admin/CreateProduct";
import EditProduct from "../pages/admin/EditProduct";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminOrderDetails from "../pages/admin/AdminOrderDetails";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminOffers from "../pages/admin/AdminOffers";
import CreateOffer from "../pages/admin/CreateOffer";
import EditOffer from "../pages/admin/EditOffer";
import AdminCoupons from "../pages/admin/AdminCoupons";
import EditCoupon from "../components/admin/EditCoupon";
import CreateCoupon from "../pages/admin/CreateCoupon";

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route
                    path="/product/:id"
                    element={<ProductDetails />}
                />
                <Route path="/cart" element={<Cart />} />
            </Route>
            <Route element={<AuthRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<AccountLayout />}>
                    <Route path="/account" element={<AccountOverview />} />
                    <Route path="/account/profile" element={<Profile />} />
                    <Route path="/account/address" element={<Address />} />
                    <Route path="/account/wishlist" element={<Wishlist />} />
                </Route>
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/placeorder" element={<PlaceOrder />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/order/:id" element={<OrderDetails />} />
            </Route>

            <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route
                        path="/admin/products"
                        element={<AdminProducts />}
                    />
                    <Route
                        path="/admin/products/new"
                        element={<CreateProduct />}
                    />
                    <Route
                        path="/admin/products/:id/edit"
                        element={<EditProduct />}
                    />
                    <Route
                        path="/admin/orders"
                        element={<AdminOrders />}
                    />
                    <Route
                        path="/admin/orders/:id"
                        element={<AdminOrderDetails />}
                    />
                    <Route
                        path="/admin/users"
                        element={<AdminUsers />}
                    />
                    <Route
                        path="/admin/categories"
                        element={<AdminCategories />}
                    />
                    <Route
                        path="/admin/offers"
                        element={<AdminOffers />}
                    />
                    <Route
                        path="/admin/offers/new"
                        element={<CreateOffer />}
                    />

                    <Route
                        path="/admin/offers/:id/edit"
                        element={<EditOffer />}
                    />
                    <Route
                        path="/admin/coupons"
                        element={<AdminCoupons />}
                    />

                    <Route
                        path="/admin/coupons/new"
                        element={<CreateCoupon />}
                    />

                    <Route
                        path="/admin/coupons/:id/edit"
                        element={<EditCoupon />}
                    />
                </Route>
            </Route>

        </Routes>
    );
};

export default AppRoutes;