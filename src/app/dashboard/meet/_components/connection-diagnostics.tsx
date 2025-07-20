"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessionContext } from "@/context/SessionContext";
import { VisioService } from "../_services/visio.service";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
  User,
  Key,
} from "lucide-react";
import { useVideoConference } from "../_hooks/use-video-conference";

interface DiagnosticResult {
  name: string;
  status: "success" | "error" | "loading" | "warning";
  message: string;
  details?: string;
}

import { useVideoConference } from "../_hooks/use-video-conference";

export function ConnectionDiagnostics() {
  const session = useSessionContext();
  const params = useParams();
  const urlRoomId = params.meetId as string;

  // Ajout du hook pour récupérer le vrai roomId utilisé et l'état WebSocket
  const { actualRoomId, isConnected } = useVideoConference();

  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Vérifier la session
    results.push({
      name: "Session utilisateur",
      status: session?.token ? "success" : "error",
      message: session?.token ? "Session valide" : "Aucune session trouvée",
      details: session?.user?.username || "Utilisateur non connecté",
    });

    // 2. Vérifier le token JWT
    if (session?.token) {
      try {
        const tokenParts = session.token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);

          if (payload.exp && payload.exp > now) {
            results.push({
              name: "Token JWT",
              status: "success",
              message: "Token valide",
              details: `Expire le ${new Date(payload.exp * 1000).toLocaleString()}`,
            });
          } else {
            results.push({
              name: "Token JWT",
              status: "error",
              message: "Token expiré",
              details: `Expiré le ${new Date(payload.exp * 1000).toLocaleString()}`,
            });
          }
        } else {
          results.push({
            name: "Token JWT",
            status: "error",
            message: "Format de token invalide",
            details: "Le token ne semble pas être un JWT valide",
          });
        }
      } catch (error) {
        results.push({
          name: "Token JWT",
          status: "error",
          message: "Erreur lors de la vérification du token",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    // 3. Vérifier le vrai roomId utilisé (actualRoomId du hook)
    results.push({
      name: "ID de salle",
      status: actualRoomId ? "success" : "error",
      message: actualRoomId ? "ID de salle utilisé" : "ID de salle manquant",
      details: actualRoomId || urlRoomId || "Aucun roomId",
    });

    // 4. Vérifier la connectivité réseau
    try {
      const response = await fetch("https://httpbin.org/get", {
        method: "GET",
        mode: "cors",
      });
      results.push({
        name: "Connectivité réseau",
        status: response.ok ? "success" : "warning",
        message: response.ok
          ? "Connexion internet OK"
          : "Problème de connectivité",
        details: `Status: ${response.status}`,
      });
    } catch (error) {
      results.push({
        name: "Connectivité réseau",
        status: "error",
        message: "Pas de connexion internet",
        details: error instanceof Error ? error.message : "Erreur réseau",
      });
    }

    // 5. Vérifier la santé du serveur
    try {
      const isHealthy = await VisioService.checkHealth();
      results.push({
        name: "Serveur de visioconférence",
        status: isHealthy ? "success" : "error",
        message: isHealthy ? "Serveur accessible" : "Serveur inaccessible",
        details: isHealthy
          ? "Le serveur répond correctement"
          : "Le serveur ne répond pas",
      });
    } catch (error) {
      results.push({
        name: "Serveur de visioconférence",
        status: "error",
        message: "Erreur lors de la vérification du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }

    // 6. Tester la création de WebSocket (affiche l'URL réelle utilisée)
    if (actualRoomId && session?.token) {
      try {
        const wsUrl = `wss://visoconf-service-go.onrender.com/ws/room/${actualRoomId}?token=${encodeURIComponent(session.token)}`;
        results.push({
          name: "URL WebSocket",
          status: "success",
          message: "URL WebSocket générée",
          details: wsUrl,
        });
      } catch (error) {
        results.push({
          name: "URL WebSocket",
          status: "error",
          message: "Erreur lors de la génération de l'URL",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }
    // 7. Vérifier l'état WebSocket réel
    results.push({
      name: "Connexion WebSocket",
      status: isConnected ? "success" : "error",
      message: isConnected ? "Connecté à la salle" : "Non connecté à la salle",
      details: isConnected
        ? "La connexion WebSocket est active"
        : "La connexion WebSocket n'est pas active",
    });
    // 7. Vérifier l'état WebSocket réel
    results.push({
      name: "Connexion WebSocket",
      status: isConnected ? "success" : "error",
      message: isConnected ? "Connecté à la salle" : "Non connecté à la salle",
      details: isConnected
        ? "La connexion WebSocket est active"
        : "La connexion WebSocket n'est pas active",
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [roomId, session?.token]);

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "loading":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Erreur</Badge>;
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Attention
          </Badge>
        );
      case "loading":
        return <Badge variant="outline">En cours...</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Diagnostic de connexion</span>
          </CardTitle>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 border rounded-lg"
            >
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(diagnostic.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{diagnostic.name}</h4>
                  {getStatusBadge(diagnostic.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {diagnostic.message}
                </p>
                {diagnostic.details && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
                    {diagnostic.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {diagnostics.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Résumé :</h4>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  {diagnostics.filter((d) => d.status === "success").length} OK
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>
                  {diagnostics.filter((d) => d.status === "error").length}{" "}
                  Erreurs
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>
                  {diagnostics.filter((d) => d.status === "warning").length}{" "}
                  Avertissements
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
