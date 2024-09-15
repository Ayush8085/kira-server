import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config";

// -------------- ACCESS TOKEN ----------------
const createAccessToken = ({ userId }: { userId: string }) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: "10s",
    })
}

// -------------- REFRESH TOKEN ----------------
const createRefreshToken = ({ userId }: { userId: string }) => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
        expiresIn: "1h",
    })
}

export {
    createAccessToken,
    createRefreshToken,
};