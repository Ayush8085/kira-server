import { ErrorRequestHandler } from "express";
import { NODE_ENV } from "../config";
import { HTTP_INTERNAL_SERVER_ERROR } from "../utils/http.status";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
    const statusCode = res.statusCode || HTTP_INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
        message: error.message,
        stack: NODE_ENV === "dev" ? error.stack : null,
    })
}