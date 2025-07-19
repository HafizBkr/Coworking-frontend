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
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function SimpleTokenTest() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTest = async () => {
    if (!session?.token || !currentWorkspace?._id) {
      toast.error('Session ou workspace manquant');
      return;
    }

    setIsTesting(true);
    setResults(null);

    try {
      console.log('[SimpleTokenTest] Starting token test...');
      
      const testResults = {
        sessionToken: session.token,
        sessionTokenLength: session.token.length,
        isSessionTokenJWT: AuthService.isJWTToken(session.token),
        sessionTokenPayload: AuthService.decodeJWT(session.token),
        workspaceId: currentWorkspace._id,
        userId: session.user?.id,
        tests: []
      };

      // Test 1: Santé du serveur
      try {
        const isHealthy = await VisioService.checkHealth();
        testResults.tests.push({
          name: 'Santé du serveur',
          success: isHealthy,
          error: null
        });
      } catch (error: any) {
        testResults.tests.push({
          name: 'Santé du serveur',
          success: false,
          error: error.message
        });
      }

      // Test 2: Création de salle
      try {
        const response = await VisioService.createRoom(currentWorkspace._id, session.token);
        testResults.tests.push({
          name: 'Création de salle',
          success: true,
          roomId: response.roomId,
          error: null
        });
      } catch (error: any) {
        testResults.tests.push({
          name: 'Création de salle',
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }

      setResults(testResults);
      console.log('[SimpleTokenTest] Test completed:', testResults);
      
    } catch (error: any) {
      console.error('[SimpleTokenTest] Test failed:', error);
      setResults({
        error: error.message,
        tests: []
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5 text-blue-500" />
          <span>Test Simple du Token</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Test rapide du token avec le backend</p>
            <p className="text-xs text-muted-foreground">
              Vérifie si le token fonctionne avec l'API de visioconférence
            </p>
          </div>
          <Button
            onClick={runTest}
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
                <TestTube className="h-4 w-4 mr-2" />
                Lancer le test
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Informations du token */}
            <div className="bg-muted p-3 rounded">
              <h4 className="font-medium mb-2">Informations du token :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Longueur : {results.sessionTokenLength}</div>
                <div>Type JWT : {results.isSessionTokenJWT ? '✅' : '❌'}</div>
                <div>User ID : {results.userId || 'Non disponible'}</div>
                <div>Workspace ID : {results.workspaceId}</div>
              </div>
              {results.sessionTokenPayload && (
                <div className="mt-2">
                  <details className="text-xs">
                    <summary className="cursor-pointer">Contenu du token</summary>
                    <pre className="mt-1 bg-background p-2 rounded overflow-auto">
                      {JSON.stringify(results.sessionTokenPayload, null, 2)}
                    </pre>
                  </details>
                </div>
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
                  
                  {test.roomId && (
                    <div className="mt-2 text-sm">
                      <strong>Room ID créée :</strong> <code className="bg-white px-1 rounded">{test.roomId}</code>
                    </div>
                  )}
                  
                  {test.error && (
                    <div className="mt-2 text-sm">
                      <strong>Erreur :</strong> {test.error}
                      {test.status && <div><strong>Status :</strong> {test.status}</div>}
                      {test.data && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs">Détails de l'erreur</summary>
                          <pre className="mt-1 bg-background p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* État actuel */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Session :</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace :</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
          <p><strong>User :</strong> {session?.user?.id ? '✅' : '❌'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 