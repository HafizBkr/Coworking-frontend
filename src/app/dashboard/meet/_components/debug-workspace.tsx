"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useSessionContext } from '@/context/SessionContext';
import { Badge } from '@/components/ui/badge';
import { Database, User, Building2 } from 'lucide-react';

export function DebugWorkspace() {
  const { currentWorkspace } = useWorkspaceStore();
  const session = useSessionContext();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Debug Workspace Store</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Session</span>
          </h4>
          <div className="text-xs space-y-1">
            <p><strong>User ID:</strong> {session?.user?.id || 'Non défini'}</p>
            <p><strong>Username:</strong> {session?.user?.username || 'Non défini'}</p>
            <p><strong>Token:</strong> {session?.token ? `${session.token.substring(0, 30)}...` : 'Non défini'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Workspace Store</span>
            <Badge variant={currentWorkspace ? "default" : "destructive"}>
              {currentWorkspace ? "Défini" : "Non défini"}
            </Badge>
          </h4>
          {currentWorkspace ? (
            <div className="text-xs space-y-1">
              <p><strong>ID:</strong> {currentWorkspace._id}</p>
              <p><strong>Nom:</strong> {currentWorkspace.name}</p>
              <p><strong>Description:</strong> {currentWorkspace.description}</p>
              <p><strong>Logo:</strong> {currentWorkspace.logo}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun workspace dans le store</p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Store Raw Data</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({ currentWorkspace }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
} 