
import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import { IJwtPayload } from "../../types/common";
const insertIntoDB = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user

    const result = await ReviewService.insertIntoDB(user as IJwtPayload, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User review created  successfully!",

        data: result
    })
})

export const ReviewController = {
    insertIntoDB
}