"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { VisioService } from '../_services/visio.service';
import { AuthService } from '../_services/auth.service';
import { toast } from 'sonner';
import { Bug, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function ApiDebugTest() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDebugTest = async () => {
    if (!session?.token || !currentWorkspace?._id) {
      toast.error('Session ou workspace manquant');
      return;
    }

    setIsTesting(true);
    setResults(null);

    try {
      console.log('[ApiDebugTest] Starting debug test...');
      
      const debugResults = {
        timestamp: new Date().toISOString(),
        session: {
          hasToken: !!session.token,
          tokenLength: session.token?.length || 0,
          tokenPreview: session.token ? `${session.token.substring(0, 20)}...` : 'none',
          isJWT: AuthService.isJWTToken(session.token || ''),
          tokenPayload: AuthService.decodeJWT(session.token || ''),
          userId: session.user?.id,
          userEmail: session.user?.email
        },
        workspace: {
          id: currentWorkspace._id,
          name: currentWorkspace.name
        },
        tests: []
      };

      // Test 1: Santé du serveur
      try {
        console.log('[ApiDebugTest] Testing server health...');
        const isHealthy = await VisioService.checkHealth();
        debugResults.tests.push({
          name: 'Santé du serveur',
          success: isHealthy,
          error: null,
          details: { url: 'https://visoconf-service-go.onrender.com/health' }
        });
        console.log('[ApiDebugTest] Server health result:', isHealthy);
      } catch (error: any) {
        console.error('[ApiDebugTest] Server health failed:', error);
        debugResults.tests.push({
          name: 'Santé du serveur',
          success: false,
          error: error.message,
          details: { 
            url: 'https://visoconf-service-go.onrender.com/health',
            status: error.response?.status,
            data: error.response?.data
          }
        });
      }

      // Test 2: Test de l'URL /rooms
      try {
        console.log('[ApiDebugTest] Testing /rooms endpoint...');
        const response = await fetch('https://visoconf-service-go.onrender.com/api/visio/room', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ workspaceId: currentWorkspace._id })
        });
        
        const responseData = await response.text();
        console.log('[ApiDebugTest] /rooms response:', response.status, responseData);
        
        debugResults.tests.push({
          name: 'Endpoint /api/visio/room',
          success: response.ok,
          error: response.ok ? null : `HTTP ${response.status}`,
          details: { 
            url: 'https://visoconf-service-go.onrender.com/api/visio/room',
            status: response.status,
            data: responseData,
            headers: Object.fromEntries(response.headers.entries())
          }
        });
      } catch (error: any) {
        console.error('[ApiDebugTest] /rooms test failed:', error);
        debugResults.tests.push({
          name: 'Endpoint /api/visio/room',
          success: false,
          error: error.message,
          details: { 
            url: 'https://visoconf-service-go.onrender.com/api/visio/room',
            error: error.toString()
          }
        });
      }

      // Test 3: Test avec VisioService
      try {
        console.log('[ApiDebugTest] Testing VisioService.createRoom...');
        const response = await VisioService.createRoom(currentWorkspace._id, session.token);
        debugResults.tests.push({
          name: 'VisioService.createRoom',
          success: true,
          error: null,
          details: { 
            roomId: response.roomId,
            method: 'VisioService.createRoom'
          }
        });
        console.log('[ApiDebugTest] VisioService result:', response);
      } catch (error: any) {
        console.error('[ApiDebugTest] VisioService test failed:', error);
        debugResults.tests.push({
          name: 'VisioService.createRoom',
          success: false,
          error: error.message,
          details: { 
            method: 'VisioService.createRoom',
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
          }
        });
      }

      setResults(debugResults);
      console.log('[ApiDebugTest] Debug test completed:', debugResults);
      
    } catch (error: any) {
      console.error('[ApiDebugTest] Debug test failed:', error);
      setResults({
        error: error.message,
        tests: []
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-red-500" />
          <span>Debug API - Création de Salle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Test détaillé de l'API de création de salle</p>
            <p className="text-xs text-muted-foreground">
              Identifie exactement où l'erreur se produit
            </p>
          </div>
          <Button
            onClick={runDebugTest}
            disabled={isTesting || !session?.token || !currentWorkspace?._id}
            size="sm"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Lancer le debug
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Informations de session */}
            <div className="bg-muted p-3 rounded">
              <h4 className="font-medium mb-2">Informations de session :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Token présent : {results.session.hasToken ? '✅' : '❌'}</div>
                <div>Longueur token : {results.session.tokenLength}</div>
                <div>Type JWT : {results.session.isJWT ? '✅' : '❌'}</div>
                <div>User ID : {results.session.userId || 'Non disponible'}</div>
                <div>User Email : {results.session.userEmail || 'Non disponible'}</div>
                <div>Workspace ID : {results.workspace.id}</div>
              </div>
              {results.session.tokenPayload && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Contenu du token</summary>
                  <pre className="mt-1 bg-background p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(results.session.tokenPayload, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Résultats des tests */}
            <div className="space-y-2">
              <h4 className="font-medium">Résultats des tests :</h4>
              {results.tests.map((test: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    test.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {test.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <Badge variant={test.success ? "default" : "destructive"}>
                      {test.success ? "Succès" : "Échec"}
                    </Badge>
                  </div>
                  
                  {test.error && (
                    <div className="mt-2 text-sm">
                      <strong>Erreur :</strong> {test.error}
                    </div>
                  )}
                  
                  {test.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs">Détails techniques</summary>
                      <pre className="mt-1 bg-background p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground">
              Test exécuté le : {results.timestamp}
            </div>
          </div>
        )}

        {/* État actuel */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Session :</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace :</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
          <p><strong>Token JWT :</strong> {session?.token && AuthService.isJWTToken(session.token) ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 