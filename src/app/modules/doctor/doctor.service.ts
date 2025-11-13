import { Prisma } from "@prisma/client";
;

import { prisma } from "../../shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";
import { IOptions, paginationHelper } from "../../helpers/paginationHelpers";
import { IDoctorUpdateInput } from "./doctor.interface";
import ApiError from "../../errors/apiErrors";
import httpStatus from 'http-status';
import { openai } from "../../helpers/openRouter";
import { extractJsonFromMessage } from "../../helpers/extractJsonFromMessage";

const getAllFromDB = async (filters: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andCondition: Prisma.DoctorWhereInput[] = []

    if (searchTerm) {
        andCondition.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (specialties && specialties.length > 0) {
        andCondition.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialties,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterCondition = Object.keys(filterData).map(key => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))
        andCondition.push(...filterCondition)
    }
    const whereCondition: Prisma.DoctorWhereInput = andCondition.length > 0 ? { AND: andCondition } : {}
    const result = await prisma.doctor.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    })

    const total = await prisma.doctor.count({
        where: whereCondition
    })

    return {
        meta: { page, limit, total },
        data: result
    }

}


const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {

    const { specialties, ...doctorData } = payload;

    return await prisma.$transaction(async (tnx) => {
        if (specialties && specialties.length > 0) {
            const deleteSpecialties = specialties.filter((specialty) => specialty.isDeleted)
            for (const specialty of deleteSpecialties) {
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

            const createSpecialties = specialties.filter((specialty) => !specialty.isDeleted)

            for (const specialty of createSpecialties) {
                await tnx.doctorSpecialties.createMany({
                    data: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }
        }
        const doctorInfo = await tnx.doctor.findUniqueOrThrow({
            where: {
                id: id
            }
        })

        const updatedData = await tnx.doctor.update({
            where: { id: doctorInfo.id },
            data: doctorData,
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true
                    }
                }
            }
        })

        return updatedData

    })




}
const getAiSuggestion = async (payload: { symptoms: string }) => {
    if (!(payload && payload.symptoms)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Symptom is required")
    }

    const doctors = await prisma.doctor.findMany({
        where: {
            isDeleted: false,

        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    })

    console.log("doctor data loaded ......\n");
    const prompt = `
You are a medical assistant AI. Based on the patient's symptoms, suggest the top 3 most suitable doctors.
Each doctor has specialties and years of experience.
Only suggest doctors who are relevant to the given symptoms.

Symptoms: ${payload.symptoms}

Here is the doctor list (in JSON):
${JSON.stringify(doctors, null, 2)}

Return your response in JSON format with full individual doctor data. 
`;


    console.log("analyzing ......\n");

    const completion = await openai.chat.completions.create({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful AI medical assistant that provides doctor suggestions.",
            },
            {
                role: 'user',
                content: prompt,
            }
        ],
    });
    const result = await extractJsonFromMessage(completion.choices[0].message)
    console.log(result);
    return result


}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB,
    getAiSuggestion
}