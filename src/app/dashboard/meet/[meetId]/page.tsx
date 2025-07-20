"use client";

import React from "react";
import { VisioRoom } from "../_components/visio-room";
// import { CreateMeetButton } from '../_components/create-meet-button';
// import { ConnectionDiagnostics } from '../_components/connection-diagnostics';
// import { WebSocketTest } from '../_components/websocket-test';
// import { DebugWorkspace } from '../_components/debug-workspace';
// import { WorkspaceInfo } from '../_components/workspace-info';
// import { RoomInfo } from '../_components/room-info';
import { TokenDiagnostics } from "../_components/token-diagnostics";
import { SimpleTokenTest } from "../_components/simple-token-test";
import { WebSocketAuthTest } from "../_components/websocket-auth-test";
import { ApiDebugTest } from "../_components/api-debug-test";
import { DirectApiTest } from "../_components/direct-api-test";

export default function MeetPage() {
  return (
    <div className="container overflow-y-auto mx-auto p-4 space-y-6">
      {/* Affiche le titre seulement */}
      <h1 className="text-2xl font-bold">Test Visioconférence</h1>

      {/* Diagnostic du Token - affichage conditionnel d'une erreur */}
      <div className="space-y-4">
        <TokenDiagnostics />
        <SimpleTokenTest />
        <ApiDebugTest />
        <DirectApiTest />
      </div>

      {/* Autres diagnostics */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Informations Workspace</h2>
          <DebugWorkspace />
          <WorkspaceInfo />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Informations Room</h2>
          <RoomInfo />
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <div className="space-y-4">
          <h2 className="text-lg font-semibold">Créer une salle</h2>
          <CreateMeetButton />
        </div> */}

        {/* <div className="space-y-4">
          <h2 className="text-lg font-semibold">Diagnostic Connexion</h2>
          <ConnectionDiagnostics />
        </div> */}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Test WebSocket avec Authentification
        </h2>
        <WebSocketAuthTest />
      </div>

      {/* <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test WebSocket Simple</h2>
        <WebSocketTest />
      </div> */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Salle de Visioconférence</h2>
        <VisioRoom />
      </div>
    </div>
  );
}
