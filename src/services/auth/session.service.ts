"use server"
import { User } from "@/models/user.model";
import { deleteSession, verifySession } from "@/server/session"
import { cache } from "react";

export const getSession = cache(async()=>{
    const session = await verifySession()
    return {
        data: session?.data as User|null,
        isAuthenticated: session?.isAuthenticated,
        token: session?.token
    }
})

export async function Logout(){
    try{
        await deleteSession();
        return true;
    }catch{
        return false;
    }
}