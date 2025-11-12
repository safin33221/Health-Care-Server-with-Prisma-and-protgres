import { prisma } from "../../shared/prisma"
import { IJwtPayload } from "../../types/common"

const createDoctorSchedule = async (user: IJwtPayload, payload: { schedulesIds: string[] }) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })
    // console.log({doctorData});


    const DoctorScheduleData = payload?.schedulesIds?.map(scheduleId => ({
        doctorId: doctorData.id,
        scheduleId
    }))

    return await prisma.doctorSchedule.createMany({
        data: DoctorScheduleData
    })



}


export const DoctorScheduleService = {
    createDoctorSchedule
}