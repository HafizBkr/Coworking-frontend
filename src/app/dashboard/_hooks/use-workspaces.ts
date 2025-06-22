import { Workspace } from '@/models/worksapce.model'
import { useEffect, useState } from 'react'
import { getWorkspaces } from '../_services/workspace.service';

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        getWorkspaces()
        .then((data)=>{
            setWorkspaces(data.data as Workspace[]);
            setError(data.error||"");
        })
        .finally(()=>setIsLoading(false))
    },[]);

    return {
        workspaces,
        error,
        isLoading
    }
}
