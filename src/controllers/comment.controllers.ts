import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { commentObject } from "../utils/zod.objects";
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_OK } from "../utils/http.status";
import prisma from "../prisma.client";

// ---------- CREATE COMMENT ----------------
const createComment: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = commentObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // CREATE COMMENT
    const comment = await prisma.comment.create({
        data: {
            text: req.body.text,
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
    })

    // SEND RESPONSE
    res.status(HTTP_CREATED)
        .json({
            message: "Comment created successfully",
            comment,
        })
})

// ---------- GET ALL COMMENTS ----------------
const getComments: RequestHandler = asyncHandler(async (req, res) => {
    // GET COMMENTS
    const comments = await prisma.comment.findMany({
        where: {
            issueId: req.params.issueId,
        },
        include: {
            user: true,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Comments retrieved successfully",
            comments,
        })
})

// ---------- GET COMMENT ----------------
const getComment: RequestHandler = asyncHandler(async (req, res) => {
    // GET COMMENT
    const comment = await prisma.comment.findUnique({
        where: {
            id: req.params.commentId,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Comment retrieved successfully",
            comment,
        })
})

// ---------- UPDATE COMMENT ----------------
const updateComment: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { text } = req.body;
    if (!text) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Comment body could not be empty");
    }

    // CHECK COMMENT EXISTS
    const commentExists = await prisma.comment.findUnique({
        where: {
            id: req.params.commentId,
            userId: req.user?.id,
        }
    })
    if (!commentExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Comment does not exists or you are not the author of this comment");
    }

    // UPDATE COMMENT
    const comment = await prisma.comment.update({
        where: {
            id: req.params.commentId,
            userId: req.user?.id,
        },
        data: {
            text,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Comment updated successfully",
            comment,
        })
})

// ---------- DELETE COMMENT ----------------
const deleteComment: RequestHandler = asyncHandler(async (req, res) => {
    // DELETE COMMENT
    await prisma.comment.delete({
        where: {
            id: req.params.commentId,
        }
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Comment deleted successfully",
        })
})

// ---------- EXPORTS ----------------
export {
    createComment,
    getComment,
    getComments,
    updateComment,
    deleteComment,
}