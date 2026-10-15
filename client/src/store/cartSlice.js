import { createSlice } from "@reduxjs/toolkit";

const getCartFromStorage = () => {
  try {
    const cartItems = localStorage.getItem("cartItems");

    return cartItems ? JSON.parse(cartItems) : [];
  } catch {
    localStorage.removeItem("cartItems");
    return [];
  }
};

const initialState = {
  cartItems: getCartFromStorage(),
};

const saveCart = (cartItems) => {
  localStorage.setItem(
    "cartItems",
    JSON.stringify(cartItems)
  );
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;

      const existingItem = state.cartItems.find(
        (item) => item.product === product.product
      );

      if (existingItem) {
        existingItem.qty = Math.min(
          existingItem.qty + product.qty,
          product.countInStock
        );
      } else {
        state.cartItems.push(product);
      }

      saveCart(state.cartItems);
    },

    updateCartQuantity: (state, action) => {
      const { productId, qty } = action.payload;

      const item = state.cartItems.find(
        (item) => item.product === productId
      );

      if (item) {
        item.qty = Math.max(
          1,
          Math.min(qty, item.countInStock)
        );
      }

      saveCart(state.cartItems);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.product !== action.payload
      );

      saveCart(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];

      localStorage.removeItem("cartItems");
    },
  },
});

export const {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;