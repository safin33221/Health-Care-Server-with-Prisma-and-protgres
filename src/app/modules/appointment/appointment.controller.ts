import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import { IJwtPayload } from "../../types/common";
import { JwtPayload } from "jsonwebtoken";

const createAppointment = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response, next: NextFunction) => {

    const user = req.user
    const result = await AppointmentService.createAppointment(user as IJwtPayload, req.body)


    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "user login successfully",
        data: result
    })
})

export const AppointmentController = {
    createAppointment
}