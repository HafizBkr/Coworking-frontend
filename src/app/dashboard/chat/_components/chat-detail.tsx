"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { SendIcon, XIcon, WifiIcon, WifiOffIcon, RefreshCwIcon, ChevronUpIcon } from 'lucide-react';
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useChat, type ChatMessage } from '../_hooks/use-chat';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useChatIdStore } from '@/stores/chat-id.store';
import { useChatUsernameStore } from '@/stores/chat-username.store';

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
    checkAndReconnect,
    handleTyping,
    typingUsers,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
    totalMessagesLoaded
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
      // Arrêter le statut de frappe quand un message est envoyé
      handleTyping(false);
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
  
  // Gestion des événements de typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessageInput(newValue);
    
    // Déclencher l'événement typing seulement si la valeur change et n'est pas vide
    if (newValue.trim() !== '') {
      console.log('[ChatDetail] L\'utilisateur commence à taper');
      handleTyping(true);
    } else {
      console.log('[ChatDetail] L\'utilisateur arrête de taper (champ vide)');
      handleTyping(false);
    }
  };

  // Si aucun chat n'est sélectionné, afficher le composant placeholder
  if (!chatId) {
    return <ChatPlaceholder />;
  }

  return (
    <div className='col-span-2 bg-background flex flex-col relative rounded-lg px-2 h-[calc(100svh-6.5rem)] '>
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
          typingUsers={typingUsers}
          loadMoreMessages={loadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMore}
          totalMessagesLoaded={totalMessagesLoaded}
        />
        <ChatFooter 
          messageInput={messageInput}
          setMessageInput={handleInputChange}
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
        <div className='flex col-span-2 bg-background rounded-lg flex-col border overflow-hidden  h-[calc(100svh-7rem)] w-full items-center justify-center'>
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
  const { username } = useChatUsernameStore();
  const { chatId, clearChatId } = useChatIdStore();
    const avatar = createAvatar(glass, {
      seed: chatId || username || 'general-chat'
    });
    const svg = avatar.toDataUri();
    return (
        <div className='flex items-center p-2 h-16 shrink-0 sticky top-0 z-10 bg-background justify-between border-b'>
            <div className='flex items-center gap-2'>
                <Image src={svg} alt='chat-detail' width={30} height={30} className='rounded-full' />
                <div>
                  <h1 className='text-sm font-semibold'>{username}</h1>
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
                onClick={() => clearChatId()}
                size="icon"
                className='rounded-full'
                variant="ghost">
                    <XIcon className="h-4 w-4" />
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
  typingUsers: { userId: string; username: string; isTyping: boolean }[];
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  totalMessagesLoaded: number;
}

export function ChatContent({ 
  messages, 
  isLoading, 
  error, 
  messagesEndRef, 
  currentUser,
  onReconnect,
  reconnecting,
  typingUsers,
  loadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  totalMessagesLoaded = 0
}: ChatContentProps) {
  
  // Assurer que l'indicateur de frappe est visible en faisant défiler vers le bas quand il apparaît
  React.useEffect(() => {
    if (typingUsers.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers]);
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
        <div className='flex px-4 flex-col overflow-y-auto h-full relative'>
            {/* En-tête avec le compteur et le bouton de chargement des messages précédents */}
            <div className='flex flex-col backdrop-blur-sm items-center mb-4 sticky top-0 z-10 bg-background/80 py-2 w-full'>
              {/* Informations sur les messages chargés */}
              <div className='flex flex-col items-center gap-1'>
                {messages.length > 0 && (
                  <div className='text-xs text-muted-foreground'>
                    {totalMessagesLoaded} message{totalMessagesLoaded > 1 ? 's' : ''} chargé{totalMessagesLoaded > 1 ? 's' : ''}
                  </div>
                )}
                
                {/* État du chargement des messages anciens */}
                {isLoadingMore ? (
                  <div className='flex items-center justify-center py-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2'></div>
                    <span className='text-xs'>Chargement des messages...</span>
                  </div>
                ) : hasMoreMessages && messages.length > 0 ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={loadMoreMessages}
                    className='flex items-center gap-1 rounded-full px-4 text-xs'
                  >
                    <ChevronUpIcon className='h-3 w-3 mr-1' />
                    Charger 10 messages plus anciens
                  </Button>
                ) : messages.length > 0 && (
                  <div className='text-center text-xs text-muted-foreground py-2'>
                    Début de la conversation
                  </div>
                )}
              </div>
            </div>
            
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full'>
                <p className='text-sm text-muted-foreground text-center'>
                  Aucun message pour le moment. Commencez la conversation !
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.tempId||message._id} message={message} currentUser={currentUser} />
              ))
            )}
            
            {/* Indicateur de frappe - placé juste au-dessus de la référence de fin des messages */}
            {typingUsers.length > 0 && (
              <div className='flex items-center gap-2 mt-2 mb-3 bg-gray-100 rounded-full py-1 px-3 w-fit mx-auto'>
                <div className='flex space-x-1'>
                  <div className='w-2 h-2 bg-primary rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                  <div className='w-2 h-2 bg-primary rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                  <div className='w-2 h-2 bg-primary rounded-full animate-bounce' style={{ animationDelay: '600ms' }} />
                </div>
                <span className='text-xs text-gray-600 font-medium'>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0].username || 'Quelqu\'un'} est en train d'écrire...` 
                    : `${typingUsers.length} personnes sont en train d'écrire...`}
                </span>
              </div>
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
              <div className='shrink-0 h-8 w-8 rounded-full overflow-hidden'>
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
                </div>
                <div className={`${isMine ? 'bg-primary text-white' : 'bg-secondary'} rounded-lg p-3 max-w-[80%]`}>
                    <p className='text-sm whitespace-pre-wrap break-words'>{message.content}</p>
                </div>
            </div>
            {isMine && (
              <div className='shrink-0 h-8 w-8 rounded-full overflow-hidden'>
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
  setMessageInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        <div className='flex items-center sticky bottom-0 p-4 border-t bg-background z-10'>
            <ChatInput 
              value={messageInput}
              onChange={setMessageInput}
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
  onChange: React.ChangeEventHandler<HTMLInputElement>;
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
                placeholder={disabled ? 'Connexion en cours...' : 'Écrivez un message...'}
                className='flex-1'
                value={value}
                onChange={onChange}
                onKeyDown={onKeyPress}
                disabled={disabled}
            />
            <Button 
                size="icon" 
                onClick={onSendMessage}
                disabled={!value.trim() || !isConnected || disabled}
                className={!value.trim() || !isConnected ? 'opacity-50' : ''}
            >
                <SendIcon className='h-4 w-4' />
            </Button>
        </div>
    )
}
