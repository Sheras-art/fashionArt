import z from "zod";
const orderValidationSchema = z.object({
    type: z.enum(["cart", "buyNow"], {
        error: "invalid checkout type"
    }),
    paymentMethod: z.string().min(2, "Payment method is required").max(100),
    shippingAddress: z.object({
        fullName: z.string().min(2).max(100),
        phoneNumber: z.string().min(11, "Phone number must be exactly 11 digits").max(11),
        country: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        city: z.string().min(2).max(100),
        street: z.string().min(2).max(100),
        postalCode: z.string().min(2).max(5),
    })
}).strip();

export default orderValidationSchema;