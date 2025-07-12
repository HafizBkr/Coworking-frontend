/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import { getSession } from '@/services/auth/session.service';
import { SOCKET_CONFIG } from '@/config/socket.config';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<Socket | null> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();

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
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
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
        this.connectionPromise = null;
        return null;
      }

      console.log('✅ [Socket] Utilisateur authentifié:', {
        userId: session.data?.id,
        username: session.data?.username,
        tokenLength: session.token?.length
      });

      // Déconnecter l'ancien socket s'il existe
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(SOCKET_CONFIG.SERVER_URL, {
        auth: { 
          token: session.token 
        },
        transports: ['websocket', 'polling'],
        timeout: SOCKET_CONFIG.CONNECTION_TIMEOUT,
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
        forceNew: true
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
        
        // Tentative de reconnexion automatique pour certaines raisons de déconnexion
        if (reason === 'io server disconnect' || reason === 'transport close') {
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [Socket] Erreur de connexion:', error);
        console.error('🔍 [Socket] Détails de l\'erreur:', {
          message: error.message,
        });
        this.isConnecting = false;
        this.connectionPromise = null;
        
        // Tenter une reconnexion après un délai
        this.scheduleReconnect();
      });

      this.socket.on('error', (error) => {
        console.error('❌ [Socket] Erreur Socket.IO:', error);
        this.isConnecting = false;
      });

      // Restaurer les écouteurs d'événements précédents
      this.restoreEventHandlers();

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
      
      // Tenter une reconnexion après un délai
      this.scheduleReconnect();
      
      return null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Éviter les reconnexions multiples
    }
    
    console.log('⏱️ [Socket] Planification d\'une reconnexion dans 3 secondes...');
    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 [Socket] Tentative de reconnexion automatique...');
      this.reconnectTimer = null;
      this.connect().catch(err => {
        console.error('❌ [Socket] Échec de la reconnexion automatique:', err);
      });
    }, 3000);
  }

  private restoreEventHandlers(): void {
    if (!this.socket) return;
    
    // Restaurer tous les écouteurs d'événements enregistrés
    this.eventHandlers.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        console.log('🔄 [Socket] Restauration de l\'écouteur pour:', event);
        this.socket?.on(event, callback);
      });
    });
  }

  private registerEventHandler(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    // Éviter les doublons
    const handlers = this.eventHandlers.get(event) || [];
    if (!handlers.includes(callback)) {
      handlers.push(callback);
      this.eventHandlers.set(event, handlers);
    }
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [Socket] Déconnexion manuelle du socket');
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
      this.isConnecting = false;
      
      // Ne pas effacer les écouteurs enregistrés pour permettre leur restauration
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
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
    if (!this.socket?.connected) {
      console.warn('⚠️ [Socket] Socket non connecté, tentative de reconnexion...');
      await this.connect();
    }
    
    if (this.socket?.connected) {
      console.log('🔄 [Socket] Tentative de rejoindre le workspace:', workspaceId);
      this.socket.emit('join-workspace', workspaceId);
      console.log('📤 [Socket] Événement join-workspace émis');
    } else {
      console.warn('⚠️ [Socket] Impossible de rejoindre le workspace: socket toujours non connecté');
    }
  }

  async joinChat(chatId: string): Promise<void> {
    if (!this.socket?.connected) {
      console.warn('⚠️ [Socket] Socket non connecté, tentative de reconnexion...');
      await this.connect();
    }
    
    if (this.socket?.connected) {
      console.log('🔄 [Socket] Tentative de rejoindre le chat:', chatId);
      this.socket.emit('join-chat', chatId);
      console.log('📤 [Socket] Événement join-chat émis');
    } else {
      console.warn('⚠️ [Socket] Impossible de rejoindre le chat: socket toujours non connecté');
    }
  }

  // Méthode pour envoyer un message
  async sendMessage(chatId: string, content: string, tempId?: string): Promise<void> {
    if (!this.socket?.connected) {
      console.warn('⚠️ [Socket] Socket non connecté, tentative de reconnexion avant envoi...');
      await this.connect();
    }
    
    if (this.socket?.connected) {
      console.log('📤 [Socket] Envoi du message:', { chatId, content, tempId });
      this.socket.emit('send-message', {
        chatId,
        content,
        tempId
      });
      console.log('📤 [Socket] Événement send-message émis');
    } else {
      console.warn('⚠️ [Socket] Impossible d\'envoyer le message: socket toujours non connecté');
      throw new Error('Socket non connecté');
    }
  }

  // Écouteurs d'événements
  onNewMessage(callback: (data: any) => void): void {
    this.registerEventHandler('new-message', callback);
    
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
    this.registerEventHandler('message-sent', callback);
    
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
    this.registerEventHandler('chat-joined', callback);
    
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
    this.registerEventHandler('workspace-joined', callback);
    
    this.socket?.on('workspace-joined', (data) => {
      console.log('📥 [Socket] Workspace rejoint avec succès:', data);
      console.log('📊 [Socket] Détails du workspace:', {
        workspaceId: data.workspaceId,
        timestamp: new Date().toISOString()
      });
      callback(data);
    });
  }

  onError(callback: (error: any) => void): void {
    this.registerEventHandler('error', callback);
    
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

  offError(): void {
    this.socket?.off('error');
  }

  // Méthode pour nettoyer tous les écouteurs
  offAll(): void {
    if (!this.socket) return;
    
    this.socket.off('new-message');
    this.socket.off('message-sent');
    this.socket.off('chat-joined');
    this.socket.off('workspace-joined');
    this.socket.off('error');
    
    console.log('🧹 [Socket] Tous les écouteurs ont été nettoyés');
  }
}

// Instance singleton
export const socketService = new SocketService(); 