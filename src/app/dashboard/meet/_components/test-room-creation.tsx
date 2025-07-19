"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { VisioService } from '../_services/visio.service';
import { toast } from 'sonner';
import { Video, Loader2, Bug } from 'lucide-react';

export function TestRoomCreation() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRoomCreation = async () => {
    if (!session?.token) {
      toast.error('Veuillez vous connecter');
      addLog('❌ Pas de token de session');
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error('Aucun workspace sélectionné');
      addLog('❌ Pas de workspace sélectionné');
      return;
    }

    try {
      setIsCreating(true);
      setLogs([]);
      
      addLog('🚀 Début du test de création de salle');
      addLog(`👤 Utilisateur: ${session.user?.username} (${session.user?.id})`);
      addLog(`🏢 Workspace: ${currentWorkspace.name} (${currentWorkspace._id})`);
      addLog(`🔑 Token: ${session.token.substring(0, 30)}...`);
      
      // Test de santé du serveur
      addLog('🏥 Vérification de la santé du serveur...');
      const isHealthy = await VisioService.checkHealth();
      if (isHealthy) {
        addLog('✅ Serveur en bonne santé');
      } else {
        addLog('❌ Serveur inaccessible');
        toast.error('Serveur inaccessible');
        return;
      }
      
      // Création de la salle
      addLog('🏗️ Création de la salle...');
      const response = await VisioService.createRoom(currentWorkspace._id, session.token);
      
      addLog(`✅ Salle créée: ${response.roomId}`);
      toast.success(`Salle créée: ${response.roomId}`);
      
      // Test de connexion WebSocket
      addLog('🔌 Test de connexion WebSocket...');
      const ws = VisioService.createWebSocketConnection(response.roomId, session.token);
      
      ws.onopen = () => {
        addLog('✅ WebSocket connecté');
        toast.success('WebSocket connecté avec succès');
      };
      
      ws.onmessage = (event) => {
        addLog(`📨 Message reçu: ${event.data}`);
      };
      
      ws.onerror = (error) => {
        addLog(`❌ Erreur WebSocket: ${error}`);
        toast.error('Erreur WebSocket');
      };
      
      ws.onclose = (event) => {
        addLog(`🔌 WebSocket fermé: code ${event.code}`);
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      addLog(`❌ Erreur: ${errorMessage}`);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Test création de salle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testRoomCreation} 
          disabled={isCreating || !session?.token || !currentWorkspace?._id}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Tester création + WebSocket
            </>
          )}
        </Button>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Logs :</h4>
          <div className="h-64 overflow-y-auto border rounded p-2 bg-muted text-xs font-mono">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Aucun log</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Session:</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace:</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 