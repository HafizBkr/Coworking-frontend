import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'
import { ProjectList } from './_components/project-list'

export default function ProjectsPage() {
  return (
    <section className='min-h-[calc(100svh-4rem)] overflow-y-auto p-8 space-y-4 bg-secondary/50 w-full'>
      <NavBar/>
      <ProjectList/>
    </section>
  )
}


function NavBar() {
  return (
    <div className='w-full flex justify-between items-end'>
        <div>
          <h1 className='text-4xl font-bold'>Projets</h1>
          <p className='text-muted-foreground text'>Vous pouvez gerer vos projets ici.</p>
        </div>
        <Button>
          <Plus/>
          Creer un projet
        </Button>
    </div>
  )
}

