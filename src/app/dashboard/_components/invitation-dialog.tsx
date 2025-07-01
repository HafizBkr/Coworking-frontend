import React from 'react'
import {
    Dialog,
    DialogContent,
  } from "@/components/ui/dialog"
import EmailTagInput from './email-tag-input'

export function InvitationDialog({ open, setOpen }:
    { 
        open: boolean
        setOpen: (e: false)=> void
    }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='p-0'>
            <EmailTagInput/>
        </DialogContent>
    </Dialog>
  )
}
