import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";
import { IJwtPayload } from "../../types/common";
import pick from "../../helpers/pick";

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
const getMyAppointment = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response, next: NextFunction) => {

    const user = req.user
    const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const filter = pick(req.query, ["status", "paymentStatus"])
    const result = await AppointmentService.getMyAppointment(user as IJwtPayload, filter, option)


    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "appointment retrieve successfully",
        data: result
    })
})
const updateAppointmentStatus = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response, next: NextFunction) => {
    const id = req.params.id
    const user = req.user
    const { status } = req.body

    const result = await AppointmentService.updateAppointmentStatus(id, status, user as IJwtPayload)


    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "appointment status update successfully",
        data: result
    })
})

export const AppointmentController = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus
}