import { Logo } from '@/components/customs/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pacifico } from 'next/font/google'
import React from 'react'

const pacifico = Pacifico({
  weight:["400"],
  subsets:["latin"]
})

export function ForgotPasswordForm() {
  return (
    <div className='max-w-sm flex flex-col gap-2 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <Logo/>
        <h1 className={`text-2xl font-bold text-center ${pacifico.className}`}>Working</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer l&apos;email de recuperation de votre compte <br /> pour vous continuer.</p>
    </div>
    <div className='space-y-4 w-full'>
        <div className='space-y-2'>
            <Label>Email</Label>
            <Input className='bg-secondary shadow-none' type='email' name='email' placeholder='example@gmail.com'/>
        </div>
        <div className='grid grid-cols-2 gap-4'>
            <Button variant={'outline'} className='w-full'>Retour</Button>   
            <Button className='w-full'>Continuer</Button>   
        </div>   
    </div>
  </div>
  )
}
