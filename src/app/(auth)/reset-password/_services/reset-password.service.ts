"use server";
import api from "@/interceptors/axios.interceptor";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { APIResponse } from "@/services/types/definition.type";


const endpoint = "/auth/reset-password";

export async function resetPassword(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const password = formData.get("password");
    const confirm_password = formData.get("comfirm_password"); 
    const code = formData.get("code");
    const data = {
        email,
        password,
        code,
        confirm_password
    }

    const validatedData = resetPasswordSchema.safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }

    console.log({data})

    const res = await api.post(endpoint,{
        email: data.email,
        code: data.code,
        newPassword: data.password
    });
    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite du reset-password",
        }
    }

    return {
        success: true,
        message: "Mot de passe mise a jour !",
        data: res.data
    }
}
