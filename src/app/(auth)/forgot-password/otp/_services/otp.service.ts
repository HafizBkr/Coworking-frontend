"use server";
import api from "@/interceptors/axios.interceptor";
import { verficationOTPSchema } from "@/schemas/auth.schema";
import { APIResponse } from "@/services/types/definition.type";

const endpoint = "/auth/verify-reset-code";

export async function verifcationPasswordOTP(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const code = formData.get("code");
    const data = {
        email,
        code
    }

    const validatedData = verficationOTPSchema.safeParse(data);

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
        code: validatedData.data.code.toString()
    });
    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite de la validation du code OTP",
        }
    }

    return {
        success: true,
        message: "Confirmation de l'email reussie !",
        data: res.data
    }
}

