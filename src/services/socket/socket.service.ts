/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import { getSession } from '@/services/auth/session.service';
import { SOCKET_CONFIG } from '@/config/socket.config';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<Socket | null> | null = null;

  async connect(): Promise<Socket | null> {
    console.log('🔄 [Socket] Tentative de connexion...');
    
    // Si une connexion est déjà en cours, retourner la promesse existante
    if (this.connectionPromise) {
      console.log('⏳ [Socket] Connexion déjà en cours, attente de la promesse existante...');
      return this.connectionPromise;
    }
    
    if (this.socket?.connected) {
      console.log('ℹ️ [Socket] Socket déjà connecté, réutilisation de la connexion existante');
      return this.socket;
    }

    console.log('🚀 [Socket] Début de la connexion Socket.IO');
    this.isConnecting = true;

    // Créer une nouvelle promesse de connexion
    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<Socket | null> {
    try {
      console.log('🔐 [Socket] Récupération de la session utilisateur...');
      const session = await getSession();
      
      if (!session.isAuthenticated || !session.token) {
        console.error('❌ [Socket] Utilisateur non authentifié');
        console.error('🔍 [Socket] Détails de session:', {
          isAuthenticated: session.isAuthenticated,
          hasToken: !!session.token,
          userId: session.data?.id
        });
        this.isConnecting = false;
        return null;
      }

      console.log('✅ [Socket] Utilisateur authentifié:', {
        userId: session.data?.id,
        username: session.data?.username,
        tokenLength: session.token?.length
      });

      this.socket = io(SOCKET_CONFIG.SERVER_URL, {
        auth: { 
          token: session.token 
        },
        transports: ['websocket', 'polling'],
        timeout: SOCKET_CONFIG.CONNECTION_TIMEOUT,
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
      });

      this.socket.on('connect', () => {
        console.log('✅ [Socket] Connecté au serveur Socket.IO');
        console.log('🆔 [Socket] ID de connexion:', this.socket?.id);
        console.log('🌐 [Socket] URL du serveur:', SOCKET_CONFIG.SERVER_URL);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [Socket] Déconnecté du serveur Socket.IO');
        console.log('📝 [Socket] Raison de la déconnexion:', reason);
        this.isConnecting = false;
        
        // Réinitialiser la promesse de connexion pour permettre une nouvelle connexion
        this.connectionPromise = null;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [Socket] Erreur de connexion:', error);
        console.error('🔍 [Socket] Détails de l\'erreur:', {
          message: error.message,
        });
        this.isConnecting = false;
        this.connectionPromise = null;
      });

      this.socket.on('error', (error) => {
        console.error('❌ [Socket] Erreur Socket.IO:', error);
        this.isConnecting = false;
      });

      console.log('✅ [Socket] Configuration Socket.IO terminée');
      
      // Nettoyer la promesse de connexion
      this.connectionPromise = null;
      this.isConnecting = false;
      
      return this.socket;
    } catch (error) {
      console.error('❌ [Socket] Erreur lors de la connexion Socket.IO:', error);
      console.error('🔍 [Socket] Type d\'erreur:', typeof error);
      console.error('📝 [Socket] Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      // Nettoyer la promesse de connexion en cas d'erreur
      this.connectionPromise = null;
      this.isConnecting = false;
      
      return null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [Socket] Déconnexion manuelle du socket');
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
      this.isConnecting = false;
      console.log('✅ [Socket] Socket déconnecté et nettoyé');
    } else {
      console.log('ℹ️ [Socket] Aucun socket à déconnecter');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Méthode pour forcer une nouvelle connexion
  async forceReconnect(): Promise<Socket | null> {
    console.log('🔄 [Socket] Forçage d\'une nouvelle connexion...');
    this.disconnect();
    return this.connect();
  }

  // Méthodes pour rejoindre les espaces de travail et chats
  async joinWorkspace(workspaceId: string): Promise<void> {
    if (!this.socket) return;
    if (!this.socket.connected) {
      await new Promise<void>((resolve) => {
        this.socket?.once('connect', () => resolve());
      });
    }
    this.socket.emit('join-workspace', workspaceId);
    console.log('[Socket] Événement join-workspace émis');
  }

  async joinChat(chatId: string): Promise<void> {
    if (!this.socket) return;
    if (!this.socket.connected) {
      await new Promise<void>((resolve) => {
        this.socket?.once('connect', () => resolve());
      });
    }
    this.socket.emit('join-chat', chatId);
    console.log('[Socket] Événement join-chat émis');
  }

  // Méthode pour envoyer un message
  async sendMessage(chatId: string, content: string, tempId?: string): Promise<void> {
    if (this.socket?.connected) {
      console.log('📤 [Socket] Envoi du message:', { chatId, content, tempId });
      this.socket.emit('send-message', {
        chatId,
        content,
        tempId
      });
      console.log('📤 [Socket] Événement send-message émis');
    } else {
      console.warn('⚠️ [Socket] Impossible d\'envoyer le message: socket non connecté');
    }
  }

  // Méthode pour indiquer que l'utilisateur est en train de taper
  async sendTyping(chatId: string, isTyping: boolean): Promise<void> {
    if (this.socket?.connected) {
      console.log('⌨️ [Socket] Envoi du statut de frappe:', { chatId, isTyping });
      
      // Les événements sont différents pour démarrer ou arrêter la frappe
      const eventName = isTyping ? 'typing-start' : 'typing-stop';
      
      this.socket.emit(eventName, {
        chatId
      });
      console.log(`⌨️ [Socket] Événement ${eventName} émis pour le chat ${chatId}`);
    } else {
      console.warn('⚠️ [Socket] Impossible d\'envoyer le statut de frappe: socket non connecté');
    }
  }

  // Écouteurs d'événements
  onNewMessage(callback: (data: any) => void): void {
    this.socket?.on('new-message', (data) => {
      console.log('💬 [Socket] Nouveau message reçu:', data);
      console.log('📊 [Socket] Détails du message:', {
        id: data._id,
        chatId: data.chatId,
        sender: data.sender?.username,
        content: data.content?.substring(0, 50) + (data.content?.length > 50 ? '...' : ''),
        timestamp: data.createdAt
      });
      callback(data);
    });
  }

  onMessageSent(callback: (data: any) => void): void {
    this.socket?.on('message-sent', (data) => {
      console.log('📤 [Socket] Message envoyé avec succès:', data);
      console.log('📊 [Socket] Détails de confirmation:', {
        tempId: data.tempId,
        realId: data._id,
        status: 'confirmed'
      });
      callback(data);
    });
  }

  onChatJoined(callback: (data: any) => void): void {
    this.socket?.on('chat-joined', (data) => {
      console.log('📥 [Socket] Chat rejoint avec succès:', data);
      console.log('📊 [Socket] Détails du chat:', {
        chatId: data.chatId,
        timestamp: new Date().toISOString()
      });
      callback(data);
    });
  }

  onWorkspaceJoined(callback: (data: any) => void): void {
    this.socket?.on('workspace-joined', (data) => {
      console.log('📥 [Socket] Workspace rejoint avec succès:', data);
      console.log('📊 [Socket] Détails du workspace:', {
        workspaceId: data.workspaceId,
        timestamp: new Date().toISOString()
      });
      callback(data);
    });
  }

  onTypingStatus(callback: (data: any) => void): void {
    // Écoute l'événement "user-typing" (quand un utilisateur commence à taper)
    this.socket?.on('user-typing', (data) => {
      console.log('⌨️ [Socket] Événement user-typing reçu:', data);
      // Formater les données pour notre interface
      const typingData = {
        userId: data.userId || 'unknown',
        username: this.getUsernameFromUserId(data.userId) || 'Quelqu\'un',
        isTyping: true,
        chatId: data.chatId
      };
      console.log('⌨️ [Socket] Utilisateur commence à taper:', typingData);
      callback(typingData);
    });
    
    // Écoute l'événement "user-stopped-typing" (quand un utilisateur arrête de taper)
    this.socket?.on('user-stopped-typing', (data) => {
      console.log('⌨️ [Socket] Événement user-stopped-typing reçu:', data);
      // Formater les données pour notre interface
      const typingData = {
        userId: data.userId || 'unknown',
        username: this.getUsernameFromUserId(data.userId) || 'Quelqu\'un',
        isTyping: false,
        chatId: data.chatId
      };
      console.log('⌨️ [Socket] Utilisateur arrête de taper:', typingData);
      callback(typingData);
    });
  }
  
  // Méthode utilitaire pour obtenir le nom d'utilisateur à partir de l'ID
  // Cette méthode sera améliorée ultérieurement pour récupérer les noms d'utilisateur
  private getUsernameFromUserId(userId: string): string | null {
    console.warn('⚠️ [Socket] getUsernameFromUserId non implémentée, retourne null pour l\'instant', userId);
    // Pour l'instant, retourne null et notre code utilisera 'Quelqu\'un' comme valeur par défaut
    return null;
  }

  onError(callback: (error: any) => void): void {
    this.socket?.on('error', (error) => {
      console.error('❌ [Socket] Erreur reçue:', error);
      console.error('🔍 [Socket] Type d\'erreur:', typeof error);
      console.error('📝 [Socket] Message d\'erreur:', error?.message || error);
      callback(error);
    });
  }

  // Nettoyer les écouteurs
  offNewMessage(): void {
    this.socket?.off('new-message');
  }

  offMessageSent(): void {
    this.socket?.off('message-sent');
  }

  offChatJoined(): void {
    this.socket?.off('chat-joined');
  }

  offWorkspaceJoined(): void {
    this.socket?.off('workspace-joined');
  }

  offTypingStatus(): void {
    this.socket?.off('user-typing');
    this.socket?.off('user-stopped-typing');
  }

  offError(): void {
    this.socket?.off('error');
  }
}

// Instance singleton
export const socketService = new SocketService();