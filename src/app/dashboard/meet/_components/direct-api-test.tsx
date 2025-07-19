"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessionContext } from '@/context/SessionContext';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { toast } from 'sonner';
import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function DirectApiTest() {
  const session = useSessionContext();
  const { currentWorkspace } = useWorkspaceStore();
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testDirectApi = async () => {
    if (!session?.token || !currentWorkspace?._id) {
      toast.error('Session ou workspace manquant');
      return;
    }

    setIsTesting(true);
    setResults(null);

    try {
      console.log('[DirectApiTest] Testing direct API call...');
      
      const requestData = {
        workspaceId: currentWorkspace._id
      };
      
      console.log('[DirectApiTest] Request data:', requestData);
      console.log('[DirectApiTest] Token preview:', session.token.substring(0, 20) + '...');

      const response = await fetch('https://visoconf-service-go.onrender.com/api/visio/room', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('[DirectApiTest] Response status:', response.status);
      console.log('[DirectApiTest] Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        request: {
          url: 'https://visoconf-service-go.onrender.com/api/visio/room',
          method: 'POST',
          body: requestData,
          tokenPreview: session.token.substring(0, 20) + '...'
        }
      };

      setResults(result);
      
      if (response.ok) {
        toast.success('API call successful!');
      } else {
        toast.error(`API call failed: ${response.status}`);
      }

    } catch (error: any) {
      console.error('[DirectApiTest] Error:', error);
      setResults({
        success: false,
        error: error.message,
        request: {
          url: 'https://visoconf-service-go.onrender.com/api/visio/room',
          method: 'POST',
          body: { workspaceId: currentWorkspace._id },
          tokenPreview: session.token.substring(0, 20) + '...'
        }
      });
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Test Direct API - Fetch</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Test direct avec fetch()</p>
            <p className="text-xs text-muted-foreground">
              Appel direct à l'API sans abstraction
            </p>
          </div>
          <Button
            onClick={testDirectApi}
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
                <Zap className="h-4 w-4 mr-2" />
                Tester API
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Résumé */}
            <div className={`p-3 rounded border ${results.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center space-x-2">
                {results.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {results.success ? 'Succès' : 'Échec'} - Status {results.status}
                </span>
              </div>
              {results.statusText && (
                <p className="text-sm mt-1">{results.statusText}</p>
              )}
            </div>

            {/* Détails de la requête */}
            <div className="space-y-2">
              <h4 className="font-medium">Détails de la requête :</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>URL:</strong> {results.request.url}</div>
                <div><strong>Méthode:</strong> {results.request.method}</div>
                <div><strong>Token:</strong> {results.request.tokenPreview}</div>
                <div><strong>Body:</strong></div>
                <pre className="mt-1 bg-background p-2 rounded text-xs">
                  {JSON.stringify(results.request.body, null, 2)}
                </pre>
              </div>
            </div>

            {/* Réponse */}
            <div className="space-y-2">
              <h4 className="font-medium">Réponse :</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <div><strong>Status:</strong> {results.status}</div>
                <div><strong>Headers:</strong></div>
                <pre className="mt-1 bg-background p-2 rounded text-xs">
                  {JSON.stringify(results.headers, null, 2)}
                </pre>
                <div><strong>Data:</strong></div>
                <pre className="mt-1 bg-background p-2 rounded text-xs">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Erreur si applicable */}
            {results.error && (
              <div className="space-y-2">
                <h4 className="font-medium">Erreur :</h4>
                <div className="bg-red-50 p-3 rounded text-sm">
                  <pre className="text-red-700">{results.error}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* État actuel */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Session :</strong> {session?.token ? '✅' : '❌'}</p>
          <p><strong>Workspace :</strong> {currentWorkspace?._id ? '✅' : '❌'}</p>
          <p><strong>Workspace ID :</strong> {currentWorkspace?._id || 'Non disponible'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 