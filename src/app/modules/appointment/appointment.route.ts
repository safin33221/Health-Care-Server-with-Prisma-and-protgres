import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router()

router.get("/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment)


router.post("/",
    auth(UserRole.PATIENT),
    AppointmentController.createAppointment)
router.post("/status/:id",
    auth(UserRole.DOCTOR, UserRole.ADMIN),
    AppointmentController.updateAppointmentStatus)

export const AppointmentRoutes = router;