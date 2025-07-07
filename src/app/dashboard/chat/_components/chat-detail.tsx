"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { SendIcon, XIcon, WifiIcon, WifiOffIcon } from 'lucide-react';
import Image from 'next/image'
import React, { useState } from 'react'
import { useChat, type ChatMessage } from '../_hooks/use-chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ChatDetailComponent() {
  const { messages, isConnected, isLoading, error, sendMessage, messagesEndRef } = useChat();
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleTestMessage = () => {
    console.log('🧪 [Test] Envoi d\'un message de test');
    sendMessage('Message de test - ' + new Date().toLocaleTimeString());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='col-span-2 bg-white rounded-lg p-2 h-full flex flex-col'>
        <ChatHeader isConnected={isConnected} onTestMessage={handleTestMessage} />
        <ChatContent 
          messages={messages} 
          isLoading={isLoading} 
          error={error}
          messagesEndRef={messagesEndRef}
        />
        <ChatFooter 
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isConnected={isConnected}
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
  onTestMessage?: () => void;
}

export function ChatHeader({ isConnected, onTestMessage }: ChatHeaderProps) {
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
                      </>
                    )}
                  </div>
                </div>
            </div>
            <div className='flex items-center gap-2'>
                {onTestMessage && (
                  <Button 
                    size={"sm"}
                    className='text-xs'
                    variant={'outline'}
                    onClick={onTestMessage}>
                    Test
                  </Button>
                )}
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
}

export function ChatContent({ messages, isLoading, error, messagesEndRef }: ChatContentProps) {
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
        <div className='flex flex-col p-4 h-full items-center justify-center'>
          <p className='text-sm text-red-500 text-center'>{error}</p>
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
                <ChatMessage key={message._id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const avatar = createAvatar(glass, {
      seed: message.sender.username
    });
    const svg = avatar.toDataUri();
    
    return (
        <div className='flex gap-3 mb-4'>
            <div className='shrink-0 size-8 rounded-full overflow-hidden'>
            <Image 
              src={svg} 
              alt={message.sender.username} 
              width={32} 
              height={32} 
              className='rounded-full shrink-0' 
            />
            </div>
            <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                    <span className='text-sm font-medium'>{message.sender.username}</span>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
                    </span>
                    {message.tempId && (
                      <span className='text-xs text-blue-500'>Envoi...</span>
                    )}
                </div>
                <div className='bg-gray-100 rounded-lg p-3 max-w-[80%]'>
                    <p className='text-sm'>{message.content}</p>
                </div>
            </div>
        </div>
    )
}

interface ChatFooterProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isConnected: boolean;
}

export function ChatFooter({ 
  messageInput, 
  setMessageInput, 
  onSendMessage, 
  onKeyPress, 
  isConnected 
}: ChatFooterProps) {
    return (
        <div className='flex items-center p-4 border-t'>
            <ChatInput 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={onKeyPress}
              onSendMessage={onSendMessage}
              isConnected={isConnected}
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
}

export function ChatInput({ 
  value, 
  onChange, 
  onKeyPress, 
  onSendMessage, 
  isConnected 
}: ChatInputProps) {
    return (
        <div className='flex items-center gap-2 w-full'>
            <Input 
              placeholder={isConnected ? 'Tapez votre message...' : 'Connexion...'} 
              className='w-full'
              value={value}
              onChange={onChange}
              onKeyPress={onKeyPress}
              disabled={!isConnected}
            />
            <Button 
                className='rounded-full' 
                variant={'outline'} 
                size={'icon'}
                onClick={onSendMessage}
                disabled={!isConnected || !value.trim()}>
                <SendIcon/>
            </Button>
        </div>
    )
}
