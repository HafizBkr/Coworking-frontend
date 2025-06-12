import { Loader } from '@/components/customs/loader'
import React from 'react'

export default function LoadingPage() {
  return (
    <main className='w-full h-full flex flex-col justify-center items-center'>
        <Loader/>
    </main>
  )
}
