
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == "P2002") {
            message = "Duplicate Key Error",
                error = err.meta
        }
        if (error.coe == "P1000") {
            message = "Authentication failed against database server",
                error = err.meta
        }
        if (error.coe == "P2003") {
            message = "Foreign key constraint failed",
                error = err.meta
        }
    }

    res.status(statusCode).json({
        success,
        message,
        error
    })
};

export default globalErrorHandler;