import express from "express";
import { attachToIssue, createIssue, deleteIssue, deleteIssueAttachment, getIssue, getIssueAttachment, getIssues, updateIssue } from "../controllers/issue.controllers";
import { upload } from "../utils/upload.files";

const router = express.Router();

router.post("/create/:projectId", createIssue);
router.get("/get/:issueId", getIssue);
router.get("/get-all/:projectId", getIssues);
router.delete("/delete/:issueId", deleteIssue);
router.put("/update/:issueId", updateIssue);
router.post("/attachment/:issueId", upload.single("attachment"), attachToIssue);
router.get("/attachment/:attachmentId", getIssueAttachment);
router.delete("/attachment/:issueId/:attachmentId", deleteIssueAttachment);

export default router;