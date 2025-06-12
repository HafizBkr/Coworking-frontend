"use server"
import { deleteSession, verifySession } from "@/server/session"

export async function getSession() {
    const session = await verifySession()
    return session
}

export async function Logout(){
    try{
        await deleteSession();
        return true;
    }catch{
        return false;
    }
}