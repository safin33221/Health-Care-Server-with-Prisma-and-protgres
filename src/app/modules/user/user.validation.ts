import z from "zod";

const createPatientSchemaValidation = {
    password: z.string(),
    patient: {
        name: z.string({ error: "Name is required" }),
        email: z.string({ error: "Email is required" }),
        address: z.string().optional()
    }
}


export const userValidation = {
    createPatientSchemaValidation
}