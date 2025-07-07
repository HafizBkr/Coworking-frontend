import { useEffect, useState, useCallback, useRef, useOptimistic, startTransition } from 'react';
import { socketService } from '@/services/socket/socket.service';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useChatIdStore } from '@/stores/chat-id.store';
import { getSession } from '@/services/auth/session.service';
import { getChatMessages } from '../_services/chat.service';

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  tempId?: string;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  tempId?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMsg: ChatMessage) => [...state, newMsg]
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspaceStore();
  const { chatId } = useChatIdStore();
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const getUser = async () => {
      console.log('👤 [Chat] Récupération de l\'utilisateur actuel...');
      const session = await getSession();
      setCurrentUser(session.data);
      console.log('✅ [Chat] Utilisateur récupéré:', {
        id: session.data?.id,
        username: session.data?.username,
        email: session.data?.email
      });
    };
    getUser();
  }, []);

  // Charger les messages existants
  const loadMessages = useCallback(async () => {
    if (!chatId) {
      console.log('⚠️ [Chat] Impossible de charger les messages: chatId manquant');
      return;
    }

    console.log('📥 [Chat] Chargement des messages existants pour le chat:', chatId);
    try {
      const response = await getChatMessages(chatId);
      if (response.success && response.data) {
        const messages = response.data as ChatMessage[];
        console.log('✅ [Chat] Messages chargés avec succès:', {
          count: messages.length,
          chatId: chatId
        });
        setMessages(messages);
      } else {
        console.error('❌ [Chat] Erreur lors du chargement des messages:', response.message);
      }
    } catch (err) {
      console.error('❌ [Chat] Erreur lors du chargement des messages:', err);
    }
  }, [chatId]);

  // Connexion Socket.IO
  const connectSocket = useCallback(async () => {
    console.log('🚀 [Chat] Début de la connexion au chat');
    console.log('📊 [Chat] Paramètres de connexion:', {
      workspaceId: currentWorkspace?._id,
      chatId: chatId,
      userId: currentUser?.id
    });

    if (!currentWorkspace?._id || !chatId) {
      console.warn('⚠️ [Chat] Paramètres manquants pour la connexion:', {
        hasWorkspace: !!currentWorkspace?._id,
        hasChatId: !!chatId
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Charger les messages existants d'abord
      console.log('📥 [Chat] Chargement des messages existants...');
      await loadMessages();

      console.log('🔌 [Chat] Connexion au service Socket.IO...');
      let socket = await socketService.connect();
      
      // Si la connexion échoue, essayer une reconnexion forcée
      if (!socket) {
        console.log('⚠️ [Chat] Première tentative de connexion échouée, tentative de reconnexion forcée...');
        socket = await socketService.forceReconnect();
      }
      
      if (socket) {
        console.log('✅ [Chat] Socket connecté avec succès');
        setIsConnected(true);
        
        // Rejoindre le workspace et le chat
        console.log('📥 [Chat] Rejoindre le workspace et le chat...');
        await socketService.joinWorkspace(currentWorkspace._id);
        await socketService.joinChat(chatId);

        // Nettoyer les anciens écouteurs avant d'en ajouter de nouveaux
        socketService.offNewMessage();
        socketService.offMessageSent();
        socketService.offChatJoined();
        socketService.offWorkspaceJoined();
        socketService.offError();

        // Écouter les nouveaux messages
        socketService.onNewMessage((data) => {
          setMessages(prev => {
            // Remplace le message optimiste par le vrai (même tempId ou même _id)
            const filtered = prev.filter(
              msg => !(msg.tempId && data.tempId && msg.tempId === data.tempId) && msg._id !== data._id
            );
            return [...filtered, data];
          });
        });

        // Écouter la confirmation d'envoi de message
        socketService.onMessageSent((data) => {
          setMessages(prev => {
            const updatedMessages = prev.map(msg => 
              msg.tempId === data.tempId 
                ? { ...msg, _id: data._id, tempId: undefined }
                : msg
            );
            return updatedMessages;
          });
        });

        // Écouter les événements de connexion
        socketService.onChatJoined((data) => {
          console.log('📥 [Chat] Chat rejoint confirmé dans le hook:', data.chatId);
        });

        socketService.onWorkspaceJoined((data) => {
          console.log('📥 [Chat] Workspace rejoint confirmé dans le hook:', data.workspaceId);
        });

        // Écouter les erreurs
        socketService.onError((error) => {
          console.error('❌ [Chat] Erreur Socket.IO reçue dans le hook:', error);
          setError('Erreur de connexion au chat');
        });

        console.log('✅ [Chat] Tous les écouteurs d\'événements configurés');

      } else {
        console.error('❌ [Chat] Impossible de se connecter au socket');
        setError('Impossible de se connecter au chat');
      }
    } catch (err) {
      console.error('❌ [Chat] Erreur lors de la connexion:', err);
      console.error('🔍 [Chat] Type d\'erreur:', typeof err);
      setError('Erreur lors de la connexion au chat');
    } finally {
      console.log('🏁 [Chat] Fin de la tentative de connexion');
      setIsLoading(false);
    }
  }, [currentWorkspace?._id, chatId, loadMessages]);

  // Déconnexion
  const disconnectSocket = useCallback(() => {
    console.log('🔌 [Chat] Déconnexion du chat');
    socketService.disconnect();
    setIsConnected(false);
    setMessages([]);
    console.log('✅ [Chat] Chat déconnecté et messages vidés');
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    console.log('📤 [Chat] Tentative d\'envoi de message:', {
      content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      chatId,
      isConnected,
      userId: currentUser?.id
    });

    if (!chatId || !content.trim() || !isConnected) {
      console.warn('⚠️ [Chat] Impossible d\'envoyer le message:', {
        hasChatId: !!chatId,
        hasContent: !!content.trim(),
        isConnected
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    console.log('🆔 [Chat] ID temporaire généré:', tempId);
    
    // Ajouter le message temporairement (optimiste)
    const tempMessage: ChatMessage = {
      _id: tempId,
      chatId,
      sender: {
        _id: currentUser?.id || '',
        username: currentUser?.username || '',
        email: currentUser?.email || ''
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tempId
    };

    console.log('📝 [Chat] Ajout du message temporaire à l\'interface (optimiste)');
    startTransition(() => {
      addOptimisticMessage(tempMessage);
    });

    try {
      console.log('🚀 [Chat] Envoi du message via Socket.IO...');
      await socketService.sendMessage(chatId, content.trim(), tempId);
      console.log('✅ [Chat] Message envoyé avec succès');
    } catch (err) {
      console.error('❌ [Chat] Erreur lors de l\'envoi du message:', err);
      // Optionnel : retirer le message optimiste en cas d\'erreur
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError('Erreur lors de l\'envoi du message');
    }
  }, [chatId, isConnected, currentUser, addOptimisticMessage]);

  // Scroll automatique vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [optimisticMessages, scrollToBottom]);

  // Méthode pour vérifier et reconnecter si nécessaire
  const checkAndReconnect = useCallback(async () => {
    if (!isConnected && currentWorkspace?._id && chatId) {
      console.log('🔄 [Chat] Vérification de reconnexion nécessaire...');
      await connectSocket();
    }
  }, [isConnected, currentWorkspace?._id, chatId, connectSocket]);

  // Effet pour surveiller les changements de connexion et tenter une reconnexion
  useEffect(() => {
    if (!isConnected && currentWorkspace?._id && chatId && !isLoading) {
      console.log('🔄 [Chat] Détection de déconnexion, tentative de reconnexion automatique...');
      const timeoutId = setTimeout(() => {
        checkAndReconnect();
      }, 2000); // Attendre 2 secondes avant de tenter la reconnexion

      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, currentWorkspace?._id, chatId, isLoading, checkAndReconnect]);

  // Connexion/déconnexion automatique
  useEffect(() => {
    console.log('🔄 [Chat] Vérification des conditions de connexion:', {
      hasWorkspace: !!currentWorkspace?._id,
      hasChatId: !!chatId,
      workspaceId: currentWorkspace?._id,
      chatId: chatId
    });

    if (currentWorkspace?._id && chatId) {
      console.log('✅ [Chat] Conditions remplies, connexion au chat');
      
      // Ajouter un délai pour éviter les connexions multiples lors du rafraîchissement
      const timeoutId = setTimeout(() => {
        connectSocket();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      console.log('❌ [Chat] Conditions non remplies, déconnexion du chat');
      disconnectSocket();
    }

    // Nettoyage à la déconnexion
    return () => {
      console.log('🧹 [Chat] Nettoyage des écouteurs d\'événements');
      // Ne pas nettoyer les écouteurs ici car ils sont gérés dans connectSocket
    };
  }, [currentWorkspace?._id, chatId, connectSocket, disconnectSocket]);

  // Nettoyage des écouteurs lors du démontage du composant
  useEffect(() => {
    return () => {
      console.log('🧹 [Chat] Démontage du composant - nettoyage des écouteurs');
      socketService.offNewMessage();
      socketService.offMessageSent();
      socketService.offChatJoined();
      socketService.offWorkspaceJoined();
      socketService.offError();
    };
  }, []);

  return {
    messages: optimisticMessages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    scrollToBottom,
    messagesEndRef,
    currentUser,
    checkAndReconnect
  };
}