/* eslint-disable react/react-in-jsx-scope */
"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Plus } from "lucide-react";

export function WelcomeBar() {
    const { user } = useSession();
    const { currentWorkspace } = useWorkspaceStore();
    return (
      <div className='w-full flex justify-between'>
          <div>
            <h1 className='text-4xl font-bold'>Salut {user?.username},</h1>
            <p className='text-muted-foreground text'>Vous voulez faire quoi aujourd&apos;hui ?</p>
          </div>
          <Button disabled={currentWorkspace ? false : true}>
            <Plus/>
            Inviter un membre
          </Button>
      </div>
    )
  }