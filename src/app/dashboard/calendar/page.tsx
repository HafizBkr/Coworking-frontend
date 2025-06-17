import { CalendarCard } from '@/components/demo'
import React from 'react'

export default function CalendarPage() {
  return (
    <section className='h-[calc(100svh-4rem)] overflow-y-auto space-y-4  w-full'>
        <div className='bg-background rounded-2xl'>
          <CalendarCard/>
        </div>
    </section>
  )
}
