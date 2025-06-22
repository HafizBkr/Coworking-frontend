import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string({
            required_error: "L'email est requis",
            invalid_type_error: "L'email doit être une chaîne de caractères"
        })
        .email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const registerSchema = z.object({
    email: z
        .string({
            required_error: "L'email est requis",
            invalid_type_error: "L'email doit être une chaîne de caractères"
        })
        .email("Format d'email invalide"),
    username: z
    .string({
        required_error: "Le nom d'utilisateur est requis",
        invalid_type_error: "Le nom d'utilisateur doit être une chaîne de caractères"
    }),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string()
    .min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères"),
    })
    .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});


export const verficationOTPSchema = z.object({
    email: z
        .string({
            required_error: "L'email est requis",
            invalid_type_error: "L'email doit être une chaîne de caractères"
        })
        .email("Format d'email invalide"),
    code: z
    .string({
        required_error: "Le code OTP est requis",
        invalid_type_error: "Le code OTP doit être une chaîne de caractères"
    }),
});