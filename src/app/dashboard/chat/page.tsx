import React from 'react'
import { ChatComponent } from './_components/chat'
import { ChatDetailComponent } from './_components/chat-detail'

export default function ChatPage() {
  return (
    <section className='min-h-[calc(100svh-4rem)] grid grid-cols-3 gap-4  p-4 space-y-4 bg-secondary/50 w-full'>
        <ChatComponent/>
        <ChatDetailComponent/>
    </section>
  )
}
