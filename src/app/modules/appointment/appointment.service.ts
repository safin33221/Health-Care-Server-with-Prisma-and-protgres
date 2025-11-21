import { IJwtPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { nanoid } from 'nanoid'
import stripe from "../../helpers/stripe";
import { paginationHelper } from "../../helpers/paginationHelpers";
import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import ApiError from "../../errors/apiErrors";
import httpStatusCode from "http-status"

const createAppointment = async (user: IJwtPayload, payload: { doctorId: string, scheduleId: string }) => {


    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const DoctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    })

    const schedule = await prisma.doctorSchedule.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBlocked: false
        }
    })

    const videoCallingId = nanoid()
    const result = await prisma.$transaction(async (tnx) => {

        const appointmentData = await prisma.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: DoctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })
        const transactionId = nanoid()
        await tnx.doctorSchedule.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: DoctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBlocked: true
            }
        })
        const paymentData = await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: DoctorData.appointmentFee,
                transactionId: transactionId
            }
        })



        //Stripe Payment instigation

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'bdt',
                        product_data: {
                            name: `Appointment with Dr. ${DoctorData.name}`,
                        },
                        unit_amount: DoctorData.appointmentFee * 100
                    },
                    quantity: 1
                }
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `http://safayet-hossan.vercel.app`,
            cancel_url: `http://safayet-hossan.vercel.app/blogs`
        });
        console.log(session);



        return { paymentUrl: session.url }
    })
    return result
}

const getMyAppointment = async (user: IJwtPayload, filter: any, option: any) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(option)
    const { ...filterData } = filter
    const andCondition: Prisma.AppointmentWhereInput[] = []

    if (user.role === "PATIENT") {
        andCondition.push({
            patient: {
                email: user.email
            }
        })
    }
    if (user.role === "DOCTOR") {

        andCondition.push({
            doctor: {
                email: user.email
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key]

            }
        }))
        andCondition.push(...filterConditions)
    }

    const whereConditions: Prisma.AppointmentWhereInput = andCondition.length > 0 ? { AND: andCondition } : {}

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: user.role === "DOCTOR" ? {
            patient: true,
            schedule: true
        } : {
            doctor: true,
            schedule: true
        }
    })

    const total = await prisma.appointment.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page, limit,

        },
        data: result
    }



}

const updateAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IJwtPayload) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    })

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email)) {
            throw new ApiError(httpStatusCode.BAD_REQUEST, "This is not your appointment")
        }
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status: appointmentStatus
        }
    })


}


const cancelUnpaidAppointment = async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)
    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    })

    const cancelUnpaidAppointmentIds = unpaidAppointments.map(appointment => appointment.id)

    return await prisma.$transaction(async (tnx) => {
        await prisma.payment.deleteMany({
            where: {
                appointmentId: {
                    in: cancelUnpaidAppointmentIds
                }
            }
        })

        await prisma.appointment.deleteMany({
            where: {
                id: {
                    in: cancelUnpaidAppointmentIds
                }
            }
        })

        for (const unpaidAppointment of unpaidAppointments) {
            await tnx.doctorSchedule.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId
                    }
                },
                data: {
                    isBlocked: false
                }
            })
        }
    })
}

export const AppointmentService = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus,
    cancelUnpaidAppointment
}