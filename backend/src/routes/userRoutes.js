// src/routes/userRoutes.js
import express from "express";
import { 
  joinEvent, 
  addGiftOption, 
  getMySecretFriend,
  getMyGifts,       // <-- NUEVO
  deleteGiftOption,
  changePassword
} from "../controllers/userController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/join", protect, joinEvent);
router.post("/gift", protect, addGiftOption);
router.get("/gifts", protect, getMyGifts);            // <-- NUEVO
router.get("/secret-friend", protect, getMySecretFriend);
router.delete("/gift/:id", protect, deleteGiftOption);
router.post("/change-password", protect, changePassword);

export default router;
