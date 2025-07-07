import {  useEffect, useState } from 'react';
import { getGeneralChatId } from '../_services/chat.service';
import { useWorkspaceStore } from '@/stores/workspace.store';


export type Participant = {
    _id: string;
    email: string;
    username: string;
};

export type ChatGeneralType = {
    _id: string;
    name: string;
    workspace: string;
    isDirectMessage: boolean;
    participants: Participant[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export function useChatGeneral() {
    const [chatGeneral, setChatGeneral] = useState<ChatGeneralType>();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { currentWorkspace } = useWorkspaceStore()

    useEffect(()=>{
        // cache(()=>{
            getGeneralChatId(currentWorkspace?._id||"")
            .then((data)=>{
                console.log({ data })
                const res = data.data as ChatGeneralType[]
                setChatGeneral(res?.[0]);
                setError(data?.error||"");
            })
            .finally(()=>setIsLoading(false))
        // })
    },[currentWorkspace?._id]);

    return {
        chatGeneral,
        error,
        isLoading
    }
}
