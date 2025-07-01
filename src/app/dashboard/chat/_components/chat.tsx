import React from 'react'

interface Chat {
    id: string
    name: string
    avatar: string
    lastMessage: string
    lastMessageTime: string
    unreadCount: number
}

interface ChatListProps {
    chats: Chat[]
}

export function ChatComponent() {
    const chats = [
        {
            id: '1',
            name: 'John Doe',
            avatar: 'https://via.placeholder.com/150',
            lastMessage: 'Hello, how are you?',
            lastMessageTime: '12:00',
            unreadCount: 1,
        },
        {
            id: '2',
            name: 'Jane Doe',
            avatar: 'https://via.placeholder.com/150',
            lastMessage: 'Hello, how are you?',
            lastMessageTime: '12:00',
            unreadCount: 1,
        },
        
    ]   
  return (
    <div className='col-span-1 bg-white rounded-lg space-y-4 p-4 h-full'>
         <div className='px-2'>
            <h1 className='text-xl font-semibold'>Conversations</h1>
        </div>
        <ChatList chats={chats} />
    </div>
  )
}


function ChatItem({ chat }: { chat: Chat }) {
  return (
    <div className='flex items-center gap-2 p-2 rounded-lg hover:bg-primary/10 cursor-pointer'>
        <div className='size-10 rounded-xl flex items-center justify-center bg-primary/10'>
            <h1 className='font-bold text-primary'>{chat.name.charAt(0)}</h1>
        </div>
        <div className='flex flex-col'>
            <h1 className='text-sm font-bold'>{chat.name}</h1>
            <p className='text-sm text-gray-500'>{chat.lastMessage}</p>
        </div>
    </div>
  )
}


function ChatList({ chats }: ChatListProps) {
  return (
    <div className='flex flex-col '>
        {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
        ))}
    </div>
  )
}
