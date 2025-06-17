import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function MeetPage() {
  return (
    <section className='min-h-[calc(100svh-4rem)] overflow-y-auto flex  flex-col justify-center items-center p-8 space-y-4 bg-secondary/50 w-full'>
        <div className='relative size-36 overflow-hidden'>
            <Image
                src={"/icons/meeting.svg"}
                alt={"/icons/meeting.svg"}
                fill
                className='object-cover'
            />
        </div>
        <div>
            <h1 className='text-center text-2xl font-bold'>Demarrer un reunion instantanée</h1>
            <p className='text-muted-foreground text-center'>Converser en direct avec vos membres</p>
        </div>
        <Button><PlusIcon/> Demarrer un reunion</Button>
    </section>
  )
}
