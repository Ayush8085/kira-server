import express from "express";
import { createProject, deleteProject, getProject, getProjectsOfUser } from "../controllers/project.controllers";

const router = express.Router();

router.post("/create", createProject);
router.get("/get-all", getProjectsOfUser);
router.get("/get/:id", getProject);
router.delete("/delete/:id", deleteProject);

export default router;