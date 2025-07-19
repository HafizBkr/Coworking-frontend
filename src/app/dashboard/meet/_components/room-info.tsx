"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Copy, Video, Users } from 'lucide-react';
import { toast } from 'sonner';

export function RoomInfo() {
  const params = useParams();
  const roomId = params.meetId as string;

  const copyRoomId = () => {
    if (roomId && roomId !== 'test' && roomId !== 'new') {
      navigator.clipboard.writeText(roomId);
      toast.success('ID de salle copié !');
    }
  };

  const getRoomStatus = () => {
    if (!roomId || roomId === 'test' || roomId === 'new') {
      return { status: 'Création...', color: 'bg-yellow-500' };
    }
    return { status: 'Active', color: 'bg-green-500' };
  };

  const roomStatus = getRoomStatus();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Informations de salle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Statut :</span>
          <Badge className={roomStatus.color}>
            {roomStatus.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm font-medium">ID de salle :</span>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-2 py-1 bg-muted rounded text-xs font-mono">
              {roomId || 'En cours de création...'}
            </code>
            {roomId && roomId !== 'test' && roomId !== 'new' && (
              <button
                onClick={copyRoomId}
                className="p-1 hover:bg-muted rounded"
                title="Copier l'ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Partagez cet ID pour inviter d'autres participants</span>
        </div>
      </CardContent>
    </Card>
  );
} 