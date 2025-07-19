"use server";
import api from "@/interceptors/axios.interceptor";
import { registerSchema } from "@/schemas/auth.schema";
import { APIResponse } from "@/services/types/definition.type";


const endpoint = "/auth/register";

export async function signUp(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm_password = formData.get("confirm_password"); 
    const username = formData.get("username");
    const data = {
        email,
        password,
        username,
        confirm_password
    }

    const validatedData = registerSchema.safeParse(data);

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
            message: res?.data.error||"Une erreur s'est produite de l'inscription de l'utilisateur",
        }
    }

    return {
        success: true,
        message: "Inscription reussie !",
        data: res.data
    }
}
