# API de Gestion des Membres de Chat

Cette API permet de gérer la liste des membres avec qui un utilisateur peut échanger des messages dans un workspace spécifique, incluant le chat général et les derniers messages pour chaque conversation.

## Endpoints

### Récupérer la liste des membres de chat

http
GET /api/v1/chat-members/workspace/:workspaceId/members


#### Description

Cet endpoint retourne tous les membres du workspace avec qui l'utilisateur actuel peut échanger des messages, ainsi que des informations sur les derniers messages échangés et le statut des chats.

#### Paramètres

| Paramètre | Type | Description |
| --------- | ---- | ----------- |
| workspaceId | string | L'identifiant du workspace |

#### Réponse

json
{
  "success": true,
  "data": {
    "members": [
      {
        "_id": "workspace_member_id",
        "user": {
          "_id": "user_id",
          "username": "john_doe",
          "email": "john@example.com",
          "profilePicture": "url_to_profile_picture",
          "name": "John Doe"
        },
        "role": "member",
        "online": true,
        "chatId": "chat_id_or_null",
        "lastMessage": {
          "_id": "message_id",
          "content": "Bonjour comment ça va?",
          "sender": {
            "_id": "sender_id",
            "username": "sender_username"
          },
          "createdAt": "2023-07-25T12:00:00Z",
          "unread": true
        },
        "messageCount": 25,
        "unreadCount": 3
      }
    ],
    "generalChat": {
      "_id": "general_chat_id",
      "name": "Général",
      "participants": 12,
      "lastMessage": {
        "_id": "message_id",
        "content": "Bienvenue à tous!",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username"
        },
        "createdAt": "2023-07-25T10:00:00Z",
        "unread": false
      },
      "messageCount": 150,
      "unreadCount": 0
    }
  }
}


### Récupérer les statistiques de chat

http
GET /api/v1/chat-members/workspace/:workspaceId/stats


#### Description

Cet endpoint retourne des statistiques globales sur les chats de l'utilisateur dans un workspace spécifique.

#### Paramètres

| Paramètre | Type | Description |
| --------- | ---- | ----------- |
| workspaceId | string | L'identifiant du workspace |

#### Réponse

json
{
  "success": true,
  "data": {
    "totalChats": 10,
    "totalMessages": 256,
    "totalUnread": 15,
    "chatsWithUnread": 3
  }
}


## Fonctionnalités

### Chat Général

Un chat général est automatiquement créé pour chaque workspace s'il n'existe pas déjà. Ce chat inclut tous les membres du workspace et permet des discussions de groupe.

### Derniers Messages

Pour chaque chat (direct message ou chat général), le dernier message est récupéré avec:
- Son contenu déchiffré
- Les informations sur l'expéditeur
- La date d'envoi
- Le statut de lecture

### Compteurs de Messages

Pour chaque chat, les compteurs suivants sont disponibles:
- Nombre total de messages dans la conversation
- Nombre de messages non lus par l'utilisateur actuel

### Statut en ligne

Le statut "en ligne" d'un membre est déterminé si sa dernière activité date de moins de 10 minutes.

## Temps Réel

Les événements temps réel suivants sont émis pour maintenir les informations à jour:

### Mise à jour de chat


chat-updated


Émis lorsqu'un nouveau message est envoyé, modifié ou supprimé dans un chat. Contient les informations sur le dernier message du chat.

### Lecture des messages


messages-read


Émis lorsqu'un utilisateur marque les messages d'un chat comme lus.

### Utilisateur rejoint/quitte le chat


user-joined-chat
user-left-chat


Émis lorsqu'un utilisateur rejoint ou quitte un chat.

## Implémentation côté client

Pour une expérience temps réel optimale, le client devrait:

1. Se connecter au socket WebSocket
2. S'abonner aux événements des chats actifs
3. Mettre à jour l'interface utilisateur en fonction des événements reçus
4. Récupérer périodiquement la liste complète pour s'assurer de la synchronisation








