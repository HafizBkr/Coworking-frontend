"use server";
import api from "@/interceptors/axios.interceptor";


const endpoint = "/invitations/invitations/accept"
export async function acceptInvitation(token: string) {

    console.log({
        token,
    })
    
    const res = await api.post(endpoint,{
        token,
    });

    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de lors de l'acceptation de l'invitations",
        }
    }

    return {
        success: true,
        message: "Invitation acceptée avec succes !",
        data: res.data
    }
}
