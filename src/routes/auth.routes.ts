import express from "express";
import { getLoggedInUser, getRefreshToken, loginUser, logoutUser, registerUser } from "../controllers/auth.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/logout", logoutUser);
router.get("/get-log-in-user", authMiddleware, getLoggedInUser);
router.post('/refresh-token', getRefreshToken);

export default router;