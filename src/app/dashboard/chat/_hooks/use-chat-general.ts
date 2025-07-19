import { useEffect, useState, useCallback } from 'react';
import { getGeneralChatId } from '../_services/chat.service';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useChatIdStore } from '@/stores/chat-id.store';

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
    const [chatGeneral, setChatGeneral] = useState<ChatGeneralType | undefined>();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { currentWorkspace } = useWorkspaceStore();
    const { setChatId } = useChatIdStore();

    const fetchGeneralChatId = useCallback(async (workspaceId: string) => {
        if (!workspaceId) {
            console.warn('⚠️ [ChatGeneral] Impossible de récupérer le chat général: ID de workspace manquant');
            setIsLoading(false);
            return;
        }
        
        console.log('🔄 [ChatGeneral] Récupération du chat général pour le workspace:', workspaceId);
        setIsLoading(true);
        setError("");
        
        try {
            const data = await getGeneralChatId(workspaceId);
            console.log('📊 [ChatGeneral] Réponse du serveur:', data);
            
            if (data.success && data.data) {
                const res = data.data as ChatGeneralType[];
                if (res && res.length > 0) {
                    console.log('✅ [ChatGeneral] Chat général récupéré:', res[0]);
                    setChatGeneral(res[0]);
                } else {
                    console.warn('⚠️ [ChatGeneral] Aucun chat général trouvé pour ce workspace');
                    setChatGeneral(undefined);
                }
            } else {
                console.error('❌ [ChatGeneral] Erreur lors de la récupération du chat général:', data.message);
                setError(data.message || "Erreur lors de la récupération du chat général");
            }
        } catch (err) {
            console.error('❌ [ChatGeneral] Exception lors de la récupération du chat général:', err);
            setError("Erreur lors de la connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Récupérer le chat général lorsque le workspace change
    useEffect(() => {
        if (currentWorkspace?._id) {
            fetchGeneralChatId(currentWorkspace._id);
        } else {
            // Réinitialiser l'état quand il n'y a pas de workspace
            setChatGeneral(undefined);
            setError("");
            setIsLoading(false);
        }
    }, [currentWorkspace?._id, fetchGeneralChatId]);

    // Définir automatiquement le chat général comme chat actif s'il est disponible
    // et qu'aucun autre chat n'est sélectionné
    useEffect(() => {
        // clearChatId()
        if (chatGeneral && chatGeneral._id) {
            console.log('🔄 [ChatGeneral] Définition du chat général comme chat actif:', chatGeneral._id);
            setChatId(chatGeneral._id);
        }
    }, [chatGeneral, setChatId]);

    // Fonction de raffraîchissement manuel
    const refreshGeneralChat = useCallback(() => {
        if (currentWorkspace?._id) {
            console.log('🔄 [ChatGeneral] Raffraîchissement manuel du chat général');
            fetchGeneralChatId(currentWorkspace._id);
        }
    }, [currentWorkspace?._id, fetchGeneralChatId]);

    return {
        chatGeneral,
        error,
        isLoading,
        refreshGeneralChat
    };
}
