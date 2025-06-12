"use client";
import React from 'react'
import { Command, AudioWaveform, GalleryVerticalEnd } from 'lucide-react'
import { WorkSpaceSwitcher } from './workspace-switcher';
import { Button } from '@/components/ui/button';
import { useState } from "react"
import { BellIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    BoltIcon,
    BookOpenIcon,
    ChevronDownIcon,
    Layers2Icon,
    LogOutIcon,
    PinIcon,
    UserPenIcon,
  } from "lucide-react"
  
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const workspaces =  [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform ,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
]

export function HeaderDashboard() {
  return (
    <header className='border-b flex items-center justify-between  p-2 h-16 '>
        <div className='max-w-52 w-full'>
            <WorkSpaceSwitcher workspaces={workspaces}/>
        </div>
        <div className='border-l px-4'>
            <NotifyButton/>
            <UserProfile/>
        </div>
    </header>
  )
}




function NotifyButton() {
  const [count, setCount] = useState(3)

  const handleClick = () => {
    setCount(0)
  }
  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={handleClick}
      aria-label="Notifications"
    >
      <BellIcon size={16} aria-hidden="true" />
      {count > 0 && (
        <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  )
}

  
function UserProfile() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto ring-0 focus-visible:ring-0 p-0 hover:bg-transparent">
            <div className='flex gap-2'>
                <Avatar>
                    <AvatarImage src="./avatar.jpg" alt="Profile image" />
                    <AvatarFallback>KK</AvatarFallback>
                </Avatar>
                <div className='flex flex-col justify-center items-start'>
                    <h1>Keith Kennedy</h1>
                </div>
            </div>
            <ChevronDownIcon
              size={16}
              className="opacity-60"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-64">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="text-foreground truncate text-sm font-medium">
              Keith Kennedy
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              k.kennedy@originui.com
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Option 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Layers2Icon size={16} className="opacity-60" aria-hidden="true" />
              <span>Option 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpenIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Option 3</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <PinIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Option 4</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
              <span>Option 5</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  