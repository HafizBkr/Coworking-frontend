/* eslint-disable react/react-in-jsx-scope */
"use client";
import { glass } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { BoltIcon, BookOpenIcon, ChevronDownIcon, Layers2Icon, LogOutIcon } from "lucide-react";

export function UserProfile() {
    const { user, isLoading } = useSession();
    const avatar = createAvatar(glass,{
      seed: user?.username
    });
    const svg = avatar.toDataUri()

    if(isLoading){
      return  "chargement..."
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto ring-0 focus-visible:ring-0 p-0 hover:bg-transparent">
            <div className='flex gap-2'>
                <Avatar>
                    <AvatarImage src={svg} alt="Profile image" />
                    <AvatarFallback>{user?.username.charAt(0)} {user?.username.charAt(1)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col justify-center items-start'>
                    <h1>{user?.username}</h1>
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
            {user?.username}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user?.email}
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
          <DropdownMenuItem>
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span>Deconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }