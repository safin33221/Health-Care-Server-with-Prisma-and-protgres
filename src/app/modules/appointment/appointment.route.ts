import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router()

router.post("/",
    auth(UserRole.PATIENT),
    AppointmentController.createAppointment)

export const AppointmentRoutes = router;