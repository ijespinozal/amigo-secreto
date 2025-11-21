// src/routes/userRoutes.js
import express from "express";
import { 
  joinEvent, 
  addGiftOption, 
  getMySecretFriend,
  getMyGifts,
  deleteGiftOption,
  changePassword,
  getEventDonations,
  getMyEventInfo,
  updateGiftOption
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/join", protect, joinEvent);
router.post("/gift", protect, addGiftOption);
router.get("/gifts", protect, getMyGifts);
router.get("/secret-friend", protect, getMySecretFriend);
router.delete("/gift/:id", protect, deleteGiftOption);
router.post("/change-password", protect, changePassword);
router.get("/donations", protect, getEventDonations);
router.get("/event-info", protect, getMyEventInfo);
router.put("/gift/:id", protect, updateGiftOption);

export default router;
