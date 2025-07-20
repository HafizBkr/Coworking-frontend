"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
import { useWorkspaceStore } from "@/stores/workspace.store";
import {
  VisioService,
  Participant,
  WSMessage,
} from "../_services/visio.service";
import { toast } from "sonner";

interface ChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

export function useVideoConference() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const params = useParams();
  const roomId = params.meetId as string;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actualRoomId, setActualRoomId] = useState<string | null>(null);

  // Connexion WebSocket selon la documentation
  const connect = useCallback(async () => {
    console.log("[useVideoConference] connect called with:", {
      roomId,
      actualRoomId,
      hasToken: !!session?.token,
      hasWorkspace: !!currentWorkspace?._id,
      tokenPreview: session?.token
        ? `${session.token.substring(0, 20)}...`
        : "none",
      isConnecting,
      isConnected,
    });

    if (!session?.token || isConnecting || isConnected) {
      console.log("[useVideoConference] Skipping connection:", {
        noToken: !session?.token,
        isConnecting,
        isConnected,
      });
      return;
    }

    if (!currentWorkspace?._id) {
      console.error("[useVideoConference] No workspace selected");
      toast.error("Veuillez sélectionner un workspace");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      let targetRoomId = actualRoomId || roomId;

      // Si on n'a pas de roomId valide, créer une nouvelle salle
      if (!targetRoomId || targetRoomId === "test" || targetRoomId === "new") {
        console.log(
          "[useVideoConference] Creating new room for workspace:",
          currentWorkspace._id,
        );

        try {
          const response = await VisioService.createRoom(
            currentWorkspace._id,
            session.token,
          );
          targetRoomId = response.roomId;
          setActualRoomId(targetRoomId);

          console.log(
            "[useVideoConference] Room created successfully:",
            targetRoomId,
          );
          toast.success(`Salle créée: ${targetRoomId}`);

          // Mettre à jour l'URL pour refléter le vrai roomId
          if (typeof window !== "undefined") {
            const newUrl = `/dashboard/meet/${targetRoomId}`;
            window.history.replaceState({}, "", newUrl);
          }
        } catch (error) {
          console.error("[useVideoConference] Failed to create room:", error);
          toast.error("Impossible de créer la salle");
          setIsConnecting(false);
          return;
        }
      }

      console.log(
        "[useVideoConference] Starting connection to room:",
        targetRoomId,
      );

      // Créer la connexion WebSocket selon la doc
      const ws = await VisioService.createWebSocketConnection(
        targetRoomId,
        session.token,
      );
      wsRef.current = ws;

      // Gérer les événements WebSocket selon la documentation
      ws.onopen = () => {
        console.log("[useVideoConference] WebSocket connected successfully");
        setIsConnected(true);
        setIsConnecting(false);
        toast.success("Connecté à la salle de conférence");

        // Envoyer le message join automatiquement selon la doc
        VisioService.sendMessage(ws, "join", {});
      };

      ws.onmessage = (event) => {
        try {
          console.log("[useVideoConference] Raw message received:", event.data);
          const message: WSMessage = JSON.parse(event.data);
          console.log("[useVideoConference] Parsed message:", message);
          console.log("[useVideoConference] Message type:", message.type);
          console.log("[useVideoConference] Message data:", message.data);

          handleWebSocketMessage(message);
        } catch (error) {
          console.error("[useVideoConference] Error parsing message:", error);
          console.error("[useVideoConference] Raw message data:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("[useVideoConference] WebSocket error:", error);
        console.error(
          "[useVideoConference] WebSocket readyState:",
          ws.readyState,
        );
        setError("Erreur de connexion WebSocket");
        setIsConnecting(false);
        setIsConnected(false);
        toast.error("Erreur de connexion à la salle");
      };

      ws.onclose = (event) => {
        console.log("[useVideoConference] WebSocket closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        setIsConnected(false);
        setIsConnecting(false);

        if (event.code !== 1000) {
          // Fermeture normale
          toast.info("Déconnecté de la salle de conférence");
        }
      };
    } catch (error) {
      console.error("[useVideoConference] Connection failed:", error);
      setError("Impossible de se connecter à la salle");
      setIsConnecting(false);
      toast.error("Échec de connexion à la salle");
    }
  }, [
    roomId,
    actualRoomId,
    session?.token,
    currentWorkspace?._id,
    isConnecting,
    isConnected,
  ]);

  // Gérer les messages WebSocket selon les types de la documentation
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case "participants":
        setParticipants(message.data);
        console.log("[useVideoConference] Participants updated:", message.data);
        break;

      case "chat": {
        const chatMessage: ChatMessage = {
          user: message.data.user,
          message: message.data.message,
          timestamp: new Date(),
        };
        setChat((prev) => [...prev, chatMessage]);
        console.log("[useVideoConference] Chat message received:", chatMessage);
        break;
      }

      case "join":
        toast.success(`${message.data.user} a rejoint la conférence`);
        console.log("[useVideoConference] User joined:", message.data.user);
        break;

      case "leave":
        toast.info(`${message.data.user} a quitté la conférence`);
        console.log("[useVideoConference] User left:", message.data.user);
        break;

      case "mute":
        toast.info(`${message.data.user} a coupé son micro`);
        console.log("[useVideoConference] User muted:", message.data.user);
        break;

      case "unmute":
        toast.info(`${message.data.user} a rallumé son micro`);
        console.log("[useVideoConference] User unmuted:", message.data.user);
        break;

      case "video_off":
        toast.info(`${message.data.user} a coupé sa caméra`);
        console.log("[useVideoConference] User video off:", message.data.user);
        break;

      case "video_on":
        toast.info(`${message.data.user} a rallumé sa caméra`);
        console.log("[useVideoConference] User video on:", message.data.user);
        break;

      case "screen_share_start":
        toast.info(`${message.data.user} a commencé le partage d'écran`);
        console.log(
          "[useVideoConference] User started screen share:",
          message.data.user,
        );
        break;

      case "screen_share_stop":
        toast.info(`${message.data.user} a arrêté le partage d'écran`);
        console.log(
          "[useVideoConference] User stopped screen share:",
          message.data.user,
        );
        break;

      case "error":
        console.error("[useVideoConference] Server error:", message.data);
        toast.error(`Erreur serveur: ${message.data}`);
        break;

      case "offer":
      case "answer":
      case "candidate":
        console.log(
          "[useVideoConference] WebRTC signaling message:",
          message.type,
          message.data,
        );
        // Ici on pourrait gérer la signalisation WebRTC si nécessaire
        break;

      default:
        console.log(
          "[useVideoConference] Unhandled message type:",
          message.type,
          message.data,
        );
    }
  }, []);

  // Envoyer un message selon le format de la documentation
  const sendMessage = useCallback(
    (type: string, data: Record<string, unknown> = {}) => {
      if (wsRef.current) {
        VisioService.sendMessage(wsRef.current, type, data);
      }
    },
    [],
  );

  // Actions de contrôle selon les types de la documentation
  const toggleMute = useCallback(() => {
    const isMuted = participants.find(
      (p) => p.userID === session?.user?.id,
    )?.audioMuted;
    sendMessage(isMuted ? "unmute" : "mute");
  }, [participants, session?.user?.id, sendMessage]);

  const toggleVideo = useCallback(() => {
    const isVideoOff = participants.find(
      (p) => p.userID === session?.user?.id,
    )?.videoOff;
    sendMessage(isVideoOff ? "video_on" : "video_off");
  }, [participants, session?.user?.id, sendMessage]);

  const toggleScreenShare = useCallback(() => {
    const isScreenSharing = participants.find(
      (p) => p.userID === session?.user?.id,
    )?.screenSharing;
    sendMessage(isScreenSharing ? "screen_share_stop" : "screen_share_start");
  }, [participants, session?.user?.id, sendMessage]);

  const sendChatMessage = useCallback(
    (message: string) => {
      if (message.trim()) {
        sendMessage("chat", { message: message.trim() });
        return true;
      }
      return false;
    },
    [sendMessage],
  );

  // Se connecter automatiquement
  useEffect(() => {
    connect();
  }, [connect]);

  // Nettoyer la connexion
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    participants,
    chat,
    error,
    actualRoomId,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    sendChatMessage,
    connect,
  };
}
