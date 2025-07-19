"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { VisioService } from '../_services/visio.service';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export function TokenDiagnostics() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  };

  const testTokenWithBackend = async () => {
    if (!session?.token || !currentWorkspace?._id) {
      toast.error('Token ou workspace manquant');
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      console.log('[TokenDiagnostics] Testing token with backend...');
      
      // Test 1: Vérifier la santé du serveur
      const isHealthy = await VisioService.checkHealth();
      console.log('[TokenDiagnostics] Server health:', isHealthy);

      // Test 2: Tenter de créer une salle
      const response = await VisioService.createRoom(currentWorkspace._id, session.token);
      console.log('[TokenDiagnostics] Room creation response:', response);

      setTestResults({
        success: true,
        serverHealth: isHealthy,
        roomCreated: true,
        roomId: response.roomId,
        message: 'Token valide - Salle créée avec succès'
      });

      toast.success('Test réussi ! Token valide.');
      
    } catch (error: any) {
      console.error('[TokenDiagnostics] Test failed:', error);
      
      setTestResults({
        success: false,
        serverHealth: false,
        roomCreated: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        message: 'Échec du test - Token invalide ou problème de permissions'
      });

      toast.error(`Test échoué: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return { error: 'Token invalide ou non-JWT' };
    }
  };

  const tokenData = session?.token ? decodeJWT(session.token) : null;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Diagnostic du Token</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* État de la session */}
        <div className="space-y-2">
          <h4 className="font-medium">État de la session :</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <span>Token présent :</span>
              <Badge variant={session?.token ? "default" : "destructive"}>
                {session?.token ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span>Utilisateur :</span>
              <Badge variant={session?.user ? "default" : "destructive"}>
                {session?.user ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span>Workspace :</span>
              <Badge variant={currentWorkspace?._id ? "default" : "destructive"}>
                {currentWorkspace?._id ? "✅" : "❌"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span>Chargement :</span>
              <Badge variant={session?.isLoading ? "secondary" : "default"}>
                {session?.isLoading ? "⏳" : "✅"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Token brut */}
        {session?.token && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Token JWT :</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(session.token!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-muted p-3 rounded text-xs font-mono break-all">
              {showToken ? session.token : session.token.substring(0, 50) + '...'}
            </div>
          </div>
        )}

        {/* Décodage du token */}
        {tokenData && !tokenData.error && (
          <div className="space-y-2">
            <h4 className="font-medium">Contenu du token :</h4>
            <div className="bg-muted p-3 rounded text-xs">
              <pre className="whitespace-pre-wrap">{JSON.stringify(tokenData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Test du token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Test avec le backend :</h4>
            <Button
              onClick={testTokenWithBackend}
              disabled={isTesting || !session?.token || !currentWorkspace?._id}
              size="sm"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Test...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tester
                </>
              )}
            </Button>
          </div>
          
          {testResults && (
            <div className={`p-3 rounded border ${testResults.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {testResults.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">{testResults.message}</span>
              </div>
              
              <div className="text-sm space-y-1">
                <div>Santé serveur: {testResults.serverHealth ? '✅' : '❌'}</div>
                <div>Salle créée: {testResults.roomCreated ? '✅' : '❌'}</div>
                {testResults.roomId && <div>ID Salle: <code className="bg-white px-1 rounded">{testResults.roomId}</code></div>}
                {testResults.error && <div>Erreur: {testResults.error}</div>}
                {testResults.status && <div>Status: {testResults.status}</div>}
                {testResults.data && (
                  <div>
                    Réponse serveur: <pre className="text-xs mt-1">{JSON.stringify(testResults.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Informations de debug */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>User ID:</strong> {session?.user?.id || 'Non disponible'}</p>
          <p><strong>Workspace ID:</strong> {currentWorkspace?._id || 'Non disponible'}</p>
          <p><strong>Token type:</strong> {tokenData?.error ? 'Non-JWT' : 'JWT'}</p>
          {tokenData && !tokenData.error && (
            <>
              <p><strong>Token exp:</strong> {tokenData.exp ? new Date(tokenData.exp * 1000).toLocaleString() : 'Non disponible'}</p>
              <p><strong>Token iat:</strong> {tokenData.iat ? new Date(tokenData.iat * 1000).toLocaleString() : 'Non disponible'}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 