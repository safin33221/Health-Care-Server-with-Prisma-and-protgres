import { NextFunction, Request, Response } from "express"
import catchAsync from "../../shared/catchAsync"
import sendResponse from "../../shared/sendResponse"
import { ScheduleService } from "./schedule.service"
import pick from "../../helpers/pick"

const createSchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await ScheduleService.createSchedule(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "schedule create successfully",
        data: result
    })
})
const scheduleForDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const filter = pick(req.query, ["startDateTime", "endDateTime"])
    const result = await ScheduleService.scheduleForDoctor(filter, option)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "retrieve schedule for doctors",
        data: result
    })
})

export const ScheduleController = {
    createSchedule,
    scheduleForDoctor
}