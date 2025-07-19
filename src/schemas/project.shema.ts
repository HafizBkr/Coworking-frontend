import { z } from "zod";

export const projectSchema = z.object({
    name: z
        .string({
            required_error: "Le nom du projet est requis",
            invalid_type_error: "Le nom du projet doit être une chaîne de caractères"
        })
        .min(2, "Le nom du projet doit contenir au moins 2 caractères")
        .max(50, "Le nom du projet ne peut pas dépasser 50 caractères"),
    description: z
        .string({
            required_error: "La description du projet est requise",
            invalid_type_error: "La description du projet doit être une chaîne de caractères"
        })
        .min(10, "La description du projet doit contenir au moins 10 caractères")
        .max(200, "La description du projet ne peut pas dépasser 200 caractères"),
    startDate: z
        .coerce
        .string({
            required_error: "La date de début du projet est requise",
            invalid_type_error: "La date de début doit être une chaîne de caractères"
        }),
    endDate: z
        .coerce
        .string({
            required_error: "La date de fin du projet est requise",
            invalid_type_error: "La date de fin doit être une chaîne de caractères"
        })
});