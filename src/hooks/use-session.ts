"use client";
import { User } from '@/models/user.model'
import { getSession } from '@/services/auth/session.service';
import { useEffect, useState } from 'react'

export function useSession() {
    const [user ,setUser] = useState<User|null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=>{
        getSession()
        .then((data)=>{
            setUser(data?.data);
        })
        .catch((error)=>{
            console.log({ error })
            setError("Impossible de recuperer la session de l'utilisateur")
        })
        .finally(()=>setIsLoading(false))
    },[])

    return {
        isLoading,
        error,
        user
    }
}
