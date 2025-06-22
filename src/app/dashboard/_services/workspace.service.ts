"use server";
import { routes } from "@/config/routes";
import api from "@/interceptors/axios.interceptor";
import { workspaceSchema } from "@/schemas/workspace.shema";
import { APIResponse } from "@/services/types/definition.type";
import { revalidatePath } from "next/cache";

const endpoint = "/workspaces";

export async function getWorkspaces():Promise<APIResponse>{
    const res = await api.get(endpoint);
    console.log({log:res.data})
    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la recuperation du workspace",
        }
    }

    return {
        success: true,
        message: "Recuperation des workspace reussie !",
        data: res.data.data
    }
}

export async function getActiveUsersWorkspaces(workspaceId: string):Promise<APIResponse>{
    const res = await api.get(endpoint+`/${workspaceId}/active-users`);

    console.log({log:res.data})
    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la recuperation membres actives du workspace",
        }
    }

    return {
        success: true,
        message: "Recuperation des membres actives workspace reussie !",
        data: res.data.data
    }
}


export async function createWorkspace(formData:FormData):Promise<APIResponse>{
    const name = formData.get("name");
    const description = formData.get("description");
    // const logo = "test";

    const data = {
        name,
        description
    }

    const validatedData = workspaceSchema.safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }

    const res = await api.post(endpoint,data);

    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la creation du workspace",
        }
    }
    revalidatePath(routes.dashboard.home);
    return {
        success: true,
        message: "Workspace crée avec succes !",
        data: res.data
    }
}

