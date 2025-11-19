import { IJwtPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { v4 as uuidv4 } from 'uuid'
import stripe from "../../helpers/stripe";


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

    const videoCallingId = uuidv4()
    const result = await prisma.$transaction(async (tnx) => {

        const appointmentData = await prisma.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: DoctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })
        const transactionId = uuidv4()
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



        return {paymentUrl : session.url}
    })
    return result
}

export const AppointmentService = {
    createAppointment
}