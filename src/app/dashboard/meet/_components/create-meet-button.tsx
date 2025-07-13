"use client"
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspace.store';
import { PlusIcon } from 'lucide-react'
import React, { useTransition } from 'react'
import { createMeetRoom } from '../_services/visio.service';
import { toast } from 'sonner';

export function CreateMeetButton() {
    const { currentWorkspace } = useWorkspaceStore();
    const [isPending, startTransition] = useTransition();
    async function handleCreateMeetRoom(){
        if (!currentWorkspace) {
            toast("Veuillez sélectionner un espace de travail avant de créer une réunion.");
            return;
        }
        startTransition(async () => {
            const res = await createMeetRoom(currentWorkspace?._id);
            if(res.success){
                // Redirection vers la page de la salle de réunion
                console.log({ res })
            } else {
                // Afficher un message d'erreur
                toast.error(res.message);
            }
        });
    }

  return (
    <form action={handleCreateMeetRoom}>
        <Button loading={isPending}>
            <PlusIcon/> Demarrer un reunion
        </Button>
    </form>
  )
}
