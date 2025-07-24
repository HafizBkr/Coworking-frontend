/* eslint-disable react/react-in-jsx-scope */
'use client';

import Image from 'next/image';
import { useSession } from '@/hooks/use-session';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MeetPage() {
  const { user, isLoading, error } = useSession();
  
  if (isLoading) {
    return (
      <section className='min-h-[calc(100svh-4rem)] overflow-y-auto flex flex-col justify-center items-center p-8 space-y-4 bg-secondary w-full'>
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Chargement...</p>
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className='min-h-[calc(100svh-4rem)] overflow-y-auto flex flex-col justify-center items-center p-8 space-y-4 bg-secondary w-full'>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Impossible de charger les informations utilisateur'}
          </AlertDescription>
        </Alert>
      </section>
    );
  }



  return (
    <section className='min-h-[calc(100svh-4rem)] overflow-y-auto flex flex-col justify-center items-center p-8 space-y-8 bg-secondary w-full'>
      {/* Header avec icône */}
      <div className='text-center space-y-4'>
        <div className='relative size-36 overflow-hidden mx-auto'>
          <Image
            src={"/icons/meeting.svg"}
            alt={"Icône de réunion"}
            fill
            className='object-cover'
          />
        </div>
        <div>
          <h1 className='text-center text-3xl font-bold'>Démarrer une réunion</h1>
          <p className='text-muted-foreground text-center text-lg'>
            Converser en direct avec vos membres d&apos;équipe
          </p>
          <p className='text-muted-foreground text-center text-sm mt-2'>
            Connecté en tant que <strong>{user.username}</strong>
          </p>
        </div>
      </div>

      {/* Composant de création de réunion */}
      {/* <div className='w-full max-w-2xl'>
        <CreateMeeting 
          workspaceId={workspaceId}
          onMeetingCreated={(roomId) => {
            console.log('Réunion créée:', roomId);
          }}
        />
      </div> */}
    </section>
  );
}
