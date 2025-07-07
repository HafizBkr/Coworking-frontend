# Implémentation du Chat en Temps Réel avec Socket.IO

## Vue d'ensemble

Cette implémentation ajoute un système de chat en temps réel à votre application Next.js en utilisant Socket.IO client. Le système permet aux utilisateurs de communiquer en temps réel dans des espaces de travail.

## Architecture

### 1. Service Socket.IO (`src/services/socket/socket.service.ts`)

Le service principal qui gère :
- Connexion/déconnexion au serveur Socket.IO
- Authentification avec JWT
- Gestion des événements (nouveaux messages, confirmation d'envoi, etc.)
- Reconnexion automatique

### 2. Hook personnalisé (`src/app/dashboard/chat/_hooks/use-chat.ts`)

Hook React qui :
- Gère l'état du chat (messages, connexion, erreurs)
- Charge les messages existants depuis l'API
- Gère l'envoi de messages avec feedback temporaire
- Scroll automatique vers le bas

### 3. Composants UI

- **ChatDetailComponent** : Interface principale du chat
- **ChatComponent** : Liste des conversations
- **ConnectionStatus** : Indicateur de statut de connexion

## Configuration

### Variables d'environnement

Ajoutez dans votre `.env.local` :

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Configuration Socket.IO

Le fichier `src/config/socket.config.ts` contient :
- URL du serveur Socket.IO
- Timeout de connexion
- Paramètres de reconnexion

## Fonctionnalités

### ✅ Implémentées

1. **Connexion en temps réel** : Connexion automatique au serveur Socket.IO
2. **Authentification** : Utilisation du token JWT pour l'authentification
3. **Envoi de messages** : Envoi de messages avec feedback temporaire
4. **Réception de messages** : Réception en temps réel des nouveaux messages
5. **Chargement des messages** : Chargement des messages existants depuis l'API
6. **Indicateurs de statut** : Affichage du statut de connexion
7. **Gestion d'erreurs** : Gestion des erreurs de connexion et d'envoi
8. **Scroll automatique** : Scroll automatique vers le bas lors de nouveaux messages
9. **Reconnexion automatique** : Reconnexion automatique en cas de déconnexion

### 🔄 Événements Socket.IO

- `join-workspace` : Rejoindre un espace de travail
- `join-chat` : Rejoindre un chat spécifique
- `send-message` : Envoyer un message
- `new-message` : Recevoir un nouveau message
- `message-sent` : Confirmation d'envoi de message
- `chat-joined` : Confirmation de connexion au chat
- `workspace-joined` : Confirmation de connexion au workspace

## Utilisation

### Dans un composant

```tsx
import { useChat } from '@/app/dashboard/chat/_hooks/use-chat';

function MyChatComponent() {
  const { 
    messages, 
    isConnected, 
    sendMessage, 
    isLoading, 
    error 
  } = useChat();

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  return (
    <div>
      {isConnected ? 'Connecté' : 'Déconnecté'}
      {messages.map(message => (
        <div key={message._id}>{message.content}</div>
      ))}
    </div>
  );
}
```

### Gestion des messages temporaires

Le système utilise des IDs temporaires pour afficher immédiatement les messages envoyés :

```tsx
// Message temporaire affiché immédiatement
const tempMessage = {
  _id: `temp-${Date.now()}`,
  content: "Mon message",
  tempId: `temp-${Date.now()}`
};

// Une fois confirmé par le serveur
const confirmedMessage = {
  _id: "real-message-id",
  content: "Mon message",
  tempId: undefined
};
```

## Sécurité

- Authentification JWT obligatoire
- Validation des tokens côté serveur
- Gestion des erreurs d'authentification

## Performance

- Reconnexion automatique avec délai progressif
- Chargement des messages existants uniquement au besoin
- Optimisation du scroll avec `useRef`

## Dépendances

- `socket.io-client` : Client Socket.IO
- `date-fns` : Formatage des dates
- `@dicebear/collection` : Génération d'avatars
- `zustand` : Gestion d'état (stores existants)

## Tests

Pour tester l'implémentation :

1. Démarrez votre serveur backend Socket.IO
2. Assurez-vous que l'URL est correcte dans la configuration
3. Connectez-vous à l'application
4. Naviguez vers le chat
5. Vérifiez que le statut de connexion s'affiche
6. Envoyez et recevez des messages

## Dépannage

### Problèmes courants

1. **Connexion échouée** : Vérifiez l'URL du serveur Socket.IO
2. **Authentification échouée** : Vérifiez que le token JWT est valide
3. **Messages non reçus** : Vérifiez les événements Socket.IO côté serveur
4. **Erreurs de type** : Vérifiez les interfaces TypeScript

### Logs utiles

Le système affiche des logs dans la console :
- `✅ Connecté au serveur Socket.IO`
- `💬 Nouveau message reçu`
- `📤 Message envoyé`
- `❌ Erreur Socket.IO` 