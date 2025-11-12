import { NextFunction, Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import { DoctorScheduleService } from "./doctorSchedule.service"
import sendResponse from "../../shared/sendResponse"
import { IJwtPayload } from "../../types/common"
import { JwtPayload } from "jsonwebtoken"

const createDoctorSchedule = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response, next: NextFunction) => {
    const user = req.user
    const result = await DoctorScheduleService.createDoctorSchedule(user as IJwtPayload, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Schedule create successfully",
        data: result
    })
})

export const DoctorScheduleController = {
    createDoctorSchedule
}