import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config";

// -------------- ACCESS TOKEN ----------------
const createAccessToken = ({ userId }: { userId: string }) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    })
}

export {
    createAccessToken,
};