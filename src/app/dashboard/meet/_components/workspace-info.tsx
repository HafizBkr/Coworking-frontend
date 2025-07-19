"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { Building2, AlertCircle, CheckCircle } from 'lucide-react';

export function WorkspaceInfo() {
  const { currentWorkspace } = useWorkspaceStore();

  if (!currentWorkspace) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Aucun workspace sélectionné</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous devez sélectionner un workspace pour créer des salles de visioconférence.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Workspace actuel</span>
          <Badge variant="default">OK</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currentWorkspace.name}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentWorkspace.description}
        </p>
        <div className="text-xs font-mono bg-muted p-2 rounded">
          <strong>ID:</strong> {currentWorkspace._id}
        </div>
      </CardContent>
    </Card>
  );
} 