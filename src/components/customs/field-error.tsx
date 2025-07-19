import React from 'react'
import { Label } from '../ui/label'
import { CircleXIcon } from 'lucide-react'

export function FieldError({ message }:{ message?: string|null }) {
    if(!message){
        return null
    }

    return (
        <Label className='flex mt-2 items-center text-destructive'>
            <CircleXIcon size={16} className='text-destructive'/> 
            {message}
        </Label>
    )
}
