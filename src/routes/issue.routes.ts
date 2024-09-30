import express from "express";
import { createIssue, deleteIssue, getIssue, getIssues } from "../controllers/issue.controllers";

const router = express.Router();

router.post("/create/:projectId", createIssue);
router.get("/get/:issueId", getIssue);
router.get("/get-all/:projectId", getIssues);
router.delete("/delete/:issueId", deleteIssue);

export default router;