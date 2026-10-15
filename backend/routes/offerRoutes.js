import express from "express";

import {
  getOffers,
  getActiveOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/active", getActiveOffers);

router
  .route("/")
  .get(getOffers)
  .post(protect, admin, createOffer);

router
  .route("/:id")
  .get(getOfferById)
  .put(protect, admin, updateOffer)
  .delete(protect, admin, deleteOffer);

export default router;