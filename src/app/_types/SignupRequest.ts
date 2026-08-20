import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  passwordSchema,
} from "@/app/_types/CommonSchemas";

export const signupRequestSchema = z
  .object({
    name: userNameSchema,
    email: emailSchema,
    password: passwordSchema,
    checkPassword: z.string().min(5),
  })
  .refine((data) => data.password === data.checkPassword, {
    message: "パスワードが一致しません",
    path: ["checkPassword"],
  });

export type SignupRequest = z.infer<typeof signupRequestSchema>;
