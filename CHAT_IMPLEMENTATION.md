# Documentation du système de chat

## Architecture du chat temps réel

Le système de chat utilise une architecture client-serveur avec Socket.IO pour la communication en temps réel. Cette documentation explique les composants principaux et les améliorations apportées pour résoudre les problèmes de temps réel.

### Composants principaux

1. **Socket Service** (`src/services/socket/socket.service.ts`)
   - Service singleton qui gère la connexion Socket.IO
   - Fournit des méthodes pour se connecter, rejoindre des salons et envoyer des messages
   - Gère les écouteurs d'événements et les callbacks

2. **Hook useChat** (`src/app/dashboard/chat/_hooks/use-chat.ts`)
   - Hook React qui expose l'API du chat aux composants
   - Gère les messages, l'état de connexion et les erreurs
   - Implémente l'UI optimiste pour une expérience fluide

3. **Hook useChatGeneral** (`src/app/dashboard/chat/_hooks/use-chat-general.ts`)
   - Gère la récupération du chat général du workspace courant
   - Fournit l'ID du chat à utiliser par défaut

4. **Composants d'UI** (`src/app/dashboard/chat/_components/chat-detail.tsx`)
   - Composants React pour afficher les messages, l'état de connexion, etc.
   - Gèrent les interactions utilisateur comme l'envoi de messages

### Améliorations apportées

#### 1. Gestion robuste des connexions

**Problème :** Perte de connexion fréquente et absence de reconnexion automatique.

**Solution :**
- Mécanisme de reconnexion automatique avec backoff exponentiel
- Stockage des handlers d'événements pour restauration après reconnexion
- Détection de déconnexion et tentative de reconnexion automatique
- Vérification périodique de l'état de connexion

```typescript
// Exemple de reconnexion automatique
private scheduleReconnect(): void {
  if (this.reconnectTimer) return;
  
  this.reconnectTimer = setTimeout(() => {
    this.reconnectTimer = null;
    this.connect().catch(err => {
      console.error('❌ [Socket] Échec de la reconnexion automatique:', err);
    });
  }, 3000);
}
```

#### 2. UI optimiste pour les messages

**Problème :** Latence perçue lors de l'envoi de messages.

**Solution :**
- Affichage immédiat des messages envoyés avec un ID temporaire
- Remplacement par les vrais messages une fois confirmés par le serveur
- Indicateurs visuels pour les messages en cours d'envoi

```typescript
// Exemple d'implémentation optimiste
startTransition(() => {
  addOptimisticMessage(tempMessage);
});

try {
  await socketService.sendMessage(chatId, content, tempId);
} catch (err) {
  // Retirer le message optimiste en cas d'erreur
  setMessages(prev => prev.filter(msg => msg._id !== tempId));
}
```

#### 3. Gestion intelligente des événements

**Problème :** Duplication d'événements et écouteurs multiples.

**Solution :**
- Enregistrement centralisé des handlers d'événements
- Nettoyage systématique des écouteurs lors des changements de contexte
- Filtrage des messages par chatId pour éviter les doublons

```typescript
// Gestion des écouteurs d'événements
private registerEventHandler(event: string, callback: (data: any) => void): void {
  if (!this.eventHandlers.has(event)) {
    this.eventHandlers.set(event, []);
  }
  
  const handlers = this.eventHandlers.get(event) || [];
  if (!handlers.includes(callback)) {
    handlers.push(callback);
    this.eventHandlers.set(event, handlers);
  }
}
```

#### 4. Meilleure expérience utilisateur

**Problème :** Manque de retour visuel sur l'état du système.

**Solution :**
- Indicateurs clairs de l'état de connexion
- Bouton de reconnexion manuelle
- Messages d'erreur explicites avec possibilité de réessayer
- Gestion des états de chargement

```tsx
// Exemple d'UI pour l'état de connexion
{isConnected ? (
  <>
    <WifiIcon className='w-3 h-3 text-green-500' />
    <span className='text-xs text-green-600'>Connecté</span>
  </>
) : (
  <>
    <WifiOffIcon className='w-3 h-3 text-red-500' />
    <span className='text-xs text-red-600'>Déconnecté</span>
    <Button onClick={onReconnect} disabled={reconnecting}>
      <RefreshCwIcon className={reconnecting ? 'animate-spin' : ''} />
    </Button>
  </>
)}
```

#### 5. Gestion des changements de salon de chat

**Problème :** Messages mélangés entre différents salons de chat.

**Solution :**
- Suivi du salon de chat actif via une référence
- Filtrage des messages par salon
- Nettoyage et réinitialisation lors du changement de salon

```typescript
// Vérification du changement de salon
useEffect(() => {
  if (chatId && chatRoomJoinedRef.current !== chatId && socketService.isConnected()) {
    socketService.joinChat(chatId);
    chatRoomJoinedRef.current = chatId;
    loadMessages();
  }
}, [chatId]);
```

## Utilisation du chat

1. **Connexion automatique :**
   - Le chat se connecte automatiquement quand un workspace et un chat sont sélectionnés
   - La reconnexion est tentée automatiquement en cas de perte de connexion

2. **Envoi de messages :**
   - Les messages apparaissent immédiatement dans l'interface (UI optimiste)
   - Un indicateur "Envoi..." s'affiche pendant la confirmation par le serveur

3. **Gestion des erreurs :**
   - Les erreurs sont clairement affichées avec possibilité de réessayer
   - Les tentatives de reconnexion sont visibles pour l'utilisateur

## Bonnes pratiques

1. **Logging extensif :**
   - Traçage détaillé des événements de connexion et de messages
   - Format standardisé pour faciliter le débogage

2. **Nettoyage systématique :**
   - Désinscription des écouteurs lors du démontage des composants
   - Nettoyage des timers et références

3. **Gestion des erreurs :**
   - Capture et affichage des erreurs à tous les niveaux
   - Messages d'erreur explicites et actions de récupération 