
import { useEffect, useState } from 'react'
import { getActiveUsersWorkspaces } from '../_services/workspace.service';
import { User } from '@/models/user.model';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useActiveUsersWorkspaces() {
    const [membersActive, setMembersActive] = useState<User[]>();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { currentWorkspace } = useWorkspaceStore()

    useEffect(()=>{
        if(currentWorkspace?._id){
            getActiveUsersWorkspaces(currentWorkspace._id)
            .then((data)=>{
                setMembersActive(data.data as User[]);
                setError(data.error||"");
            })
            .catch((err)=>{
                setError(err.message);
            })
            .finally(()=>setIsLoading(false))
        }
    },[currentWorkspace?._id]);

    return {
        membersActive,
        error,
        isLoading
    }
}
