/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { AuthService } from "./auth.service";

const API_BASE_URL = "https://visoconf-service-go.onrender.com";

export interface CreateRoomResponse {
  roomId: string;
}

export interface Participant {
  userID: string;
  username: string;
  role: string;
  audioMuted: boolean;
  videoOff: boolean;
  screenSharing: boolean;
}

export type WSMessage =
  | { type: "participants"; data: Participant[] }
  | { type: "chat"; data: { user: string; message: string } }
  | { type: "join" | "leave"; data: { user: string } }
  | {
      type:
        | "mute"
        | "unmute"
        | "video_on"
        | "video_off"
        | "screen_share_start"
        | "screen_share_stop";
      data: { user: string };
    }
  | { type: "offer" | "answer" | "candidate"; data: any } // WebRTC signaling
  | { type: string; data: any }; // fallback

export class VisioService {
  /**
   * Récupérer le bon token JWT pour l'authentification
   */
  private static async getValidJWTToken(sessionToken: string): Promise<string> {
    console.log("[VisioService] Getting valid JWT token...");

    // Vérifier si le token de session est déjà un JWT valide
    if (AuthService.isJWTToken(sessionToken)) {
      console.log("[VisioService] Session token is already a valid JWT");
      return sessionToken;
    }

    // Essayer de récupérer le JWT depuis l'API
    let jwtToken = await AuthService.getJWTToken(sessionToken);
    if (jwtToken) {
      console.log("[VisioService] JWT token retrieved from API");
      return jwtToken;
    }

    // Essayer la méthode alternative
    jwtToken = await AuthService.getJWTTokenAlternative(sessionToken);
    if (jwtToken) {
      console.log("[VisioService] JWT token retrieved from alternative method");
      return jwtToken;
    }

    // Fallback : utiliser le token de session
    console.warn(
      "[VisioService] Using session token as fallback (may not work with Go backend)",
    );
    return sessionToken;
  }

  /**
   * Créer une nouvelle salle de visioconférence
   * Backend utilise: POST /api/visio/room (pas /rooms comme dans la doc)
   */
  static async createRoom(
    workspaceId: string,
    sessionToken: string,
  ): Promise<CreateRoomResponse> {
    try {
      console.log("[VisioService] Creating room with:", {
        workspaceId,
        sessionTokenPreview: sessionToken.substring(0, 20) + "...",
        url: `${API_BASE_URL}/api/visio/room`, // URL correcte selon le backend
      });

      // Récupérer le bon token JWT
      const jwtToken = await this.getValidJWTToken(sessionToken);
      console.log(
        "[VisioService] Using JWT token:",
        jwtToken.substring(0, 20) + "...",
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/visio/room`, // URL correcte selon le backend
        { workspaceId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("[VisioService] Room created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[VisioService] Error creating room:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new Error(error.response?.data?.error || "Failed to create room");
    }
  }

  /**
   * Vérifier la santé du serveur
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.status === 200;
    } catch (error) {
      console.error("[VisioService] Health check failed:", error);
      return false;
    }
  }

  /**
   * Créer une connexion WebSocket pour rejoindre une salle
   * Selon la doc: wss://visoconf-service-go.onrender.com/ws/room/{roomId}
   * Le backend accepte le token dans l'URL comme fallback
   */
  static async createWebSocketConnection(
    roomId: string,
    sessionToken: string,
  ): Promise<WebSocket> {
    // Récupérer le bon token JWT
    const jwtToken = await this.getValidJWTToken(sessionToken);
    console.log(
      "[VisioService] Using JWT token for WebSocket:",
      jwtToken.substring(0, 20) + "...",
    );

    // URL selon la documentation exacte
    const wsUrl = `${API_BASE_URL.replace("https://", "wss://")}/ws/room/${roomId}?token=${encodeURIComponent(jwtToken)}`;
    console.log("[VisioService] Connecting to WebSocket:", wsUrl);

    return new WebSocket(wsUrl);
  }

  /**
   * Envoyer un message via WebSocket
   * Format exact selon la doc: { type: string, data: any }
   */
  static sendMessage(ws: WebSocket, type: string, data: any = {}): void {
    if (ws.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type, data };
      ws.send(JSON.stringify(message));
      console.log("[VisioService] Sent message:", message);
    } else {
      console.warn(
        "[VisioService] WebSocket not connected, cannot send message",
      );
    }
  }

  /**
   * Envoyer un message de signalisation WebRTC
   */
  static sendWebRTCMessage(
    ws: WebSocket,
    type: "offer" | "answer" | "candidate",
    data: any,
  ): void {
    this.sendMessage(ws, type, data);
  }
}
