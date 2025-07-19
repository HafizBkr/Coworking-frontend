"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSessionContext } from '@/context/SessionContext';
import { VisioService } from '../_services/visio.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Video, Loader2, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace.store';

export function CreateRoomTest() {
  const session = useSessionContext();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('');
  const { currentWorkspace } = useWorkspaceStore();

  const createRoom = async () => {
    if (!session?.token) {
      toast.error('Veuillez vous connecter');
      return;
    }

    if (!workspaceId.trim()) {
      toast.error('Veuillez entrer un ID de workspace');
      return;
    }

    try {
      setIsCreating(true);
      
      console.log('[CreateRoomTest] Creating room for workspace:', workspaceId);
      
      const response = await VisioService.createRoom(workspaceId.trim() || currentWorkspace?._id || '', session.token);
      
      console.log('[CreateRoomTest] Room created:', response);
      
      toast.success(`Salle créée: ${response.roomId}`);
      
      // Rediriger vers la nouvelle salle
      router.push(`/dashboard/meet/${response.roomId}`);
      
    } catch (error: unknown) {
      console.error('[CreateRoomTest] Error creating room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const createTestRoom = async () => {
    if (!session?.token) {
      toast.error('Veuillez vous connecter');
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error('Aucun workspace sélectionné');
      return;
    }

    try {
      setIsCreating(true);
      
      // Utiliser le workspace courant
      const workspaceId = currentWorkspace._id;
      console.log('[CreateRoomTest] Creating test room for workspace:', workspaceId);
      
      const response = await VisioService.createRoom(workspaceId, session.token);
      
      console.log('[CreateRoomTest] Test room created:', response);
      
      toast.success(`Salle de test créée: ${response.roomId}`);
      
      // Rediriger vers la nouvelle salle
      router.push(`/dashboard/meet/${response.roomId}`);
      
    } catch (error: unknown) {
      console.error('[CreateRoomTest] Error creating test room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Créer une salle de test</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workspaceId">ID du workspace</Label>
          <Input
            id="workspaceId"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            placeholder="Entrez l'ID de votre workspace"
            disabled={isCreating}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={createRoom} 
            disabled={isCreating || !workspaceId.trim()}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Créer salle
              </>
            )}
          </Button>
          
          <Button 
            onClick={createTestRoom} 
            disabled={isCreating}
            variant="outline"
          >
            Test
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Utilisateur:</strong> {session?.user?.username || 'Non connecté'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'Non défini'}</p>
          <p><strong>Workspace actuel:</strong> {currentWorkspace?.name || 'Aucun workspace'}</p>
          <p><strong>Workspace ID:</strong> {currentWorkspace?._id || 'Non défini'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 