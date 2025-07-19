"use server";
import api from "@/interceptors/axios.interceptor";
import { loginSchema } from "@/schemas/auth.schema";
import { createSession } from "@/server/session";
import { APIResponse } from "@/services/types/definition.type";

const endpoint = "/auth/login";

export async function signIn(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const password = formData.get("password");
    const data = {
        email,
        password
    }
    const validatedData = loginSchema.safeParse(data);

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
            message: res?.data.error||"Une erreur s'est produite de la connexion de l'utilisateur",
        }
    }

    await createSession({
        data:res.data.data.user,
        token:res.data.data.token
    })

    return {
        success: true,
        message: "Connexion reussie !",
        data: res.data
    }
}
