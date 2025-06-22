"use server";
import api from "@/interceptors/axios.interceptor";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { APIResponse } from "@/services/types/definition.type";

const endpoint = "/auth/forgot-password";

export async function forgotPassword(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const data = {
        email
    }

    const validatedData = forgotPasswordSchema.safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }
    console.log({ data: validatedData.data })
    const res = await api.post(endpoint,{
        email: validatedData.data.email,
    });
    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite du mot de passe oublie",
        }
    }

    return {
        success: true,
        message: "Confirmation du mot de passe oublie !",
        data: res.data
    }
}

