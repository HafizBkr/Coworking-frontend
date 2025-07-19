"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionContext } from '@/context/SessionContext';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Play, 
  Square, 
  MessageSquare,
  Wifi,
  WifiOff
} from 'lucide-react';

export function WebSocketTest() {
  const session = useSessionContext();
  const params = useParams();
  const roomId = params.meetId as string;
  
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const connect = () => {
    if (!roomId || !session?.token) {
      toast.error('RoomId ou token manquant');
      return;
    }

    setIsConnecting(true);
    setMessages([]);

    const wsUrl = `wss://visoconf-service-go.onrender.com/ws/room/${roomId}?token=${encodeURIComponent(session.token)}`;
    console.log('[WebSocketTest] Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocketTest] Connected!');
      setIsConnected(true);
      setIsConnecting(false);
      setMessages(prev => [...prev, '✅ Connecté au WebSocket']);
      toast.success('Connecté au WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('[WebSocketTest] Received:', event.data);
      setMessages(prev => [...prev, `📨 ${event.data}`]);
    };

    ws.onerror = (error) => {
      console.error('[WebSocketTest] Error:', error);
      setIsConnected(false);
      setIsConnecting(false);
      setMessages(prev => [...prev, '❌ Erreur WebSocket']);
      toast.error('Erreur WebSocket');
    };

    ws.onclose = (event) => {
      console.log('[WebSocketTest] Closed:', event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      setMessages(prev => [...prev, `🔌 Déconnecté (code: ${event.code})`]);
      toast.info('WebSocket fermé');
    };
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Test disconnect');
      wsRef.current = null;
    }
  };

  const sendTestMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const testMessage = { type: 'chat', data: { message: 'Test message from client' } };
      wsRef.current.send(JSON.stringify(testMessage));
      setMessages(prev => [...prev, `📤 ${JSON.stringify(testMessage)}`]);
    } else {
      toast.error('WebSocket non connecté');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>Test WebSocket</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connecté" : "Déconnecté"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button 
            onClick={connect} 
            disabled={isConnecting || isConnected}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connexion...' : 'Connecter'}
          </Button>
          
          <Button 
            onClick={disconnect} 
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            <Square className="h-4 w-4 mr-2" />
            Déconnecter
          </Button>
          
          <Button 
            onClick={sendTestMessage} 
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Envoyer test
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Messages :</h4>
          <div className="h-64 overflow-y-auto border rounded p-2 bg-muted">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun message</p>
            ) : (
              <div className="space-y-1">
                {messages.map((message, index) => (
                  <div key={index} className="text-xs font-mono">
                    {message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>RoomId:</strong> {roomId || 'Non défini'}</p>
          <p><strong>Token:</strong> {session?.token ? `${session.token.substring(0, 20)}...` : 'Non défini'}</p>
          <p><strong>URL:</strong> {roomId && session?.token ? `wss://visoconf-service-go.onrender.com/ws/room/${roomId}?token=...` : 'Non disponible'}</p>
          <p><strong>Salle de test:</strong> 637ece53-129a-498e-9dd0-909ba0614903</p>
        </div>
      </CardContent>
    </Card>
  );
} 