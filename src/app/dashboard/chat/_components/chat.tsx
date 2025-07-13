"use client";
import React from 'react'
import { useChatIdStore } from '@/stores/chat-id.store';
import { useChatGeneral } from '../_hooks/use-chat-general';
import { useChat } from '../_hooks/use-chat';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { createChatPrivate } from '../_services/chat.service';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useChatUsernameStore } from '@/stores/chat-username.store';

interface Chat {
    _id: string
    name: string
    description?: string
    avatar?: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount?: number
}

export function ChatComponent() {
  const { isConnected } = useChat();
  
  return (
    <div className='col-span-1 overflow-hidden  flex-1 bg-background rounded-lg space-y-4 p-4'>
         <div className='px-2 flex flex-wrap sticky top-0 z-10 items-center justify-between'>
            <h1 className='text-xl font-semibold'>Conversations</h1>
            <div className='flex items-center gap-1'>
              {isConnected ? (
                <>
                  <WifiIcon className='w-4 h-4 text-green-500' />
                  <span className='text-xs text-green-600'>En ligne</span>
                </>
              ) : (
                <>
                  <WifiOffIcon className='w-4 h-4 text-red-500' />
                  <span className='text-xs text-red-600'>Hors ligne</span>
                </>
              )}
            </div>
        </div>
        <ChatList />
    </div>
  )
}

function ChatItem({ chat, isGeneral }: { chat: Chat, isGeneral?: boolean }) {
  const { setChatId, clearChatId } = useChatIdStore();
  const { setUsername, username } = useChatUsernameStore();
  const isSelected =  username === chat.name;
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?._id || "";  

  async function handleChatClick() {
    
    
    if(isGeneral) {
    clearChatId();
    setChatId(chat._id);
    setUsername(chat.name);
    }else {
      console.log("Creating private chat with user:", chat._id, "in workspace:", workspaceId);
      const result =  await createChatPrivate({ userId: chat._id, workspaceId });
      console.log({ result });

      if (result.success) {
        const data = result.data as { _id: string };
        console.warn("Private chat created with ID:", data._id);
        clearChatId();
        setChatId(data._id);
        setUsername(chat.name);
      } else {
        console.error(result.message);
      }
    }
  }

  return (
    <div 
      onClick={handleChatClick} 
      className={`flex gap-2 p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 border border-primary/20' : ''
      }`}
    >
        <div className='size-10 rounded-xl flex items-center justify-center bg-primary/10'>
            <h1 className='font-bold text-primary uppercase'>{chat.name.charAt(0)}</h1>
        </div>
        <div className='flex flex-col flex-1'>
            <h1 className='text-sm font-bold'>{chat.name}</h1>
            <p className='text-sm text-gray-500'>{chat.lastMessage || chat.description}</p>
        </div>
        {/* {chat.unreadCount && chat.unreadCount > 0 && (
          <div className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {chat.unreadCount}
          </div>
        )} */}
    </div>
  )
}

function ChatList() {
  const { chatGeneral,isLoading, error } = useChatGeneral();


  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
        Chargement...
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
        Une erreur s&#39;est produite
      </div>
    )
  }

  if (!chatGeneral) {
    return (
      <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
        <h2 className='text-center text-sm'>Aucune conversation trouvée ! <br /> veuillez sélectionner un workspace</h2>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-[calc(100svh-12rem)] overflow-y-auto space-y-2'>

        {chatGeneral && (
          <ChatItem 
            isGeneral
            chat={{
              description: "Discutez avec les membres de votre workspace",
              name: chatGeneral.name || "Chat Général",
              _id: chatGeneral._id || "",
            }}/>
        )}

        {chatGeneral.participants?.map((participant) => (
          <ChatItem key={participant._id} chat={{
            _id: participant._id,
            name: participant.username,
            description: participant.email,
            lastMessage: "Dernier message ici",
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0 // Placeholder, you can implement unread count logic
          }}/>
        ))}
        {/* {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
        ))} */}
    </div>
  )
}
