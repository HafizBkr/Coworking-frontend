"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { VisioService } from '../_services/visio.service';
import { AuthService } from '../_services/auth.service';
import { toast } from 'sonner';
import { Wifi, WifiOff, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function WebSocketAuthTest() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [roomId, setRoomId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createRoom = async () => {
    if (!session?.token || !currentWorkspace?._id) {
      toast.error('Session ou workspace manquant');
      return;
    }

    try {
      setIsConnecting(true);
      addMessage('Création de salle...');
      
      const response = await VisioService.createRoom(currentWorkspace._id, session.token);
      setRoomId(response.roomId);
      addMessage(`✅ Salle créée: ${response.roomId}`);
      
      toast.success('Salle créée avec succès');
    } catch (error: any) {
      addMessage(`❌ Erreur création salle: ${error.message}`);
      addMessage(`📋 Détails: Status ${error.response?.status || 'N/A'}`);
      if (error.response?.data) {
        addMessage(`📋 Réponse: ${JSON.stringify(error.response.data)}`);
      }
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWebSocket = async () => {
    if (!roomId || !session?.token) {
      toast.error('Room ID ou token manquant');
      return;
    }

    try {
      setIsConnecting(true);
      addMessage('Connexion WebSocket...');
      
      // Analyser le token
      const isJWT = AuthService.isJWTToken(session.token);
      const tokenPayload = AuthService.decodeJWT(session.token);
      addMessage(`Token JWT: ${isJWT ? '✅' : '❌'}`);
      if (tokenPayload) {
        addMessage(`Token payload: ${JSON.stringify(tokenPayload, null, 2)}`);
      }

      // Créer la connexion WebSocket
      const ws = await VisioService.createWebSocketConnection(roomId, session.token);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        addMessage('✅ WebSocket connecté');
        toast.success('WebSocket connecté');
        
        // Envoyer le message join automatiquement
        VisioService.sendMessage(ws, 'join', {});
        addMessage('📤 Message "join" envoyé');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          addMessage(`📥 Reçu: ${message.type} - ${JSON.stringify(message.data)}`);
          
          if (message.type === 'error') {
            toast.error(`Erreur serveur: ${message.data}`);
          }
        } catch (error) {
          addMessage(`❌ Erreur parsing message: ${event.data}`);
        }
      };

      ws.onerror = (error) => {
        addMessage(`❌ Erreur WebSocket: ${error}`);
        setIsConnected(false);
        setIsConnecting(false);
        toast.error('Erreur WebSocket');
      };

      ws.onclose = (event) => {
        addMessage(`🔌 WebSocket fermé: ${event.code} - ${event.reason}`);
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (error: any) {
      addMessage(`❌ Erreur connexion: ${error.message}`);
      setIsConnecting(false);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    addMessage('🔌 Déconnexion manuelle');
  };

  const sendTestMessage = () => {
    if (!wsRef.current || !testMessage.trim()) return;

    VisioService.sendMessage(wsRef.current, 'chat', { message: testMessage });
    addMessage(`📤 Message chat envoyé: ${testMessage}`);
    setTestMessage('');
  };

  const sendJoinMessage = () => {
    if (!wsRef.current) return;

    VisioService.sendMessage(wsRef.current, 'join', {});
    addMessage('📤 Message "join" envoyé manuellement');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5 text-blue-500" />
          <span>Test WebSocket avec Authentification</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Créer une salle</h4>
            <Button
              onClick={createRoom}
              disabled={isConnecting || !session?.token || !currentWorkspace?._id}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer une salle'
              )}
            </Button>
            {roomId && (
              <div className="text-sm">
                <strong>Room ID:</strong> <code className="bg-muted px-1 rounded">{roomId}</code>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Connexion WebSocket</h4>
            <div className="flex space-x-2">
              <Button
                onClick={connectWebSocket}
                disabled={isConnecting || !roomId || !session?.token}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Connecter
                  </>
                )}
              </Button>
              {isConnected && (
                <Button
                  onClick={disconnectWebSocket}
                  variant="outline"
                  size="sm"
                >
                  <WifiOff className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Status:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connecté" : isConnecting ? "Connexion..." : "Déconnecté"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages de test */}
        <div className="space-y-2">
          <h4 className="font-medium">Messages de test</h4>
          <div className="flex space-x-2">
            <Button
              onClick={sendJoinMessage}
              disabled={!isConnected}
              size="sm"
            >
              Envoyer "join"
            </Button>
            <div className="flex-1 flex space-x-2">
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Message de test..."
                disabled={!isConnected}
                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
              />
              <Button
                onClick={sendTestMessage}
                disabled={!isConnected || !testMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Log des messages */}
        <div className="space-y-2">
          <h4 className="font-medium">Log des messages</h4>
          <div className="bg-muted p-3 rounded h-64 overflow-y-auto text-sm font-mono">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">Aucun message pour le moment</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-1">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Informations de debug */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Session:</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace:</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
          <p><strong>Room ID:</strong> {roomId ? '✅' : '❌'}</p>
          <p><strong>WebSocket:</strong> {isConnected ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 