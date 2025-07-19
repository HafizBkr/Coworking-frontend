import React from 'react'
import {
    Dialog,
    DialogContent,
  } from "@/components/ui/dialog"
import { WorkspaceForm } from './workspace-form'

export function WorkspaceDialog({ open, setOpen }:
    { 
        open: boolean
        setOpen: (e: false)=> void
    }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <WorkspaceForm/>
        </DialogContent>
    </Dialog>
  )
}
