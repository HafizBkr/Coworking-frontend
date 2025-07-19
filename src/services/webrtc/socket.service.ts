/* eslint-disable @typescript-eslint/no-explicit-any */
import webRTCService from "./webrtc.service";
import { toast } from "sonner";

interface WSMessage {
  type: string;
  data: unknown;
}

// Utiliser une URL de serveur cohérente, avec fallback sur le serveur de production
const primaryUrl = process.env.NEXT_PUBLIC_GO_WS || 'https://visoconf-service-go.onrender.com';
const fallbackUrls = [
  'https://visoconf-service-go.onrender.com', 
  'wss://visoconf-service-go.onrender.com',
  'ws://visoconf-service-go.onrender.com'
];
console.log("[SocketService] Using primary URL:", primaryUrl);

// Constantes pour la gestion des reconnexions
const CONNECTION_TIMEOUT = 15000; // 15 secondes
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_BASE = 2000; // 2 secondes

class SocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private isConnecting: boolean = false;
  private roomId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = MAX_RECONNECT_ATTEMPTS;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private onConnectionStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'failed', error?: string) => void;
  
  /**
   * Initialize WebSocket connection with authentication token
   */
  public async connect(token: string): Promise<WebSocket | null> {
    if (this.isConnecting) {
      console.log('[SocketService] Already connecting, returning current socket');
      return this.socket;
    }
    
    // Notifier le changement d'état
    if (this.onConnectionStatusChange) {
      this.onConnectionStatusChange('connecting');
    }
    
    this.isConnecting = true;
    this.token = token;
    
    try {
      // Si une connexion existe déjà et est active, la fermer pour éviter des problèmes
      if (this.socket) {
        console.log('[SocketService] Closing existing socket connection');
        this.socket.close();
        this.socket = null;
      }
      
      // Vérifications préliminaires
      if (!token || token.trim() === '') {
        console.error('[SocketService] Error: Authentication token is required');
        toast.error("Erreur: Token d'authentification manquant");
        this.isConnecting = false;
        
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange('failed', "Token d'authentification manquant");
        }
        
        throw new Error('Authentication token is required');
      }
      
      if (!this.roomId) {
        console.error('[SocketService] Error: RoomId must be set before connecting');
        toast.error("Erreur: ID de salle non défini");
        this.isConnecting = false;
        
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange('failed', "ID de salle non défini");
        }
        
        throw new Error('RoomId must be set before connecting');
      }
      
      if (!primaryUrl) {
        console.error('[SocketService] Error: WebSocket server URL is not configured');
        toast.error("Erreur: URL du serveur non configurée");
        this.isConnecting = false;
        
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange('failed', "URL du serveur non configurée");
        }
        
        throw new Error('WebSocket server URL is not configured');
      }
      
      // Le backend Go utilise /ws/room/:id avec token dans l'URL
      const buildWsUrl = (baseUrl: string): string => {
        // Si l'URL commence déjà par ws:// ou wss://, ne pas modifier le protocole
        if (baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://')) {
          return `${baseUrl}/ws/room/${this.roomId}?token=${encodeURIComponent(token)}`;
        }
        
        const protocol = baseUrl.startsWith('https://') ? 'wss://' : 'ws://';
        const cleanUrl = baseUrl.replace(/^https?:\/\//, '');
        return `${protocol}${cleanUrl}/ws/room/${this.roomId}?token=${encodeURIComponent(token)}`;
      };
      
      // Utiliser d'abord l'URL primaire
      const wsUrl = buildWsUrl(primaryUrl);
      
      // Préparer les URLs de fallback
      const fallbackWsUrls = fallbackUrls.map(fallbackUrl => buildWsUrl(fallbackUrl));
      
      console.log('[SocketService] Connection diagnostic:', {
        primaryUrl,
        wsUrl,
        fallbackUrls: fallbackWsUrls,
        tokenLength: token.length,
        roomId: this.roomId
      });
      
      return new Promise((resolve, reject) => {
        // Fonction pour essayer une connexion WebSocket avec une URL donnée
        const tryConnect = (url: string, fallbacks: string[], attemptCount: number = 0) => {
          try {
            console.log(`[SocketService] Creating WebSocket connection to: ${url} (attempt ${attemptCount + 1})`);
            // Créer la connexion WebSocket
            this.socket = new WebSocket(url);
            
            // Configure socket timeout
            const connectionTimeout = setTimeout(() => {
              if (this.socket?.readyState === WebSocket.CONNECTING) {
                console.log(`⏰ WebSocket connection timeout for ${url}`);
                this.socket.close();
                
                // Si des URLs de secours sont disponibles, essayer la suivante
                if (fallbacks.length > 0) {
                  const nextUrl = fallbacks.shift()!;
                  console.log(`[SocketService] Trying fallback URL: ${nextUrl}`);
                  toast.info(`Tentative avec une URL alternative...`);
                  tryConnect(nextUrl, fallbacks, attemptCount + 1);
                } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
                  // Essayer à nouveau avec la première URL après un délai
                  this.reconnectAttempts++;
                  const delay = RECONNECT_DELAY_BASE * this.reconnectAttempts;
                  console.log(`[SocketService] All URLs failed, retrying in ${delay}ms`);
                  toast.info(`Nouvelle tentative dans ${delay/1000} secondes...`);
                  setTimeout(() => {
                    tryConnect(wsUrl, [...fallbackWsUrls], attemptCount + 1);
                  }, delay);
                } else {
                  // Abandon après trop de tentatives
                  this.isConnecting = false;
                  if (this.onConnectionStatusChange) {
                    this.onConnectionStatusChange('failed', "Impossible de se connecter après plusieurs tentatives");
                  }
                  toast.error("Échec de connexion. Veuillez vérifier votre connexion internet.");
                  reject(new Error("WebSocket connection timeout on all URLs"));
                }
              }
            }, CONNECTION_TIMEOUT);
        
        this.socket.onopen = () => {
          console.log("✅ WebSocket connected successfully");
            toast.success("Connexion établie avec succès");
          this.isConnecting = false;
            this.reconnectAttempts = 0;
            clearTimeout(connectionTimeout);
            
            if (this.onConnectionStatusChange) {
              this.onConnectionStatusChange('connected');
            }
            
            // Démarrer la surveillance de la connexion
            this.startConnectionMonitoring();
            
            // Envoyer un message test pour vérifier que la connexion est bien établie
            this.sendPing();
            
          resolve(this.socket);
        };
        
        this.socket.onerror = (error) => {
          console.error("❌ WebSocket connection error:", error);
          this.isConnecting = false;
            clearTimeout(connectionTimeout);
            
            // Si des URLs de secours sont disponibles, essayer la suivante
            if (fallbacks.length > 0) {
              const nextUrl = fallbacks.shift()!;
              console.log(`[SocketService] Connection error, trying fallback URL: ${nextUrl}`);
              toast.info(`Essai avec une URL alternative...`);
              tryConnect(nextUrl, fallbacks, attemptCount + 1);
            } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
              // Si toutes les URLs ont échoué mais il reste des tentatives
              this.reconnectAttempts++;
              const delay = RECONNECT_DELAY_BASE * this.reconnectAttempts;
              console.log(`[SocketService] All URLs failed, retrying in ${delay}ms`);
              toast.info(`Nouvelle tentative dans ${delay/1000} secondes...`);
              setTimeout(() => {
                tryConnect(wsUrl, [...fallbackWsUrls], attemptCount + 1);
              }, delay);
            } else {
              if (this.onConnectionStatusChange) {
                this.onConnectionStatusChange('failed', "Erreur de connexion au serveur");
              }
              toast.error("Impossible de se connecter après plusieurs tentatives");
              reject(new Error("Failed to connect to WebSocket server after multiple attempts"));
            }
        };
        
        this.socket.onclose = (event) => {
          console.log("🔌 WebSocket disconnected:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          this.isConnecting = false;
            clearTimeout(connectionTimeout);
            
            if (this.onConnectionStatusChange) {
              this.onConnectionStatusChange('disconnected');
            }
            
            // Tentative de reconnexion si la déconnexion n'était pas volontaire
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              const delay = RECONNECT_DELAY_BASE * this.reconnectAttempts;
              console.log(`[SocketService] Attempting reconnect after unexpected close ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
              toast.info(`Reconnexion après déconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
              setTimeout(() => {
                this.connect(token);
              }, delay);
            }
          };
          
          // Message handler
          this.socket.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              console.log("[SocketService] Received message:", message);
              
              // Gérer les messages spéciaux du serveur
              if (message.type === 'error') {
                console.error("[SocketService] Server error:", message.data);
                toast.error(`Erreur serveur: ${message.data}`);
              } else if (message.type === 'participants') {
                // Traiter la liste des participants
                console.log("[SocketService] Received participants list:", message.data);
                // Émettre un événement personnalisé pour que d'autres composants puissent réagir
                const participantsEvent = new CustomEvent('room-participants-updated', { 
                  detail: { participants: message.data } 
                });
                window.dispatchEvent(participantsEvent);
              } else if (message.type === 'join') {
                console.log("[SocketService] User joined:", message.data);
                // Demander une mise à jour de la liste des participants
                this.sendMessage('get_participants', { roomId: this.roomId });
              } else if (message.type === 'leave') {
                console.log("[SocketService] User left:", message.data);
                // Demander une mise à jour de la liste des participants
                this.sendMessage('get_participants', { roomId: this.roomId });
              }
              
              // Transmettre le message au webRTCService
              const messageEvent = new CustomEvent('socket-message', { 
                detail: { message } 
              });
              window.dispatchEvent(messageEvent);
            } catch (e) {
              console.warn("[SocketService] Failed to parse message:", e);
            }
          };
        } catch (error) {
          console.error("❌ Error setting up WebSocket:", error);
            this.isConnecting = false;
          
          if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange('failed', error instanceof Error ? error.message : "Erreur inconnue");
          }
          
          reject(error);
        }
      };
      
      // Démarrer le processus de connexion avec l'URL primaire et les URLs de secours
      tryConnect(wsUrl, [...fallbackWsUrls]);
      });
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      this.isConnecting = false;
      
      if (this.onConnectionStatusChange) {
        this.onConnectionStatusChange('failed', error instanceof Error ? error.message : "Erreur inconnue");
      }
      
      return null;
    }
  }
  
  /**
   * Envoyer un ping pour vérifier la connexion
   */
  private sendPing() {
    if (this.isConnected()) {
      this.sendMessage('ping', { timestamp: new Date().toISOString() });
    }
  }
  
  /**
   * Join a video conference room
   */
  public async joinRoom(roomId: string): Promise<boolean> {
    if (!roomId || roomId.trim() === '') {
      console.error('[SocketService] Error: Invalid roomId provided:', roomId);
      toast.error("ID de salle invalide");
      return false;
    }
    
    this.roomId = roomId;
    console.log('[SocketService] Room ID set to:', roomId);
    
    // Si nous étions déjà connectés à une autre salle, déconnectons-nous d'abord
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('[SocketService] Already connected to a room, disconnecting first');
      this.socket.close();
      this.socket = null;
    }
    
    // Réinitialiser le compteur de tentatives pour pouvoir essayer à nouveau
    this.reconnectAttempts = 0;
    
    // Si nous avons déjà un token, tenter une connexion immédiate
    if (this.token) {
      try {
        console.log('[SocketService] Attempting immediate connection with existing token');
        await this.connect(this.token);
        return true;
      } catch (error) {
        console.error('[SocketService] Failed to connect with existing token:', error);
      return false;
      }
    }
    
    return true;
  }
  
  /**
   * Leave a video conference room
   */
  public leaveRoom() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    webRTCService.leaveRoom();
  }
  
  /**
   * Disconnect WebSocket
   */
  public disconnect() {
    // Arrêter la surveillance de connexion
    this.stopConnectionMonitoring();
    
    if (this.socket) {
      try {
        console.log('[SocketService] Disconnecting websocket');
      this.socket.close();
      } catch (e) {
        console.error('[SocketService] Error closing socket:', e);
      } finally {
      this.socket = null;
      this.token = null;
      this.roomId = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        if (this.onConnectionStatusChange) {
          this.onConnectionStatusChange('disconnected');
        }
      }
    }
  }
  
  /**
   * Get the WebSocket instance
   */
  public getSocket(): WebSocket | null {
    return this.socket;
  }
  
  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Set callback for connection status changes
   */
  public setConnectionStatusCallback(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'failed', error?: string) => void) {
    this.onConnectionStatusChange = callback;
  }
  
  /**
   * Get detailed diagnostic information about the connection
   */
  public getDiagnosticInfo(): Record<string, any> {
    return {
      isConnected: this.isConnected(),
      connectionState: this.socket ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState] : 'NO_SOCKET',
      isConnecting: this.isConnecting,
      hasToken: !!this.token,
      tokenLength: this.token?.length || 0,
      roomId: this.roomId,
      reconnectAttempts: this.reconnectAttempts,
      serverUrl: primaryUrl,
    };
  }
  
  /**
   * Envoyer une requête pour obtenir la liste des participants dans une salle
   */
  public requestRoomParticipants() {
    if (this.isConnected() && this.roomId) {
      console.log('[SocketService] Requesting room participants');
      // Envoyer un message spécial pour demander la liste des participants
      this.sendMessage('room_info', {});
    } else {
      console.warn('[SocketService] Cannot request participants: not connected or no roomId');
    }
  }
  
  /**
   * Vérifie activement l'état de la connexion
   */
  private startConnectionMonitoring() {
    // Arrêter toute surveillance existante
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    
    // Vérifier périodiquement l'état de la connexion
    this.connectionCheckInterval = setInterval(() => {
      if (this.socket) {
        if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
          console.warn('[SocketService] Connection monitor detected closed socket');
          
          if (this.onConnectionStatusChange) {
            this.onConnectionStatusChange('disconnected');
          }
          
          // Tenter une reconnexion si nous avons encore des tentatives disponibles
          if (this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`[SocketService] Connection monitor initiating reconnection`);
            this.connect(this.token);
          }
        }
      }
    }, 10000); // Vérifier toutes les 10 secondes
  }
  
  /**
   * Arrête la surveillance de connexion
   */
  private stopConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }
  
  /**
   * Send a message to the server
   */
  public sendMessage(type: string, data: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type, data };
      console.log('[SocketService] Sending message:', message);
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[SocketService] Cannot send message: WebSocket not connected');
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;
