import React from 'react'
import {
    Dialog,
    DialogContent,
  } from "@/components/ui/dialog"
import { ProjectForm } from './project-form'

export function ProjectDialog({ open, setOpen }:
    { 
        open: boolean
        setOpen: (e: boolean)=> void
    }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <ProjectForm setOpen={setOpen}/>
        </DialogContent>
    </Dialog>
  )
}
