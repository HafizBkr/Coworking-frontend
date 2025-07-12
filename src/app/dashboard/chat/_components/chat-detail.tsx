"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { SendIcon, XIcon, WifiIcon, WifiOffIcon, RefreshCwIcon } from 'lucide-react';
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useChat, type ChatMessage } from '../_hooks/use-chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatIdStore } from '@/stores/chat-id.store';

export function ChatDetailComponent() {
  const { chatId } = useChatIdStore();
  const { 
    messages, 
    isConnected, 
    isLoading, 
    error, 
    sendMessage, 
    messagesEndRef, 
    currentUser,
    checkAndReconnect 
  } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [reconnecting, setReconnecting] = useState(false);

  // Effacer le message d'entrée lors du changement de chat
  useEffect(() => {
    setMessageInput('');
  }, [chatId]);
  
  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await checkAndReconnect();
    } finally {
      setTimeout(() => setReconnecting(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Si aucun chat n'est sélectionné, afficher le composant placeholder
  if (!chatId) {
    return <ChatPlaceholder />;
  }

  return (
    <div className='col-span-2 bg-white rounded-lg p-2 h-full flex flex-col'>
        <ChatHeader 
          isConnected={isConnected}
          onReconnect={handleReconnect}
          reconnecting={reconnecting}
        />
        <ChatContent 
          messages={messages} 
          isLoading={isLoading} 
          error={error}
          messagesEndRef={messagesEndRef}
          currentUser={currentUser}
          onReconnect={handleReconnect}
          reconnecting={reconnecting}
        />
        <ChatFooter 
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isConnected={isConnected}
          disabled={isLoading || reconnecting}
        />
    </div>
  )
}

export function ChatPlaceholder() {
    return (
        <div className='flex flex-col h-full items-center justify-center'>
            <Image src='/icons/chat.svg' alt='chat-detail' width={250} height={250} />
            <h1 className='text-xl font-semibold text-muted-foreground text-center'>Discutez avec les membres de <br /> votre équipe</h1>
        </div>
    )
}

interface ChatHeaderProps {
  isConnected: boolean;
  onReconnect: () => void;
  reconnecting: boolean;
}

export function ChatHeader({ isConnected, onReconnect, reconnecting }: ChatHeaderProps) {
    const avatar = createAvatar(glass);
    const svg = avatar.toDataUri()
    return (
        <div className='flex items-center p-2 h-16 shrink-0 justify-between border-b'>
            <div className='flex items-center gap-2'>
                <Image src={svg} alt='chat-detail' width={30} height={30} className='rounded-full' />
                <div>
                  <h1 className='text-sm font-semibold'>Chat Général</h1>
                  <div className='flex items-center gap-1'>
                    {isConnected ? (
                      <>
                        <WifiIcon className='w-3 h-3 text-green-500' />
                        <span className='text-xs text-green-600'>Connecté</span>
                      </>
                    ) : (
                      <>
                        <WifiOffIcon className='w-3 h-3 text-red-500' />
                        <span className='text-xs text-red-600'>Déconnecté</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className='h-5 w-5 rounded-full ml-1' 
                          onClick={onReconnect}
                          disabled={reconnecting}
                        >
                          <RefreshCwIcon className={`h-3 w-3 ${reconnecting ? 'animate-spin' : ''}`} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <Button 
                size={"icon"}
                className='rounded-full'
                variant={'ghost'}>
                    <XIcon/>
                </Button>
            </div>
        </div>
    )
}

interface ChatContentProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  currentUser?: { id: string; username: string; email: string } | null;
  onReconnect: () => void;
  reconnecting: boolean;
}

export function ChatContent({ 
  messages, 
  isLoading, 
  error, 
  messagesEndRef, 
  currentUser,
  onReconnect,
  reconnecting
}: ChatContentProps) {
    if (isLoading) {
      return (
        <div className='flex flex-col p-4 h-full items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          <p className='text-sm text-muted-foreground mt-2'>Connexion au chat...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex flex-col p-4 h-full items-center justify-center gap-3'>
          <p className='text-sm text-red-500 text-center'>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReconnect}
            disabled={reconnecting}
            className='flex items-center gap-1'
          >
            <RefreshCwIcon className={`h-3 w-3 ${reconnecting ? 'animate-spin' : ''}`} />
            {reconnecting ? 'Reconnexion...' : 'Réessayer'}
          </Button>
        </div>
      );
    }

    return (
        <div className='flex flex-col p-4 h-96 overflow-y-auto'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full'>
                <p className='text-sm text-muted-foreground text-center'>
                  Aucun message pour le moment. Commencez la conversation !
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.tempId || message._id || message.createdAt} message={message} currentUser={currentUser} />
              ))
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}

interface ChatMessageProps {
  message: ChatMessage;
  currentUser?: { id: string; username: string; email: string } | null;
}

export function ChatMessage({ message, currentUser }: ChatMessageProps) {
    const avatar = createAvatar(glass, {
      seed: message.sender.username
    });
    const svg = avatar.toDataUri();
    const isMine = currentUser && (message.sender._id === currentUser.id || message.sender.email === currentUser.email);
    
    // Format de date à afficher
    const messageDate = new Date(message.createdAt);
    const formattedTime = format(messageDate, 'HH:mm', { locale: fr });

    return (
        <div className={`flex gap-3 mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
            {!isMine && (
              <div className='shrink-0 size-8 rounded-full overflow-hidden'>
                <Image 
                  src={svg} 
                  alt={message.sender.username} 
                  width={32} 
                  height={32} 
                  className='rounded-full shrink-0' 
                />
              </div>
            )}
            <div className={`flex-1 flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 mb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className='text-sm font-medium'>{message.sender.username}</span>
                    <span className='text-xs text-muted-foreground'>{formattedTime}</span>
                    {message.tempId && (
                      <span className='text-xs text-blue-500'>Envoi...</span>
                    )}
                </div>
                <div className={`${isMine ? 'bg-primary text-white' : 'bg-gray-100'} rounded-lg p-3 max-w-[80%]`}>
                    <p className='text-sm whitespace-pre-wrap break-words'>{message.content}</p>
                </div>
            </div>
            {isMine && (
              <div className='shrink-0 size-8 rounded-full overflow-hidden'>
                <Image 
                  src={svg} 
                  alt={message.sender.username} 
                  width={32} 
                  height={32} 
                  className='rounded-full shrink-0' 
                />
              </div>
            )}
        </div>
    )
}

interface ChatFooterProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isConnected: boolean;
  disabled: boolean;
}

export function ChatFooter({ 
  messageInput, 
  setMessageInput, 
  onSendMessage, 
  onKeyPress, 
  isConnected,
  disabled 
}: ChatFooterProps) {
    return (
        <div className='flex items-center p-4 border-t'>
            <ChatInput 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={onKeyPress}
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              disabled={disabled}
            />
        </div>
    )
}

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  isConnected: boolean;
  disabled: boolean;
}

export function ChatInput({ 
  value, 
  onChange, 
  onKeyPress, 
  onSendMessage, 
  isConnected,
  disabled 
}: ChatInputProps) {
    return (
        <div className='flex items-center gap-2 w-full'>
            <Input 
                type='text'
                placeholder='Écrivez un message...' 
                className='flex-1'
                value={value}
                onChange={onChange}
                onKeyDown={onKeyPress}
                disabled={disabled}
            />
            <Button 
                size={'icon'} 
                onClick={onSendMessage}
                disabled={!value.trim() || !isConnected || disabled}
                className={`${!value.trim() || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <SendIcon className='h-4 w-4' />
            </Button>
        </div>
    )
}
