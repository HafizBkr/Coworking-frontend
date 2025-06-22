"use server";
import api from "@/interceptors/axios.interceptor";
import { verficationOTPSchema } from "@/schemas/auth.schema";
import { APIResponse } from "@/services/types/definition.type";

const endpoint = "/auth/resend-otp";

export async function resendOTP(formData:FormData):Promise<APIResponse>{
    const email = formData.get("email");
    const data = {
        email,
    }

    const validatedData = verficationOTPSchema.partial().safeParse(data);

    if(!validatedData.success){
        return{
            success:false,
            message:"Champs invalides",
            errors: validatedData.error.flatten().fieldErrors
        }
    }
    console.log({ data: validatedData.data })
    const res = await api.post(endpoint,validatedData.data);
    console.log({log:res.data})

    if(res?.data?.error){
        return {
            success: false,
            message: res?.data.error||"Une erreur s'est produite du renvoi du code OTP",
        }
    }

    return {
        success: true,
        message: "renvoie du code OTP reussie !",
        data: res.data
    }
}

