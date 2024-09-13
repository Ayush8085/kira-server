import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { registerObject } from "../utils/zod.objects";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../config";
import prisma from "../prisma.client";
import { createAccessToken } from "../utils/jwt.tokens";
import { HTTP_BAD_REQUEST, HTTP_CREATED } from "../utils/http.status";

// ---------- REGISTER USER ----------------
const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    // INPUT VALIDATION
    const { success } = registerObject.safeParse(req.body);
    if (!success) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Invalid data");
    }

    // DESTRUCTURE DATA
    const { username, email, password, password2 } = req.body;

    // CHECK IF EMAIL ALREADY EXISTS
    const userExists = await prisma.user.findUnique({
        where: {
            email,
        }
    });
    if (userExists) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("User already exists");
    }

    // MATCH PASSWORD
    if (password !== password2) {
        res.status(HTTP_BAD_REQUEST);
        throw new Error("Passwords do not match");
    }

    // HASH PASSWORD
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);


    // SAVE USER
    const user = await prisma.user.create({
        data: {
            username: username,
            email: email,
            password: hashPassword,
        },
    })

    // CREATE TOKEN
    const accessToken = createAccessToken({ userId: user.id });
    console.log("accessToken: ", accessToken);

    // SEND RESPONSE
    res.status(HTTP_CREATED)
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
        })
        .json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
})

// ---------- LOGIN USER ----------------
const loginUser: RequestHandler = asyncHandler(async (req, res) => {
    res.send("Login User")
})

// ---------- LOGOUT USER ----------------
const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
    res.send("Logout User")
})

export {
    loginUser,
    registerUser,
    logoutUser,
}