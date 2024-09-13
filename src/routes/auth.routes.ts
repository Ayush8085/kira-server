import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controllers";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/logout", logoutUser);

export default router;