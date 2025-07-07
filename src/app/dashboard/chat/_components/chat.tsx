"use client";
import React from 'react'
import { useChatIdStore } from '@/stores/chat-id.store';
import { useChatGeneral } from '../_hooks/use-chat-general';
import { useChat } from '../_hooks/use-chat';
import { WifiIcon, WifiOffIcon } from 'lucide-react';

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
    <div className='col-span-1 bg-white rounded-lg space-y-4 p-4 h-full'>
         <div className='px-2 flex items-center justify-between'>
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

function ChatItem({ chat }: { chat: Chat }) {
  const { setChatId, chatId } = useChatIdStore();
  const isSelected = chatId === chat._id;
  
  return (
    <div 
      onClick={() => setChatId(chat._id)} 
      className={`flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10 border border-primary/20' : ''
      }`}
    >
        <div className='size-10 rounded-xl flex items-center justify-center bg-primary/10'>
            <h1 className='font-bold text-primary'>{chat.name.charAt(0)}</h1>
        </div>
        <div className='flex flex-col flex-1'>
            <h1 className='text-sm font-bold'>{chat.name}</h1>
            <p className='text-sm text-gray-500'>{chat.lastMessage || chat.description}</p>
        </div>
        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {chat.unreadCount}
          </div>
        )}
    </div>
  )
}

function ChatList() {
  const { chatGeneral } = useChatGeneral()
  
  return (
    <div className='flex flex-col space-y-2'>
        {chatGeneral && (
          <ChatItem chat={{
            description: "Discutez avec les membres de votre workspace",
            name: chatGeneral.name || "Chat Général",
            _id: chatGeneral._id || "",
          }}/>
        )}
        {/* {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
        ))} */}
    </div>
  )
}