__________________________________________________


📚 Documentation API Chat Workspace & Realtime

---

## 1. Récupérer la liste des membres de chat (avec chat général et dernier message)

*Endpoint*  
http
GET /api/v1/chat-members/workspace/:workspaceId/members


*Description*  
Retourne tous les membres du workspace avec qui l’utilisateur courant peut discuter,  
inclut le chat général et le dernier message pour chaque conversation.

*Headers*  
- Authorization: Bearer <token>

*Réponse*
json
{
  "success": true,
  "data": {
    "members": [
      {
        "_id": "workspace_member_id",
        "user": {
          "_id": "user_id",
          "username": "john_doe",
          "email": "john@example.com",
          "profilePicture": "url_to_profile_picture",
          "name": "John Doe"
        },
        "role": "member",
        "online": true,
        "chatId": "chat_id_or_null",
        "lastMessage": {
          "_id": "message_id",
          "content": "Bonjour comment ça va?",
          "sender": {
            "_id": "sender_id",
            "username": "sender_username"
          },
          "createdAt": "2023-07-25T12:00:00Z",
          "unread": true
        },
        "messageCount": 25,
        "unreadCount": 3
      }
    ],
    "generalChat": {
      "_id": "general_chat_id",
      "name": "Général",
      "participants": 12,
      "lastMessage": {
        "_id": "message_id",
        "content": "Bienvenue à tous!",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username"
        },
        "createdAt": "2023-07-25T10:00:00Z",
        "unread": false
      },
      "messageCount": 150,
      "unreadCount": 0
    }
  }
}


---

## 2. Récupérer les statistiques de chat pour l’utilisateur

*Endpoint*  
http
GET /api/v1/chat-members/workspace/:workspaceId/stats


*Description*  
Retourne des statistiques globales sur les chats de l’utilisateur dans le workspace.

*Réponse*
json
{
  "success": true,
  "data": {
    "totalChats": 10,
    "totalMessages": 256,
    "totalUnread": 15,
    "chatsWithUnread": 3
  }
}


---

## 3. Fonctionnalités incluses

- *Chat général* : Un chat général est créé automatiquement pour chaque workspace s’il n’existe pas. Il inclut tous les membres.
- *Dernier message* : Pour chaque chat (direct ou général), le dernier message est retourné avec : contenu déchiffré, expéditeur, date, statut de lecture.
- *Compteurs* : Nombre total de messages et nombre de messages non lus pour chaque chat.
- *Statut en ligne* : Un membre est considéré "en ligne" si sa dernière activité date de moins de 10 minutes.

---

## 4. Événements temps réel (Socket.IO)

*Événements émis par le serveur* :

- new-message : Un nouveau message a été envoyé dans un chat.
- chat-updated : Le dernier message d’un chat a changé (nouveau, modifié, supprimé).
- user-joined-chat / user-left-chat : Un utilisateur rejoint ou quitte un chat.
- messages-read : Un utilisateur a marqué les messages comme lus.
- user-typing / user-stopped-typing : Un utilisateur commence ou arrête d’écrire.

---

## 5. Exemple d’utilisation côté client

- Récupérer la liste des membres et du chat général via l’API REST.
- Se connecter au WebSocket et écouter les événements pour mettre à jour l’UI en temps réel.
- Utiliser les endpoints pour envoyer des messages, marquer comme lu, etc.

---

## 6. Sécurité

- Tous les endpoints nécessitent un JWT valide dans le header Authorization.
- Les accès sont vérifiés : un utilisateur ne peut voir que les membres et chats du workspace auquel il appartient.

---

## 7. Pour aller plus loin

- Tu peux utiliser le script Node.js fourni plus haut pour tester le realtime dans le terminal.
- Pour une interface web, utilise le script navigateur ou la page HTML proposée.

---

Si tu veux la documentation d’un endpoint précis ou le schéma d’un modèle, demande-moi !