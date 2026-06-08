import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(4, "Password must be at least 4 characters"),
});

export const tenantLoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Please enter a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(4, "Password must be at least 4 characters"),
  code: z
    .string({ required_error: "Company Code is required" })
    .min(4, "Please enter a valid Company code"),
});
