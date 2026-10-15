import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("userInfo");

const initialState = {
  userInfo: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;

      localStorage.setItem(
        "userInfo",
        JSON.stringify(action.payload)
      );
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;