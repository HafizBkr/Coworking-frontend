"use client";
import { FieldError } from '@/components/customs/field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useTransition } from 'react'
import { resetPassword } from '../_services/reset-password.service';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { useCodeStore } from '@/stores/code.store';
import { useEmailStore } from '@/stores/email.store';


export function ResetPasswordForm() {
  const [errors,setErrors ] = useState<{[key: string]: string[] | undefined}>({});
  const [isPending, startTransition] = useTransition();
  const { code, clearCode } = useCodeStore();
  const { email, clearEmail } = useEmailStore();

  async function handleResetPassword(formData:FormData){
    startTransition(async () =>{
      const response = await resetPassword(formData);
      console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }
      
      if(response.success){
        clearCode();
        clearEmail();
        redirect(routes.auth.signin)
      }
    })
  }

  return (
    <div className='max-w-sm flex flex-col gap-2 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
    <div className='flex gap-2'>
        <h1 className={`text-2xl font-bold text-center `}>Reinitialiser votre mot de passe </h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations necessaire <br /> pour continuer.</p>
    </div>
    <form action={handleResetPassword} className='space-y-4 w-full'>
        <div className='space-y-2'>
          <Label>Mot de passe</Label>
          <Input className='bg-secondary shadow-none' type='password' name='password' placeholder='mot de passe'/>
          <FieldError message={errors.password?.[0]}/>
        </div>
        <div className='space-y-2'>
          <Label>Comfirmer le mot de passe</Label>
          <Input className='bg-secondary shadow-none' type='password' name='comfirm_password' placeholder='mot de passe'/>
          <FieldError message={errors.comfirm_password?.[0]}/>
        </div>
        <input name='code' value={code || ""} type='hidden'/>
        <input name='email' value={email || ""} type='hidden' />
        <Button loading={isPending} className='w-full'>Continuer</Button>    
    </form>
  </div>
  )
}
