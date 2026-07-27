import z from "zod";

export const registerUserValidation = z.object({
    fullName: z.string().min(5, { message: "Full name must be at least 5 characters long" }),
    userName: z.string().min(3, { message: "Username must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password cannot exceed 64 characters.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,64}$/,
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
    phoneNumber: z.string().min(11, { message: "Invalid phone number" }).max(12, { message: "Invalid phone number" }).optional(),
});