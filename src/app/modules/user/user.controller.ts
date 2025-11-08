import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createPatient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createPatient(req)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Patient create successfully",
        data: result
    })
})


const createAdmin = catchAsync(async (req: Request, res: Response) => {

    const result = await UserService.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin Created successfully!",
        data: result
    })
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {

    const result = await UserService.createDoctor(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Created successfully!",
        data: result
    })
});

// const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
//     const filters = pick(req.query, userFilterableFields) // searching , filtering
//     const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

//     const result = await UserService.getAllFromDB(filters, options);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "User retrive successfully!",
//         meta: result.meta,
//         data: result.data
//     })
// })


export const userController = {
    createPatient,
    createAdmin,
    createDoctor,

}