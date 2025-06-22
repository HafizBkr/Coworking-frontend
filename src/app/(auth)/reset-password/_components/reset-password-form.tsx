"use client";
import { FieldError } from '@/components/customs/field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'


export function ResetPasswordForm() {
  const [errors, ] = useState<{[key: string]: string[] | undefined}>({});
  return (
    <div className='max-w-sm flex flex-col gap-2 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
    <div className='flex gap-2'>
        <h1 className={`text-2xl font-bold text-center `}>Reinitialiser votre mot de passe </h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations necessaire <br /> pour continuer.</p>
    </div>
    <div className='space-y-4 w-full'>
        <div className='space-y-2'>
          <Label>Mot de passe</Label>
          <Input className='bg-secondary shadow-none' type='password' name='password' placeholder='mot de passe'/>
          <FieldError message={errors.password?.[0]}/>
        </div>
        <div className='space-y-2'>
          <Label>Comfirmer le mot de passe</Label>
          <Input className='bg-secondary shadow-none' type='comfirm_password' name='password' placeholder='mot de passe'/>
          <FieldError message={errors.comfirm_password?.[0]}/>
        </div>
        <Button className='w-full'>Continuer</Button>    
    </div>
  </div>
  )
}
