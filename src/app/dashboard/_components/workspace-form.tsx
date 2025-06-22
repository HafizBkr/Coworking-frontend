"use client";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { routes } from '@/config/routes'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { FieldError } from '@/components/customs/field-error'
import { createWorkspace } from '../_services/workspace.service';
import { Textarea } from '@/components/ui/textarea';

export function WorkspaceForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{[key: string]: string[] | undefined}>({});

  async function handleCreateWorkspace(formData:FormData){
    startTransition(async () =>{
      const response = await createWorkspace(formData);
      
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
    <div className='max-w-sm flex flex-col gap-4 items-center w-full'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <h1 className={`text-2xl font-bold text-center`}>Creation de workspace</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations suivante <br /> pour vous continuer.</p>
    </div>
    <form action={handleCreateWorkspace} className='space-y-4 w-full'>
      <div className='space-y-2'>
        <Label>Nom du workpace</Label>
        <Input className='bg-secondary shadow-none' type='text' name='name' placeholder='Ex:Cianus'/>
        <FieldError message={errors.name?.[0]}/>
      </div>
      <div className='space-y-2'>
        <Label>Description</Label>
        <Textarea className='bg-secondary shadow-none' name='description' placeholder='Ecriver une bref description de votre workspace ici.'/>
        <FieldError message={errors.description?.[0]}/>
      </div>
      <Button loading={isPending} className='w-full'>Enregister</Button>        
    </form>
  </div>
  )
}
