import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { issueObject } from "../utils/zod.objects";
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_OK } from "../utils/http.status";
import prisma from "../prisma.client";

// ---------- CREATE ISSUE ----------------
const createIssue: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = issueObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // DESTRUCTURE DATA
    const { title, description, key, status } = req.body;

    // CHECK STATUS
    if (status !== "todo" && status !== "inprogress" && status !== "done") {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid status, use 'todo', 'inprogress' or 'done'");
    }

    // CHECK PROJECT
    const project = await prisma.project.findUnique({
        where: {
            id: req.params.projectId,
        }
    })
    if (!project) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Project does not exist");
    }

    // CREATE ISSUE
    const issue = await prisma.issue.create({
        data: {
            title,
            description,
            key,
            status,
            project: {
                connect: {
                    id: req.params.projectId,
                }
            }
        }
    })

    // SEND RESPONSE
    res.status(HTTP_CREATED)
        .json({
            message: "Issue created successfully",
            issue,
        })
})

// ---------- GET ISSUE ----------------
const getIssue: RequestHandler = asyncHandler(async (req, res) => {
    // GET ISSUE
    const issue = await prisma.issue.findUnique({
        where: {
            id: req.params.issueId,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issue retrieved successfully",
            issue,
        })
})

// ---------- GET ALL ISSUES ----------------
const getIssues: RequestHandler = asyncHandler(async (req, res) => {
    // GET ISSUES
    const issues = await prisma.issue.findMany({
        where: {
            projectId: req.params.projectId,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issues retrieved successfully",
            issues,
        })
})

// ---------- DELETE ISSUE ----------------
const deleteIssue: RequestHandler = asyncHandler(async (req, res) => {
    // DELETE ISSUE
    await prisma.issue.delete({
        where: {
            id: req.params.issueId,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issue deleted successfully",
        })
})

// ---------- EXPORTS ----------------
export {
    createIssue,
    getIssue,
    getIssues,
    deleteIssue,
}