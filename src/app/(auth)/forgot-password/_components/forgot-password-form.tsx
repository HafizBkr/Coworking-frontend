"use client";
import { Logo } from '@/components/customs/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pacifico } from 'next/font/google'
import React, { useState, useTransition } from 'react'
import { forgotPassword } from '../_services/forgot.service'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { useEmailStore } from '@/stores/email.store'
import { routes } from '@/config/routes'
import { FieldError } from '@/components/customs/field-error'

const pacifico = Pacifico({
  weight:["400"],
  subsets:["latin"]
})

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{[key: string]: string[] | undefined}>({});
  const { setEmail } = useEmailStore();
  async function handleForgotPassword(formData:FormData){
    startTransition(async () =>{
      const response = await forgotPassword(formData);
      console.log({ errors: response.errors, error: response.error})
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }

      
      if(response.success){
        setEmail(formData.get("email")?.toString()||"");
        redirect(routes.auth.forgot_otp)
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
      <p className='text-muted-foreground text-center text-sm'>Entrer l&apos;email de recuperation de votre compte <br /> pour vous continuer.</p>
    </div>
    <form action={handleForgotPassword} className='space-y-4 w-full'>
        <div className='space-y-2'>
            <Label>Email</Label>
            <Input className='bg-secondary shadow-none' type='email' name='email' placeholder='example@gmail.com'/>
            <FieldError message={errors.email?.[0]}/>
        </div>
        <div className='grid grid-cols-2 gap-4'>
            <Button type='button' onClick={()=>redirect(routes.auth.signin)} variant={'outline'} className='w-full'>Retour</Button>   
            <Button type='submit' loading={isPending} className='w-full'>Continuer</Button>   
        </div>   
    </form>
  </div>
  )
}
