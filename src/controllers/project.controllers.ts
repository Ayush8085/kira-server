import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { HTTP_BAD_REQUEST, HTTP_CREATED, HTTP_OK } from "../utils/http.status";
import { projectObject } from "../utils/zod.objects";
import prisma from "../prisma.client";

// ---------- CREATE PROJECT ----------------
const createProject: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = projectObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // DESTRUCTURE DATA
    const { title, key } = req.body;

    // CREATE PROJECT
    const project = await prisma.project.create({
        data: {
            title,
            key,
            owner: {
                connect: {
                    id: req.user?.id,
                }
            }
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            }
        }
    });

    // ADD USER AS ADMIN TO PROJECT
    await prisma.admin.create({
        data: {
            project: {
                connect: {
                    id: project.id,
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
            message: "Project created successfully",
            project,
        })
})

// ---------- GET PROJECTS OF USER ----------------
const getProjectsOfUser: RequestHandler = asyncHandler(async (req, res) => {
    // GET ALL THE PROJECTS OF THAT USER
    const projects = await prisma.project.findMany({
        where: {
            owner: {
                id: req.user?.id,
            }
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            },
        }
    });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Projects retrieved successfully",
            projects,
        })
})

// ---------- GET PROJECT ----------------
const getProject: RequestHandler = asyncHandler(async (req, res) => {
    // GET PROJECT
    const project = await prisma.project.findUnique({
        where: {
            id: req.params.id,
            ownerId: req.user?.id,
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                }
            }
        }
    });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Project retrieved successfully",
            project,
        })
})

// ---------- DELETE PROJECT ----------------
const deleteProject: RequestHandler = asyncHandler(async (req, res) => {

    // DELETE BOTH ADMIN AND ISSUE TABLES
    await Promise.all([
        // DELETE FROM ADMIN TABLE
        prisma.admin.deleteMany({
            where: {
                projectId: req.params.id,
            }
        }),
        // DELETE FROM ISSUE TABLE
        prisma.issue.deleteMany({
            where: {
                projectId: req.params.id,
            }
        }),
    ])

    // DELETE PROJECT
    await prisma.project.delete({
        where: {
            id: req.params.id,
            ownerId: req.user?.id,
        }
    });

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Project deleted successfully",
        })
})

// ---------- IMPORTS ----------------
export {
    createProject,
    getProjectsOfUser,
    getProject,
    deleteProject,
}