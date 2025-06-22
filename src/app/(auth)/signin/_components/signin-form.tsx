"use client";
import { Logo } from '@/components/customs/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { routes } from '@/config/routes'
import { Pacifico } from 'next/font/google'
import Link from 'next/link'
import React, { useState, useTransition } from 'react'
import { signIn } from '../_services/signin.service'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { FieldError } from '@/components/customs/field-error'

const pacifico = Pacifico({
  weight:["400"],
  subsets:["latin"]
})

export function SigninForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{[key: string]: string[] | undefined}>({});
  async function handleSignIn(formData:FormData){
    startTransition(async () =>{
      const response = await signIn(formData);
      
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }

      
      if(response.success){
        redirect(routes.dashboard.home)
      }

    })
  }
  return (
    <div className='max-w-sm flex flex-col gap-2 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <Logo/>
        <h1 className={`text-2xl font-bold text-center ${pacifico.className}`}>Working</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations suivante <br /> pour vous connecter.</p>
    </div>
    <form action={handleSignIn} className='space-y-4 w-full'>
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input className='bg-secondary shadow-none' type='email' name='email' placeholder='example@gmail.com'/>
        <FieldError message={errors.email?.[0]}/>
      </div>
      <div className='space-y-2'>
        <Label>Mot de passe</Label>
        <Input className='bg-secondary shadow-none' type='password' name='password' placeholder='mot de passe'/>
        <FieldError message={errors.password?.[0]}/>
      </div>
      <Button loading={isPending} className='w-full'>Se connecter</Button> 
      <div className='w-full text-sm flex justify-center'>
        <span>Vous n&apos;avez pas de compte ? <Link className='text-primary' href={routes.auth.signup}>S&apos;inscricre</Link></span>
      </div>        
    </form>
  </div>
  )
}
