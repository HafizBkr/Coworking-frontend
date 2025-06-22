import { z } from "zod";

export const workspaceSchema = z.object({
    name: z
        .string({
            required_error: "Le nom du workspace est requis",
            invalid_type_error: "Le nom du workspace doit être une chaîne de caractères"
        })
        .min(2, "Le nom du workspace doit contenir au moins 2 caractères")
        .max(50, "Le nom du workspace ne peut pas dépasser 50 caractères"),
    description: z
        .string({
            required_error: "La description du workspace est requise",
            invalid_type_error: "La description du workspace doit être une chaîne de caractères"
        })
        .min(10, "La description du workspace doit contenir au moins 10 caractères")
        .max(200, "La description du workspace ne peut pas dépasser 200 caractères"),
    logo: z
        .string({
            required_error: "Le logo du workspace est requis",
            invalid_type_error: "Le logo du workspace doit être une chaîne de caractères"
        })
        .optional()
});