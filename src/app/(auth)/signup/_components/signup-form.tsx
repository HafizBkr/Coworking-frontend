"use client";
import { Logo } from '@/components/customs/logo'
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { routes } from '@/config/routes'
// import { glass } from '@dicebear/collection';
// import { createAvatar } from '@dicebear/core';
// import { Edit } from 'lucide-react';
import { Pacifico } from 'next/font/google'
// import Image from 'next/image';
import Link from 'next/link'
import React from 'react'

const pacifico = Pacifico({
  weight:["400"],
  subsets:["latin"]
})

export function SignUpForm() {
  // const avatar = createAvatar(glass);
  // const svg = avatar.toDataUri()
  return (
    <div className='max-w-sm flex flex-col gap-2 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <Logo/>
        <h1 className={`text-2xl font-bold text-center ${pacifico.className}`}>Working</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations suivante <br /> pour continuer.</p>
    </div>
    <div className='space-y-4 w-full'>
      {/* <div className='flex flex-col gap-4 justify-center items-center'>
        <div className='size-24 border-2 rounded-full relative'>
          <Image 
            src={svg} 
            alt={svg} 
            fill
            className='rounded-full'
          />
          <Button 
            variant={'outline'}
            className='rounded-full absolute -bottom-2  -right-2' 
            size={'icon'}>
            <Edit/>
          </Button>
        </div>
        <Badge  className='rounded-full' variant={'secondary'}>Choisir un avatar</Badge>
      </div> */}
      <div className='space-y-2'>
        <Label>Nom d&apos;utilisateur</Label>
        <Input className='bg-secondary shadow-none' type='text' name='username' placeholder="nom d'utilisateur"/>
      </div>
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input className='bg-secondary shadow-none' type='email' name='email' placeholder='example@gmail.com'/>
      </div>
      <div className='space-y-2'>
        <Label>Mot de passe</Label>
        <Input className='bg-secondary shadow-none' type='password' name='password' placeholder='mot de passe'/>
      </div>
      <div className='space-y-2'>
        <Label>Confirmer votre mot de passe</Label>
        <Input className='bg-secondary shadow-none' type='password' name='comfirm-password' placeholder='comfirmer votre mot de passe'/>
      </div>
      <Button className='w-full'>Creer mon compte</Button> 
      <div className='w-full text-sm flex justify-center'>
        <span>Vous avez deja un compte ?
          <Link className='text-primary underline' href={routes.auth.signin}>Se connecter</Link>
        </span>
      </div>        
    </div>
  </div>
  )
}
