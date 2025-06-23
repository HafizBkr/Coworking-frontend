"use server";
import { routes } from "@/config/routes";
import api from "@/interceptors/axios.interceptor";
import { projectSchema } from "@/schemas/project.shema";
import { APIResponse } from "@/services/types/definition.type";
import { revalidatePath } from "next/cache";

const endpoint = "/projects"

export async function createProject(formData:FormData):Promise<APIResponse>{
    const name = formData.get("name");
    const description = formData.get("description");
    const endDate = formData.get("end_date");
    const startDate = formData.get("start_date");
    const workspaceId = formData.get("workspace_id")
    // const logo = "test";

    const data = {
        name,
        description,
        endDate,
        startDate
    }

    const validatedData = projectSchema.safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }

    const res = await api.post(endpoint+`/workspaces/${workspaceId}/projects`,data);

    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la creation du projet",
        }
    }
    revalidatePath(routes.dashboard.projects);
    return {
        success: true,
        message: "Projet crée avec succes !",
        data: res.data
    }
}


export async function duplicateProject(projectId:string, projectName:string):Promise<APIResponse>{
    const res = await api.post(endpoint+`/projects/${projectId}/duplicate`,{
        newName: `duplicate-${projectName}`
    });
    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la duplication du projet",
        }
    }

    revalidatePath(routes.dashboard.projects);
    return {
        success: true,
        message: "Projet dupliqué avec succes !",
        data: res.data
    }
}


export async function getProjects(workspaceId: string): Promise<APIResponse> {
    const res = await api.get(`${endpoint}/workspaces/${workspaceId}/projects`);
    console.log({ log: res.data });
    if (res?.data?.error) {
        return {
            success: false,
            message: res?.data.error || "Une erreur s'est produite lors de la récupération des projets",
        }
    }

    return {
        success: true,
        message: "Récupération des projets réussie !",
        data: res.data.data
    }
}


export async function deletProject(workspaceId: string): Promise<APIResponse> {
    const res = await api.delete(`${endpoint}/workspaces/${workspaceId}/projects`);
    console.log({ log: res.data });
    if (res?.data?.error) {
        return {
            success: false,
            message: res?.data.error || "Une erreur s'est produite lors de la supression du projet"
        }
    }

    return {
        success: true,
        message: "suppression du projets réussie !",
        data: res.data.data
    }
}
