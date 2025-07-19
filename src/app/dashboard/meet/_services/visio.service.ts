import api from "@/interceptors/axios.interceptor";
import { APIResponse } from "@/services/types/definition.type";

const endpoint  = "/visio/room"

export async function createMeetRoom(workspaceId: string):Promise<APIResponse>{
    const res = await api.post(`${endpoint}/${workspaceId}`);

    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error || "Une erreur s'est produite lors de la création de la salle de réunion",
        }
    }

    return {
        success: true,
        message: "Salle de réunion créée avec succès !",
        data: res.data.data
    }   

}
