import { z } from "zod";

export const requestSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address").max(100, "Email must be 100 characters or less"),
  phone: z.string().trim().max(30, "Phone number must be 30 characters or less").optional().or(z.literal("")),
  location: z.string().trim().min(1, "City and country is required").max(100, "Location must be 100 characters or less"),
  contactPreference: z.enum(["email", "whatsapp", "phone"], {
    errorMap: () => ({ message: "Please select a valid contact method" }),
  }),
  category: z.string().trim().min(1, "Category is required").max(50, "Category must be 50 characters or less"),
  request: z.string().trim().min(1, "Sourcing request is required").max(200, "Request must be 200 characters or less"),
  reference: z.string().trim().max(300, "Reference URL must be 300 characters or less").optional().or(z.literal("")),
  details: z.string().trim().max(1000, "Details must be 1000 characters or less").optional().or(z.literal("")),
});

export type RequestPayload = z.infer<typeof requestSchema>;
