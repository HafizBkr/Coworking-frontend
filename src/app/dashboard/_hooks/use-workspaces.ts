import { Workspace } from '@/models/worksapce.model'
import { useEffect, useState } from 'react'
import { getWorkspaces } from '../_services/workspace.service';
import { useChatIdStore } from '@/stores/chat-id.store';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function useWorkspaces() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { clearChatId } = useChatIdStore();
    const { clearCurrentWorkspace } = useWorkspaceStore();
    // const router = useRouter()
    
    useEffect(()=>{
        clearCurrentWorkspace();
        clearChatId();
        getWorkspaces()
        .then((data)=>{
            setWorkspaces(data.data as Workspace[]);
            setError(data.error||"");
        })
        .finally(()=>{setIsLoading(false); })
    },[]);



    return {
        workspaces,
        error,
        isLoading
    }
}
