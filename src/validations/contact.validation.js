import z, { email } from "zod";

export const contactValidationSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    message: z.string().min(5).max(5000),
    subject: z.string().max(200).optional()
}).strip();