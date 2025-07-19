Voici un exemple d’implémentation frontend avec Next.js et TypeScript pour intégrer la visioconférence via WebSocket, en respectant la logique de connexion à une room existante avec le bon roomId et la gestion des messages (chat, mute, vidéo, etc.).

Ce composant React peut être placé dans un fichier comme components/VisioRoom.tsx ou directement dans une page Next.js.

```tsx
import React, { useEffect, useRef, useState } from "react";

type Participant = {
  userID: string;
  username: string;
  role: string;
  audioMuted: boolean;
  videoOff: boolean;
  screenSharing: boolean;
};

type WSMessage =
  | { type: "participants"; data: Participant[] }
  | { type: "chat"; data: { user: string; message: string } }
  | { type: "join" | "leave"; data: { user: string } }
  | { type: "mute" | "unmute" | "video_on" | "video_off" | "screen_share_start" | "screen_share_stop"; data: { user: string } }
  | { type: string; data: any }; // fallback

interface VisioRoomProps {
  roomId: string;
  jwt: string;
}

const WS_URL = "wss://visoconf-service-go.onrender.com/ws/room/";

export const VisioRoom: React.FC<VisioRoomProps> = ({ roomId, jwt }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<{ user: string; message: string }[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!roomId || !jwt) return;

    const ws = new WebSocket(${WS_URL}${roomId});
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", data: {} }));
    };

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);
      if (msg.type === "participants") setParticipants(msg.data);
      if (msg.type === "chat") setChat((prev) => [...prev, msg.data]);
      // Gérer d'autres types si besoin
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Auth header workaround for browser WebSocket (if needed, use a proxy or server-side handshake)
    // Pour wscat, l'en-tête Authorization fonctionne, mais en navigateur il faut souvent passer le token dans l'URL ou via un handshake HTTP avant.

    return () => {
      ws.close();
    };
  }, [roomId, jwt]);

  const send = (type: string, data: any = {}) => {
    wsRef.current?.send(JSON.stringify({ type, data }));
  };

  return (
    <div>
      <h2>Visio Room: {roomId}</h2>
      <div>
        <h3>Participants</h3>
        <ul>
          {participants.map((p) => (
            <li key={p.userID}>
              {p.username} ({p.role}) {p.audioMuted ? "🔇" : ""} {p.videoOff ? "📷 Off" : ""}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Chat</h3>
        <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc" }}>
          {chat.map((c, i) => (
            <div key={i}><b>{c.user}:</b> {c.message}</div>
          ))}
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send("chat", { message }) && setMessage("")}
          placeholder="Message..."
        />
        <button onClick={() => send("chat", { message }) && setMessage("")}>Envoyer</button>
      </div>
      <div>
        <button onClick={() => send("mute")}>Mute</button>
        <button onClick={() => send("unmute")}>Unmute</button>
        <button onClick={() => send("video_off")}>Caméra Off</button>
        <button onClick={() => send("video_on")}>Caméra On</button>
        <button onClick={() => send("screen_share_start")}>Partager écran</button>
        <button onClick={() => send("screen_share_stop")}>Arrêter partage</button>
      </div>
    </div>
  );
};
```
*Remarques importantes pour l’intégration frontend :*

- *roomId* : doit être celui retourné par le backend lors de la création de la room (jamais généré côté frontend).
- *jwt* : doit être le token JWT de l’utilisateur connecté.
- *WebSocket Auth* : Les navigateurs ne permettent pas d’ajouter des headers personnalisés à la connexion WebSocket. Si le backend exige l’Authorization header, il faut soit :
  - Passer le token dans l’URL (ex: ?token=...) et l’extraire côté backend,
  - Ou faire la connexion WebSocket côté serveur (SSR/API Next.js) qui gère les headers.
- *Gestion des messages* : adapte la gestion des types selon les besoins UI.





_______________________________________________________________________________


Voici une documentation claire et concise du backend, spécialement axée sur la logique de “join” d’une room, à destination de ton développeur frontend. Ce fichier explique comment fonctionne le backend, comment rejoindre une room, et ce qu’il faut absolument respecter côté frontend pour que le “join” fonctionne correctement.

VisioBackendCoworking/BACKEND_API_VISIO.md#L1-61
# Documentation Backend — API Visioconférence

## 1. Authentification

Toutes les requêtes (HTTP ou WebSocket) nécessitent un token JWT valide dans l’en-tête :


Authorization: Bearer <JWT_TOKEN>


---

## 2. Création d’une Room

**Endpoint HTTP (POST)**  
Permet de créer une nouvelle room et d’obtenir son `roomId`.

- **URL** :  
  `POST https://visoconf-service-go.onrender.com/rooms`
- **Headers** :  
  `Authorization: Bearer <JWT_TOKEN>`
- **Body** :  
  json
  { "workspaceId": "<id_du_workspace>" }
  
- **Réponse** :  
  json
  { "roomId": "<roomId>" }
  

---

## 3. Rejoindre une Room (WebSocket)

Pour rejoindre une visioconférence existante, il faut :

1. **Récupérer le `roomId`** (créé précédemment ou partagé par un autre utilisateur).
2. **Se connecter en WebSocket** à :
   
   wss://visoconf-service-go.onrender.com/ws/room/{roomId}
   
   - Remplacer `{roomId}` par l’identifiant exact de la room.
   - Ajouter l’en-tête HTTP :  
     `Authorization: Bearer <JWT_TOKEN>`

**⚠ Important**  
- Le `roomId` doit être exactement celui retourné par le backend lors de la création de la room.
- Ne jamais générer un nouveau `roomId` côté frontend pour rejoindre une room existante.
- Si le `roomId` est incorrect ou inexistant, le backend retournera une erreur ou refusera la connexion.

---

## 4. Structure des messages WebSocket

Tous les échanges se font au format JSON :

json
{
  "type": "<event_type>",
  "data": { ... }
}


---

## 5. Types de messages principaux

- `join` : envoyé automatiquement à la connexion.
- `participants` : liste à jour des participants (reçu du backend).
- `chat` : messages texte.
- `mute` / `unmute` : gestion du micro.
- `video_on` / `video_off` : gestion de la caméra.
- `screen_share_start` / `screen_share_stop` : partage d’écran.

---

## 6. Bonnes pratiques pour le “join”

- Toujours utiliser le même `roomId` pour tous les utilisateurs d’une même visioconférence.
- Ne jamais créer/générer un nouveau `roomId` côté frontend pour rejoindre une room existante.
- Vérifier que le token JWT est valide et correspond à l’utilisateur courant.
- Gérer les erreurs de connexion (ex : room inexistante, token invalide).

---

## 7. Exemple de connexion WebSocket

js
const ws = new WebSocket("wss://visoconf-service-go.onrender.com/ws/room/<roomId>");
// Ajouter le JWT dans l'en-tête Authorization si possible (voir limitations navigateur)


---

Pour toute question sur l’API ou le comportement du backend, contacter l’équipe backend.


Ce fichier peut être ajouté à la racine du projet ou partagé avec ton dev frontend pour clarifier la logique du “join” et éviter toute mauvaise implémentation.  
