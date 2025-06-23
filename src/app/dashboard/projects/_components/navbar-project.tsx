/* eslint-disable react/react-in-jsx-scope */
"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { ProjectDialog } from './project-dialog'

export function NavBarProjects() {
    const [open, setOpen] = useState(false);
    return (
      <div className='space-y-5'>
        <div className='w-full flex justify-between items-end'>
            <div>
              <h1 className='text-4xl font-bold'>Projets</h1>
              <p className='text-muted-foreground text'>Vous pouvez gerer vos projets ici.</p>
            </div>
            <Button onClick={()=>setOpen(true)}>
              <Plus/>
              Creer un projet
            </Button>
        </div>
        <div>
          <Input placeholder='Rechercher par nom' className='bg-background'/>
        </div>
        <ProjectDialog open={open} setOpen={setOpen}/>
      </div>
    )
  }