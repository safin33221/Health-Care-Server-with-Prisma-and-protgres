import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/middleware";
import { doctorValidationSchedule } from "./doctorScheduleValidation";

const router = Router()

router.post("/",
    auth(UserRole.DOCTOR),
    validateRequest(doctorValidationSchedule.createDoctorScheduleValidation),
    DoctorScheduleController.createDoctorSchedule)

export const DoctorScheduleRoutes = router;