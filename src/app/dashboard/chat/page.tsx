import React from 'react'
import { ChatComponent } from './_components/chat'
import { ChatDetailComponent } from './_components/chat-detail'

export default function ChatPage() {
  return (
    <section className='grid grid-cols-3 gap-4 px-4 pt-6 h-full flex-1 space-y-4 bg-secondary w-full'>
        <ChatComponent/>
        <ChatDetailComponent/>
    </section>
  )
}
