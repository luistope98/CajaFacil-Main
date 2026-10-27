import * as z from "zod";

export const loginSchema = z.object({
  phone: z.string().min(3, "El número debe tener al menos 10 dígitos"),
  password: z.string().min(3, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;