"use client";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { routes } from '@/config/routes'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
// import { redirect } from 'next/navigation'
import { FieldError } from '@/components/customs/field-error'
import { Textarea } from '@/components/ui/textarea';
import { createProject } from '../_services/project.service';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

export function ProjectForm({ setOpen }:{ setOpen:(e:boolean)=> void }) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{[key: string]: string[] | undefined}>({});
  const { currentWorkspace } = useWorkspaceStore();

  async function handleCreateProject(formData:FormData){
    startTransition(async () =>{
      const response = await createProject(formData);
      
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }

      
      if(response.success){
        setOpen(false)
        redirect(routes.dashboard.projects)
      }

    })
  }
  return (
    <div className='max-w-sm flex flex-col gap-4 items-center w-full'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <h1 className={`text-2xl font-bold text-center`}>Creation de projet</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer les informations suivante <br /> pour vous continuer.</p>
    </div>
    <form action={handleCreateProject} className='space-y-4 w-full'>
      <div className='space-y-2'>
        <Label>Nom du projet</Label>
        <Input className='bg-secondary shadow-none' type='text' name='name' placeholder='Ex:Cianus'/>
        <FieldError message={errors.name?.[0]}/>
      </div>
      <div className='space-y-2'>
        <Label>Description</Label>
        <Textarea className='bg-secondary shadow-none' name='description' placeholder='Ecriver une bref description de votre projet ici.'/>
        <FieldError message={errors.description?.[0]}/>
      </div>
      <div className='space-y-2'>
        <div className='grid grid-cols-2 gap-2'>
            <Input className='bg-secondary shadow-none' type="date" placeholder='Date de debut' name='start_date'/>
            <Input className='bg-secondary shadow-none' type="date" placeholder='Date de fin' name='end_date'/>
        </div>
        <FieldError message={errors.start_date?.[0]}/>
        <FieldError message={errors.end_date?.[0]}/>
      </div>
      <input type='hidden' value={currentWorkspace?._id} name='workspace_id'/>
      <Button loading={isPending} className='w-full'>Enregister</Button>        
    </form>
  </div>
  )
}
