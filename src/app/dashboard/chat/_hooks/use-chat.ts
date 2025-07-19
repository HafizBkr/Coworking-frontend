import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket/socket.service';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useChatIdStore } from '@/stores/chat-id.store';
import { getSession } from '@/services/auth/session.service';
import { getChatMessages } from '../_services/chat.service';

export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  readBy?: string[];
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  tempId?: string;
}

export interface TypingStatus {
  userId: string;
  username: string;
  isTyping: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspaceStore();
  const { chatId } = useChatIdStore();
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [totalMessagesLoaded, setTotalMessagesLoaded] = useState(0);
  // Nombre de messages à charger par lot
  const MESSAGES_LIMIT = 10;
  
  // Effacer le typingTimeout quand le composant est démonté
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const session = await getSession();
      setCurrentUser(session.data);
      console.log('[Chat] Utilisateur récupéré:', session.data);
    };
    getUser();
  }, []);

  const loadMessages = useCallback(async (loadMore = false) => {
    if (!chatId) return;
    
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    
    console.log('[Chat] Chargement des messages pour chatId:', chatId);
    try {
      // Récupérer tous les messages du serveur, indépendamment des paramètres
      const response = await getChatMessages(chatId);
      
      if (response.success && response.data) {
        const allMessages = response.data as ChatMessage[];
        console.log(`[Chat] ${allMessages.length} messages chargés au total du serveur`);
        
        // Trier les messages par date (du plus ancien au plus récent)
        const sortedMessages = [...allMessages].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        if (loadMore) {
          // Si on charge plus de messages, on ajoute les 10 messages plus anciens
          // que ceux déjà affichés, si disponibles
          const currentFirstMessage = messages[0];
          let currentIndex = -1;
          
          if (currentFirstMessage) {
            currentIndex = sortedMessages.findIndex(msg => msg._id === currentFirstMessage._id);
          }
          
          // S'il n'y a pas de message actuellement ou si on n'a pas trouvé le premier message actuel
          if (currentIndex === -1) {
            currentIndex = sortedMessages.length;
          }
          
          // Calculer le début de la nouvelle tranche (10 messages avant les messages actuels)
          const startIndex = Math.max(0, currentIndex - MESSAGES_LIMIT);
          
          // Extraire les nouveaux messages à ajouter (entre startIndex et currentIndex)
          const newMessagesToAdd = sortedMessages.slice(startIndex, currentIndex);
          
          // Définir s'il reste des messages à charger
          setHasMoreMessages(startIndex > 0);
          
          // Ajouter les nouveaux messages au début de la liste existante
          setMessages(prev => {
            const combinedMessages = [...newMessagesToAdd, ...prev];
            // Mettre à jour le compteur
            setTotalMessagesLoaded(combinedMessages.length);
            return combinedMessages;
          });
          
          console.log(`[Chat] ${newMessagesToAdd.length} messages plus anciens ajoutés`);
        } else {
          // Pour le chargement initial, prendre seulement les 10 derniers messages
          const messagesToShow = sortedMessages.slice(
            Math.max(0, sortedMessages.length - MESSAGES_LIMIT), 
            sortedMessages.length
          );
          
          // Définir s'il reste des messages à charger
          setHasMoreMessages(sortedMessages.length > MESSAGES_LIMIT);
          
          // Mettre à jour l'état avec les 10 derniers messages
          setMessages(messagesToShow);
          
          // Réinitialiser le compteur
          setTotalMessagesLoaded(messagesToShow.length);
          
          console.log(`[Chat] ${messagesToShow.length} derniers messages chargés pour l'affichage initial`);
        }
      }
    } catch {
      setError('Erreur lors du chargement des messages');
      console.error('[Chat] Erreur lors du chargement des messages');
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [chatId, messages]);

  const loadMoreMessages = useCallback(() => {
    if (!chatId || !hasMoreMessages || isLoadingMore) {
      console.log('[Chat] Aucun autre message à charger ou chargement déjà en cours');
      return;
    }
    
    console.log('[Chat] Chargement de 10 messages plus anciens');
    loadMessages(true);
  }, [chatId, hasMoreMessages, isLoadingMore, loadMessages]);

  const connectSocket = useCallback(async () => {
    if (!currentWorkspace?._id || !chatId) return;
    setIsLoading(true);
    setError(null);
    console.log('[Chat] Tentative de connexion socket pour chatId:', chatId, 'workspaceId:', currentWorkspace?._id);
    try {
      await loadMessages(false);
      let socket = await socketService.connect();
      if (!socket) socket = await socketService.forceReconnect();
      if (!socket) throw new Error('Impossible de se connecter au chat');
      setIsConnected(true);
      console.log('[Chat] Socket connecté, join workspace:', currentWorkspace._id);
      await socketService.joinWorkspace(currentWorkspace._id);
      console.log('[Chat] Join chat:', chatId);
      await socketService.joinChat(chatId);
      
      // Nettoyage des listeners précédents (pour éviter les doublons)
      socketService.offNewMessage();
      socketService.offMessageSent();
      socketService.offChatJoined();
      socketService.offWorkspaceJoined();
      socketService.offError();
      socketService.offTypingStatus();
      
      // Réinitialiser la liste des utilisateurs en train de taper
      setTypingUsers([]);
      
      // Mise en place des nouveaux listeners
      socketService.onNewMessage((data) => {
        console.log('[Chat] new-message reçu:', data);
        setMessages(prev => {
          // Remplace le message optimiste par le vrai (même contenu ET même sender._id)
          const filtered = prev.filter(msg =>
            !(msg.tempId && msg.content === data.content && msg.sender._id === data.sender._id)
          );
          if (!filtered.some(msg => msg._id === data._id)) {
            // Incrémenter le compteur uniquement si c'est un nouveau message (pas un remplacement de message temporaire)
            setTotalMessagesLoaded(prevCount => prevCount + 1);
            return [...filtered, data];
          }
          return filtered;
        });
        
        // Si quelqu'un envoie un message, on supprime son indicateur de frappe
        setTypingUsers(prev => prev.filter(user => user.userId !== data.sender._id));
      });
      
      socketService.onMessageSent((data) => {
        console.log('[Chat] message-sent reçu:', data);
      });
      
      socketService.onChatJoined((data) => {
        console.log('[Chat] chat-joined reçu:', data);
      });
      
      socketService.onWorkspaceJoined((data) => {
        console.log('[Chat] workspace-joined reçu:', data);
      });
      
      socketService.onTypingStatus((data) => {
        console.log('[Chat] Événement de frappe reçu:', data);
        
        // Ignorer les événements qui ne concernent pas le chat actuel
        if (data.chatId !== chatId) {
          console.log(`[Chat] Ignoré car cet événement concerne un autre chat (${data.chatId})`);
          return;
        }
        
        // Ignore ses propres événements de frappe
        if (currentUser && data.userId === currentUser.id) {
          console.log('[Chat] Ignoré car c\'est mon propre événement de frappe');
          return;
        }
        
        if (data.isTyping) {
          console.log(`[Chat] ${data.username} est en train d'écrire...`);
          // Ajouter l'utilisateur à la liste de ceux qui écrivent
          setTypingUsers(prev => {
            if (!prev.some(user => user.userId === data.userId)) {
              return [...prev, data];
            }
            return prev;
          });
          
          // Supprimer l'utilisateur après 3 secondes s'il n'y a pas d'autre événement
          setTimeout(() => {
            console.log(`[Chat] Fin automatique du typing pour ${data.username} après 3 secondes`);
            setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
          }, 3000);
        } else {
          console.log(`[Chat] ${data.username} a arrêté d'écrire`);
          // Supprimer immédiatement l'utilisateur de la liste
          setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
        }
      });
      
      socketService.onError((err) => {
        setError('Erreur de connexion au chat');
        console.error('[Chat] Erreur socket:', err);
      });
    } catch {
      setError('Erreur lors de la connexion au chat');
      console.error('[Chat] Erreur lors de la connexion au chat');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?._id, chatId, loadMessages]);

  const disconnectSocket = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setMessages([]);
    setTypingUsers([]);
    setTotalMessagesLoaded(0);
    console.log('[Chat] Déconnexion socket');
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId || !content.trim() || !isConnected) return;
    const tempId = `temp-${Date.now()}`;
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
    setMessages(prev => [...prev, tempMessage]);
    // Ne pas incrémenter le compteur ici car le message temporaire sera remplacé
    // par le vrai message et le compteur sera mis à jour à ce moment-là
    console.log('[Chat] Envoi du message:', tempMessage);
    
    // Arrêter d'envoyer le statut de frappe quand on envoie un message
    if (currentUser) {
      await socketService.sendTyping(chatId, false);
    }
    
    try {
      await socketService.sendMessage(chatId, content.trim(), tempId);
      console.log('[Chat] sendMessage émis pour chatId:', chatId, 'tempId:', tempId);
    } catch {
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError('Erreur lors de l\'envoi du message');
      console.error('[Chat] Erreur lors de l\'envoi du message');
    }
  }, [chatId, isConnected, currentUser]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  // Scroll to bottom lorsque de nouveaux messages sont ajoutés ou quand quelqu'un commence à taper
  useEffect(() => {
    // Ne pas scroller si on charge d'anciens messages (isLoadingMore)
    if (!isLoadingMore) {
      scrollToBottom();
    }
  }, [messages, typingUsers, scrollToBottom, isLoadingMore]);

  // Fonction pour gérer la saisie de l'utilisateur (typing)
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!chatId || !currentUser || !isConnected) {
      console.log('[Chat] Impossible d\'envoyer le statut de frappe:', { chatId, currentUser: !!currentUser, isConnected });
      return;
    }
    
    console.log(`[Chat] Envoi du statut de frappe: ${isTyping ? 'commence à taper' : 'arrête de taper'}`);
    
    // Si l'utilisateur commence à taper, envoyer immédiatement l'événement
    if (isTyping) {
      socketService.sendTyping(chatId, true);
      
      // Effacer le timeout précédent si existant
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Définir un nouveau timeout pour arrêter le statut de frappe après 3 secondes
      typingTimeoutRef.current = setTimeout(() => {
        console.log('[Chat] Fin automatique du typing après 3 secondes d\'inactivité');
        socketService.sendTyping(chatId, false);
      }, 3000);
    } else {
      // Si l'utilisateur arrête de taper, envoyer immédiatement l'événement
      socketService.sendTyping(chatId, false);
      
      // Effacer le timeout s'il existait
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [chatId, currentUser, isConnected]);

  useEffect(() => {
    if (currentWorkspace?._id && chatId) {
      console.log('[Chat] Connexion/déconnexion automatique, chatId:', chatId, 'workspaceId:', currentWorkspace._id);
      // Réinitialiser l'état à chaque changement de chat ou d'espace de travail
      setHasMoreMessages(true);
      setMessages([]);
      setTypingUsers([]);
      setTotalMessagesLoaded(0);
      connectSocket();
      return () => disconnectSocket();
    }
  }, [currentWorkspace?._id, chatId]);

  useEffect(() => {
    return () => {
      socketService.offNewMessage();
      socketService.offMessageSent();
      socketService.offChatJoined();
      socketService.offWorkspaceJoined();
      socketService.offError();
      socketService.offTypingStatus();
      console.log('[Chat] Nettoyage listeners socket');
      
      // Nettoyage du timeout typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    scrollToBottom,
    messagesEndRef,
    currentUser,
    checkAndReconnect: connectSocket,
    loadMoreMessages,
    isLoadingMore,
    hasMoreMessages,
    typingUsers,
    handleTyping,
    totalMessagesLoaded // Ajout du compteur de messages chargés
  };
}