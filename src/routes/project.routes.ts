import express from "express";
import { createProject, getProjectsOfUser } from "../controllers/project.controllers";

const router = express.Router();

router.post("/create", createProject);
router.get("/get-all", getProjectsOfUser);

export default router;