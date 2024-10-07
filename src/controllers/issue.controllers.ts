import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { issueObject } from "../utils/zod.objects";
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_OK } from "../utils/http.status";
import prisma from "../prisma.client";
import fs from "fs";
import path from "path";

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
    if (status) {
        if (status !== "todo" && status !== "inprogress" && status !== "done") {
            res.status(HTTP_BAD_REQUEST);
            throw new Error("Invalid status, use 'todo', 'inprogress' or 'done'");
        }
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

    // GET ISSUE ATTACHMENTS
    const attachment = await prisma.attachment.findFirst({
        where: {
            issueId: req.params.issueId,
        }
    });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issue retrieved successfully",
            issue,
            attachment,
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
    // DELETE COMMENTS
    await prisma.comment.deleteMany({
        where: {
            issueId: req.params.issueId,
        }
    })

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

// ---------- UPDATE ISSUE ----------------
const updateIssue: RequestHandler = asyncHandler(async (req, res) => {
    // DESTRUCTURE DATA
    const { title, description, key, status } = req.body;

    // CHECK STATUS
    if (status) {
        if (status !== "todo" && status !== "inprogress" && status !== "done") {
            res.status(HTTP_BAD_REQUEST);
            throw new Error("Invalid status, use 'todo', 'inprogress' or 'done'");
        }
    }

    // CHECK IF ISSUE EXISTS
    const issueExists = await prisma.issue.findUnique({
        where: {
            id: req.params.issueId,
        }
    })
    if (!issueExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Issue does not exist");
    }

    // UPDATE ISSUE
    const issue = await prisma.issue.update({
        where: {
            id: req.params.issueId,
        },
        data: {
            title: title || issueExists.title,
            description: description || issueExists.description,
            status: status || issueExists.status,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issue updated successfully",
            issue,
        })
})

// ---------- ATTACHMENT TO ISSUE ----------------
const attachToIssue: RequestHandler = asyncHandler(async (req, res) => {
    // CHECK IF FILE ATTACHED
    if (!req.file) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("No file attached");
    }

    // CHECK IF ISSUE EXISTS
    const issueExists = await prisma.issue.findUnique({
        where: {
            id: req.params.issueId,
        }
    })
    if (!issueExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Issue does not exist");
    }

    // CHECK IF PROJECT ADMIN
    const project_admin = await prisma.projectUsers.findFirst({
        where: {
            userId: req.user?.id,
            projectId: issueExists.projectId,
            role: "admin",
        }
    })
    if (!project_admin) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Only admin can attach files to issue");
    }

    // ATTACH FILE
    const attachment = await prisma.attachment.create({
        data: {
            fileName: req.file.filename,
            filePath: req.file.path,
            issue: {
                connect: {
                    id: req.params.issueId,
                }
            },
            user: {
                connect: {
                    id: req.user?.id,
                }
            }
        }
    });


    // SEND RESPONSE
    res.status(HTTP_CREATED)
        .json({
            message: "File attached to issue successfully",
            attachment,
        })
})

// ----------- DOWNLOAD ISSUE ATTACHMENT ----------------
const getIssueAttachment: RequestHandler = asyncHandler(async (req, res) => {
    // GET ISSUE ATTACHMENT
    const attachment = await prisma.attachment.findUnique({
        where: {
            id: req.params.attachmentId,
        }
    })
    if (!attachment) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Attachment does not exist");
    }

    // SEND RESPONSE
    return res.download(
        attachment?.filePath as string,
        attachment?.fileName as string
    );
})

// ---------- DELETE ISSUE ATTACHMENT ----------------
const deleteIssueAttachment: RequestHandler = asyncHandler(async (req, res) => {
    // CHECK IF ISSUE EXISTS
    const issueExists = await prisma.issue.findUnique({
        where: {
            id: req.params.issueId,
        }
    });
    if (!issueExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Issue does not exist");
    }

    // CHECK IF PROJECT ADMIN
    const project_admin = await prisma.projectUsers.findFirst({
        where: {
            userId: req.user?.id,
            projectId: issueExists.projectId,
            role: "admin",
        }
    })
    if (!project_admin) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Only admin can delete attachment");
    }

    // GET ISSUE ATTACHMENT
    const attachment = await prisma.attachment.findUnique({
        where: {
            id: req.params.attachmentId,
        }
    })
    if (!attachment) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Attachment does not exist");
    }

    // DELETE ISSUE ATTACHMENT
    await prisma.attachment.delete({
        where: {
            id: req.params.attachmentId,
        }
    });

    // DELETE THE ACTUAL FILE FROM UPLOADS FOLDER
    const filePath = path.join(__dirname, "../../uploads", attachment.fileName);
    fs.unlink(filePath, (err)=> {
        if (err) {
            console.log("Failed to delete file: ", err);
        } else {
            console.log("File deleted successfully from the folder itself");
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Issue attachment deleted successfully",
        })
})


// ---------- EXPORTS ----------------
export {
    createIssue,
    getIssue,
    getIssues,
    deleteIssue,
    updateIssue,
    attachToIssue,
    getIssueAttachment,
    deleteIssueAttachment,
}