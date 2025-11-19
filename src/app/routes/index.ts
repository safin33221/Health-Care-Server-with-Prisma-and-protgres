import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { scheduleRoute } from '../modules/schedule/schedule.route';
import { DoctorScheduleRoutes } from '../modules/doctorSchedule/doctorSchedule.route';
import { SpecialtiesRoutes } from '../modules/specialties/specialites.route';
import { DoctorRoutes } from '../modules/doctor/doctor.route';
import { AppointmentRoutes } from '../modules/appointment/appointment.route';



const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: authRoutes
    },
    {
        path: '/schedule',
        route: scheduleRoute
    },
    {
        path: '/doctor-schedule',
        route: DoctorScheduleRoutes
    },
    {
        path: '/specialties',
        route: SpecialtiesRoutes
    },
    {
        path: '/doctor',
        route: DoctorRoutes
    },
    {
        path: '/appointment',
        route: AppointmentRoutes
    },
];



moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;