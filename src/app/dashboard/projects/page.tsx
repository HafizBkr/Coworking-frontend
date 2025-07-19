
import React from 'react'
import { ProjectList } from './_components/project-list'
import { NavBarProjects } from './_components/navbar-project'


export default function ProjectsPage() {
  return (
    <section className='min-h-[calc(100svh-4rem)] overflow-y-auto p-8 space-y-4 bg-secondary w-full'>
      <NavBarProjects/>
      <ProjectList/>
    </section>
  )
}




