import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { XIcon } from 'lucide-react';
import Image from 'next/image'
import React from 'react'

export function ChatDetailComponent() {
  return (
    <div className='col-span-2 bg-white rounded-lg p-2 h-full'>
        {/* <ChatHeader />
        <ChatContent/>
        <ChatFooter/> */}
        <ChatPlaceholder/>
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


export function ChatHeader() {
    const avatar = createAvatar(glass);
    const svg = avatar.toDataUri()
    return (
        <div className='flex items-center p-2 justify-between'>
            <div className='flex items-center gap-2'>
                <Image src={svg} alt='chat-detail' width={30} height={30} className='rounded-full' />
                <h1 className='text-sm font-semibold'>John Doe</h1>
            </div>
            <div>
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


export function ChatContent() {
    return (
        <div className='flex flex-col p-4'>

        </div>
    )
}


export function ChatMessage() {
    return (
        <div className='flex flex-col p-4'>

        </div>
    )
}


export function ChatFooter() {
    return (
        <div className='flex items-center p-4'>
            <ChatInput/>
        </div>
    )
}

export function ChatInput() {
    return (
        <div >
            <Input placeholder='Message' />
        </div>
    )
}
