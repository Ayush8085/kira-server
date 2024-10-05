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
    await prisma.projectUsers.create({
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
            },
            role: "admin"
        }
    })

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
    const projects = await prisma.projectUsers.findMany({
        where: {
            userId: req.user?.id,
        },
        include: {
            project: {
                include: {
                    owner: true,
                }
            }
        }
    })

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
        prisma.projectUsers.deleteMany({
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

// ---------- GET PROJECT USERS ----------------
const getProjectUser: RequestHandler = asyncHandler(async (req, res) => {
    // GET ALL USERS
    const users = await prisma.user.findMany({});

    // GET PROJECT USERS
    const project_users = await prisma.projectUsers.findMany({
        where: {
            projectId: req.params.id,
        },
        include: {
            user: true
        }
    });

    // OTHER USERS
    const other_users = users.filter((user) => {
        return !project_users.some((project_user) => {
            return project_user.userId === user.id
        })
    })

    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Users retrieved successfully",
            project_users,
            other_users,
        })
})

// ---------- CHANGE ROLE ----------------
const changeRole: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { role, userId } = req.body;
    if (role !== "admin" && role !== "user" && role !== "other") {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data, use 'admin' or 'user' or 'other'");
    }

    // CHECK IF REQUESTING USER IS ADMIN
    const project_admin = await prisma.projectUsers.findFirst({
        where: {
            userId: req.user?.id,
            projectId: req.params.id,
            role: "admin",
        }
    })
    if (!project_admin) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Only admin can change roles");
    }

    // DELETE THE USER FROM THE PROJECT
    if (role === "other") {
        await prisma.projectUsers.delete({
            where: {
                userId_projectId: {
                    userId,
                    projectId: req.params.projectId,
                }
            }
        })
    }
    else {
        // CHANGE ROLE OR ADD THE USER TO THE PROJECT
        await prisma.projectUsers.upsert({
            where: {
                userId_projectId: {
                    userId,
                    projectId: req.params.projectId,
                }
            },
            update: {
                role
            },
            create: {
                role,
                user: {
                    connect: {
                        id: userId
                    }
                },
                project: {
                    connect: {
                        id: req.params.projectId
                    }
                }
            }
        })
    }

    // --------------
    // GET ALL USERS
    const users = await prisma.user.findMany({});

    // GET PROJECT USERS
    const project_users = await prisma.projectUsers.findMany({
        where: {
            projectId: req.params.id,
        },
        include: {
            user: true
        }
    });

    // OTHER USERS
    const other_users = users.filter((user) => {
        return !project_users.some((project_user) => {
            return project_user.userId === user.id
        })
    })
    // --------------


    // SEND RESPONSE
    res.status(HTTP_OK)
        .json({
            message: "Role changed successfully",
            project_users,
            other_users,
        })
})

// ---------- IMPORTS ----------------
export {
    createProject,
    getProjectsOfUser,
    getProject,
    deleteProject,
    getProjectUser,
    changeRole,
}