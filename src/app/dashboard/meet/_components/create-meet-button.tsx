"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { VisioService } from '../_services/visio.service';
import { toast } from 'sonner';
import { Video, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateMeetButton() {
  const session = useSessionContext();
    const { currentWorkspace } = useWorkspaceStore();
    const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const createRoom = async () => {
    if (!session?.token) {
      toast.error('Veuillez vous connecter');
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error('Veuillez sélectionner un workspace');
            return;
        }

    try {
      setIsCreating(true);
      setCreatedRoomId(null);

      console.log('[CreateMeetButton] Creating room for workspace:', currentWorkspace._id);
      
      const response = await VisioService.createRoom(currentWorkspace._id, session.token);
      
      console.log('[CreateMeetButton] Room created:', response.roomId);
      setCreatedRoomId(response.roomId);
      
      toast.success(`Salle créée: ${response.roomId}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('[CreateMeetButton] Error creating room:', error);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const copyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      toast.success('ID de salle copié !');
    }
  };

  const joinRoom = () => {
    if (createdRoomId) {
      router.push(`/dashboard/meet/${createdRoomId}`);
    }
  };

  const createNewRoom = () => {
    setCreatedRoomId(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Créer une salle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!createdRoomId ? (
          <>
            <div className="text-sm text-muted-foreground">
              <p>Créez une nouvelle salle de visioconférence pour votre workspace.</p>
              {currentWorkspace && (
                <p className="mt-2 font-medium">
                  Workspace: <span className="text-primary">{currentWorkspace.name}</span>
                </p>
              )}
            </div>
            
            <Button 
              onClick={createRoom} 
              disabled={isCreating || !session?.token || !currentWorkspace?._id}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Créer une salle
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-green-600 mb-2">✅ Salle créée avec succès !</p>
              <p>Partagez cet ID avec vos collègues pour qu'ils puissent rejoindre la visioconférence.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">ID de la salle :</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
                  {createdRoomId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomId}
                  title="Copier l'ID"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={joinRoom}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Rejoindre
              </Button>
              <Button 
                variant="outline"
                onClick={createNewRoom}
              >
                Nouvelle salle
        </Button>
            </div>
          </>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Session:</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace:</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
