import { createSlice } from "@reduxjs/toolkit";

const getWishlistFromStorage = () => {
  try {
    const wishlist = localStorage.getItem("wishlist");

    return wishlist ? JSON.parse(wishlist) : [];
  } catch {
    localStorage.removeItem("wishlist");
    return [];
  }
};

const saveWishlist = (items) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
};

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    items: getWishlistFromStorage(),
  },

  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;

      const existingItem = state.items.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        state.items = state.items.filter(
          (item) => item._id !== product._id
        );
      } else {
        state.items.push(product);
      }

      saveWishlist(state.items);
    },

    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => item._id !== action.payload
      );

      saveWishlist(state.items);
    },

    clearWishlist: (state) => {
      state.items = [];

      localStorage.removeItem("wishlist");
    },
  },
});

export const {
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;