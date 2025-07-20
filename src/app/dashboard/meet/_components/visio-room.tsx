"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVideoConference } from "../_hooks/use-video-conference";
import { useSessionContext } from "@/context/SessionContext";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Send,
  Users,
  MessageSquare,
  Phone,
  PhoneOff,
} from "lucide-react";

export function VisioRoom() {
  const session = useSessionContext();
  const {
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
  } = useVideoConference();

  const [message, setMessage] = useState("");

  const currentUser = participants.find((p) => p.userID === session?.user?.id);
  const isCurrentUserMuted = currentUser?.audioMuted || false;
  const isCurrentUserVideoOff = currentUser?.videoOff || false;
  const isCurrentUserScreenSharing = currentUser?.screenSharing || false;

  const handleSendMessage = () => {
    if (sendChatMessage(message)) {
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLeaveRoom = () => {
    if (confirm("Voulez-vous vraiment quitter la salle ?")) {
      window.location.href = "/dashboard/meet";
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <PhoneOff className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erreur de connexion</h3>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={connect} disabled={isConnecting}>
            {isConnecting ? "Reconnexion..." : "Réessayer"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold">
                Salle de visioconférence
              </h2>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected
                ? "Connecté"
                : isConnecting
                  ? "Connexion..."
                  : "Déconnecté"}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {actualRoomId && (
              <Badge variant="outline" className="font-mono text-xs">
                {actualRoomId}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleLeaveRoom}>
              Quitter
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone principale - Participants */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Participants ({participants.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {participants.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun participant pour le moment
                    </p>
                  ) : (
                    participants.map((participant) => (
                      <div
                        key={participant.userID}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {participant.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {participant.username}
                              {participant.userID === session?.user?.id && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  Vous
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {participant.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {participant.audioMuted && (
                            <Badge variant="destructive" className="text-xs">
                              <MicOff className="h-3 w-3 mr-1" />
                              Muet
                            </Badge>
                          )}
                          {participant.videoOff && (
                            <Badge variant="destructive" className="text-xs">
                              <VideoOff className="h-3 w-3 mr-1" />
                              Caméra off
                            </Badge>
                          )}
                          {participant.screenSharing && (
                            <Badge variant="default" className="text-xs">
                              <Monitor className="h-3 w-3 mr-1" />
                              Partage écran
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat */}
        <div className="w-80 border-l">
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100vh-200px)]">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {chat.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun message pour le moment
                    </p>
                  ) : (
                    chat.map((msg, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {msg.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded">
                          {msg.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={!isConnected}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!isConnected || !message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contrôles */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isCurrentUserMuted ? "destructive" : "outline"}
            size="lg"
            onClick={toggleMute}
            disabled={!isConnected}
          >
            {isCurrentUserMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isCurrentUserVideoOff ? "destructive" : "outline"}
            size="lg"
            onClick={toggleVideo}
            disabled={!isConnected}
          >
            {isCurrentUserVideoOff ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant={isCurrentUserScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            disabled={!isConnected}
          >
            {isCurrentUserScreenSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </Button>

          <Button variant="destructive" size="lg" onClick={handleLeaveRoom}>
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
