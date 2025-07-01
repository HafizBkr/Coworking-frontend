"use server";
import api from "@/interceptors/axios.interceptor";
import { registerSchema } from "@/schemas/auth.schema";


const endpoint = "/invitations/invitations/register"
export async function acceptUserWorkspace(formData:FormData, token: string) {

    const email = formData.get("email");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password"); 
    const username = formData.get("username");
    const data = {
        email,
        password,
        username,
        confirm_password,
    }

    const validatedData = registerSchema.safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }

    console.log({
        token,
        ...data
    })
    
    const res = await api.post(endpoint,{
        token,
        ...data
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
