import express from "express";
import { changeRole, createProject, deleteProject, getProject, getProjectsOfUser, getProjectUser } from "../controllers/project.controllers";

const router = express.Router();

router.post("/create", createProject);
router.get("/get-all", getProjectsOfUser);
router.get("/get/:id", getProject);
router.get("/get-project-users/:id", getProjectUser);
router.delete("/delete/:id", deleteProject);
router.put("/change-role/:projectId", changeRole);

export default router;