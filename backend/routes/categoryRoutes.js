import express from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.route("/").get(getCategories);

router
  .route("/:id")
  .get(getCategoryById);

// Admin
router
  .route("/")
  .post(protect, admin, createCategory);

router
  .route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;