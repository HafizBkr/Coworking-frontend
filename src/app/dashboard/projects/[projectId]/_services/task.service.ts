"use server";

import api from "@/interceptors/axios.interceptor";
import { APIResponse } from "@/services/types/definition.type";


export async function createTask(formData: FormData, projectId: string, workspaceId: string): Promise<APIResponse> {
    const titre = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priorite = formData.get("priority") as string;
    const statut = formData.get("status") as string;
    const dateEcheance = formData.get("dueDate") as string;

    if (!titre || !description || !priorite || !statut || !dateEcheance) {
    return {
        success: false,
        message: "Tous les champs sont obligatoires.",
    };
    }

    // Exemple de création d'une tâche (à adapter selon votre backend ou base de données)
    const nouvelleTache = {
        title: titre,
        description: description,
        priority: priorite,
        status: statut,
        dueDate: dateEcheance,
        workspace:workspaceId,
    };

    try {
    
        const res = await api.post(`/tasks/projects/${projectId}/tasks`, nouvelleTache);
        console.log({res: res.data})

        if (res.status === 201) {
            return {
                success: true,
                message: "La tâche a été créée avec succès.",
                data: nouvelleTache,
            };
        } else {
            return {
                success: false,
                message: "Erreur lors de la création de la tâche.",
            };
        }
    } catch {
        return {
            success: false,
            message: "Erreur lors de la création de la tâche.",
        };
    }
}

export async function updateTask(statut: string, taskId: string): Promise<APIResponse> {

    if ( !statut ) {
        return {
            success: false,
            message: "Tous les champs sont obligatoires.",
        };
    }

    try {
    
        const res = await api.patch(`/tasks/tasks/${taskId}/status`, {
            status: statut,
        });

        console.log({res: res.data})

        if (res.status === 200) {
            return {
                success: true,
                message: "La tâche a été mise à jour avec succès.",
                data: res.data.data,
            };
        } else {
            return {
                success: false,
                message: "Erreur lors de la mise à jour de la tâche.",
            };
        }
    } catch {
        return {
            success: false,
            message: "Erreur lors de la mise à jour de la tâche.",
        };
    }
}


export async function assignTask(taskId: string, userId: string): Promise<APIResponse> {
    try {
        const res = await api.patch(`/tasks/tasks/${taskId}/assign`, {
            userId,
        });

        console.log({res: res.data})

        if (res.status === 200) {
            return {
                success: true,
                message: "La tâche a été assignée avec succès.",
            };
        } else {
            return {
                success: false,
                message: "Erreur lors de l'assignation de la tâche.",
            };
        }
    } catch {
        return {
            success: false,
            message: "Erreur lors de l'assignation de la tâche.",
        };
    }
}


export async function deleteTask(taskId: string): Promise<APIResponse> {

        const res = await api.delete(`/tasks/tasks/${taskId}`);
        console.log({res: res.data})

        if (res.status === 200) {
            return {
                success: true,
                message: "La tâche a été supprimée avec succès.",
            };
        } else {
            return {
                success: false,
                message: "Erreur lors de la suppression de la tâche.",
            };
        }
}


export async function getAllTasks(projectId: string): Promise<APIResponse> {
    const res = await api.get(`/tasks/projects/${projectId}/tasks`);
    
    if (res.status === 200) {
        return {
            success: true,
            message: "Les tâches ont été récupérées avec succès.",
            data: res.data.data,
        };
    } else {
        return {
            success: false,
            message: "Erreur lors de la récupération des tâches.",
        };
    }
}