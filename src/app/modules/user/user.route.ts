import express, { NextFunction, Request, Response } from "express"
import { UserController } from "./user.controller"
import { fileUploader } from "../../helpers/fileUpload"
import { userValidation } from "./user.validation"

const router = express.Router()


router.get(
    "/",
    UserController.getAllFromDB
)

router.post("/create-patient",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createPatientSchemaValidation.parse(JSON.parse(req.body.data))
        return UserController.createPatient(req, res, next)
    },
    UserController.createPatient
)


router.post(
    "/create-admin",

    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data))
        return UserController.createAdmin(req, res, next)
    }
);

router.post(
    "/create-doctor",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(req.body.data))
        req.body = userValidation.createDoctorValidationSchema.parse(JSON.parse(req.body.data))
        return UserController.createDoctor(req, res, next)
    }
);

export const userRoutes = router