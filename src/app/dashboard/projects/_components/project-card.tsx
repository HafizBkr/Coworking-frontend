import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import Image from 'next/image'
import React from 'react'
import { Edit, EllipsisIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';




export default function ProjectCard() {
const avatar = createAvatar(glass);
const svg = avatar.toDataUri()
  return (
    <div className='w-full hover:scale-105 transition-all ease-in-out duration-300 group space-y-2 p-4 bg-background border shadow rounded-xl relative'>
        <div className='flex gap-2'>
            <div className='size-12 shrink-0 relative rounded-full overflow-hidden'>
                <Image
                src={svg}
                alt={svg}
                fill
                />
            </div>
            <Link href={"#"} className='max-w-md hover:underline w-full'>
                <h1 className='text-lg font-semibold'>Projet 1</h1>
                <p className='text-muted-foreground text-sm line-clamp-2'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae provident quod laudantium iste similique corporis nulla totam officia alias vero veritatis eos quibusdam voluptate ullam explicabo odio et, esse cum?</p>
            </Link>
        </div>
        <div className='flex justify-between'>
            <span className='text-sm font-semibold text-muted-foreground'>Fin de projet</span>
            <Badge className='rounded-full dark:text-white'>3/06/2025</Badge>
        </div>
        <div className='absolute -z-20 group-hover:z-0 top-2 right-2'>
            <OptionsProjects/>
        </div>
    </div>
  )
}


function OptionsProjects() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full size-6 shadow-none"
            aria-label="Open edit menu"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem><Edit/>Modifier</DropdownMenuItem>
          <DropdownMenuItem variant='destructive'><Trash2Icon/>Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }