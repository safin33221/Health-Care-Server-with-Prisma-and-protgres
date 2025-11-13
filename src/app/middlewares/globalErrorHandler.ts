
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == "P2002") {
            message = "Duplicate Key Error"
            error = err.meta
            statusCode = httpStatus.CONFLICT
        }
        if (error.coe == "P1000") {
            message = "Authentication failed against database server"
            error = err.meta
            statusCode = httpStatus.BAD_GATEWAY
        }
        if (error.coe == "P2003") {
            message = "Foreign key constraint failed"
            error = err.meta
              statusCode = httpStatus.BAD_REQUEST
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        message = "Validation Error"
        error = err.message
        statusCode = httpStatus.BAD_REQUEST
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        message = "Unknown Prisma error occurred"
        error = err.message
        statusCode = httpStatus.BAD_REQUEST 
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        message = "Failed to initialize prisma"
        error = err.message
        statusCode = httpStatus.BAD_REQUEST
    }

    res.status(statusCode).json({
        success,
        message,
        error
    })
};

export default globalErrorHandler;