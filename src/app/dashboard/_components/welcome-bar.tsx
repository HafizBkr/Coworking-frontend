/* eslint-disable react/react-in-jsx-scope */
"use client";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InvitationDialog } from "./invitation-dialog";

export function WelcomeBar() {
    const { currentWorkspace } = useWorkspaceStore();
    const [open, setOpen] = useState(false);
    return (
      <div className='w-full flex justify-between'>
          <div>
            <h1 className='text-4xl font-bold'>Bienvenue sur Working !</h1>
            <p className='text-muted-foreground text'>Vous voulez faire quoi aujourd&apos;hui ?</p>
          </div>
          <Button disabled={currentWorkspace ? false : true} onClick={() => setOpen(true)}>
            <Plus/>
            Inviter un membre
          </Button>
          <InvitationDialog open={open} setOpen={setOpen}/>
      </div>
    )
  }