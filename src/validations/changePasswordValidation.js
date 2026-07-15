import { z } from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, "Current password is required."),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(64, "Password cannot exceed 64 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,64}$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),

  confirmPassword: z
    .string()
    .min(1, "Please confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Confirmation password does not match the new password.",
  path: ["confirmPassword"],
});