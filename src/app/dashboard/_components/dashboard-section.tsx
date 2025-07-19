/* eslint-disable react/react-in-jsx-scope */
"use client";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useActiveUsersWorkspaces } from '../_hooks/use-workspaces-members-active';
import { User } from '@/models/user.model';
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import { Loader } from '@/components/customs/loader';




type DashboardCardProps = {
  label: string;
  count: number;
  total?: number;
  illustration: string;
  className?: string
}

export default function DashboardSection() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <DashboardCard 
          label='Projets actifs' 
          count={3} 
          illustration='/icons/projet.svg'
          />
        <DashboardCard 
          label='Membres en ligne' 
          count={10} 
          total={15}
          illustration='/icons/group.svg'
          />
        <DashboardCard 
          label='Messages non lues' 
          count={20} 
          illustration='/icons/message.svg'
          />
        <DashboardCard 
          label='Taches en cours' 
          count={8} 
          illustration='/icons/ticket.svg'
          className="max-md:col-span-2"
          />
      </div>
      <div className='grid md:grid-cols-2 gap-4 '>
        <UrgentTaskCard/>
        <VirtualSpaceCard/>
      </div>
    </div>
  )
}

function DashboardCard(props:DashboardCardProps){
  return(
    <div className={cn('shadow-lg group flex  justify-between w-full h-full overflow-hidden bg-background rounded-xl',props.className)}>
      <div className='flex flex-col p-4 h-full gap-2'>
        <h1 className='text-lg font-semibold'>{props.label}</h1>
        <div>
          <span className='text-4xl font-bold'>{props.count}</span>
          {props.total && <span>/{props.total}</span>}
        </div>
      </div>
      <div className='relative size-36'>
          <Image 
            src={props.illustration} 
            alt={props.illustration} 
            fill
            className=' group-hover:scale-115 transition-all ease-in-out duration-300'
            />
      </div>
    </div>
  )
}


function UrgentTaskCard(){
  return (
    <div className='bg-background shadow-lg h-full rounded-xl'>
      <div className='flex p-4 justify-between h-16  overflow-hidden items-enter'>
        <div>
          <h1 className='font-bold text-xl'>Taches urgente</h1>
          <p className='text-muted-foreground'>Tâches nécessitant une attention immédiate</p>
        </div>
        <div className='relative size-24'>
          <Image 
            src={"/icons/cible.svg"}
            alt='/icons/cible.svg'
            fill
            className='-translate-y-6'
            />
        </div>
      </div>
      <div className='relative rounded-xl  m-4 overflow-hidden'>
      <div className="pointer-events-none absolute z-10 inset-x-0 top-0 h-[6%] bg-gradient-to-b from-background"></div> 
        <ScrollArea className='h-72 '>
          <div className='p-4 space-y-4'>
            {Array.from({ length: 10 }).map((_, index) => (
              <UrgentTaskCardItem key={index} />
            ))}
          </div>
        </ScrollArea>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-t from-background"></div>
      </div>
    </div>
  )
}

function UrgentTaskCardItem(){
  return(
    <div className='p-2 transition-all bg-background ease-in-out duration-200 hover:scale-102 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] rounded-xl relative'>
      <div className='flex gap-2'>
        <div className='size-14 shrink-0 rounded-xl bg-primary'/>
        <div className='w-full space-y-1'>
          <h1 className='font-semibold'>Finaliser la presentation du projet</h1>
          <div className='flex justify-between'>
            <Badge className='bg-primary/20 text-black dark:text-white rounded-full'>E-commerce app</Badge>
            <span className='text-sm text-muted-foreground'>3 juin 2023</span>
          </div>
        </div>
      </div>
      <div className='absolute size-8 flex flex-col justify-center items-center rounded-full -right-2 -top-2 bg-destructive'>
        <AlertCircle className='size-6 text-background'/>
      </div>
    </div>
  )
}


function VirtualSpaceCardItem({member}:{member: User}){
  const avatar = createAvatar(glass,{
    seed: member.email
  });
  const svg = avatar.toDataUri()
  return (
    <div className='flex justify-between'>
      <div className='flex gap-2'>
        <div className='size-14 relative overflow-hidden shrink-0 rounded-full bg-primary'>
          <Image src={svg} alt={member.email} fill className='rounded-full'/>
        </div>
        <div>
          <h1 className='text-xl font-semibold'>{member.email}</h1>
          <p className='text-muted-foreground'>{member.email}</p>
        </div>
      </div>
      <div>
        <Badge variant={"secondary"} className={cn('rounded-full',member.role === "owner" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{member.role}</Badge>
      </div>
    </div>
  );
}

function VirtualSpaceCard(){
  const { membersActive,isLoading } = useActiveUsersWorkspaces();

  
  if(isLoading){
    return (
      <div className='w-full rounded-xl h-full bg-background shadow-lg  flex flex-col justify-center items-center'>
        <Loader/>
      </div>
    )
  }

  return (
    <div className='rounded-xl h-full bg-background shadow-lg'>
      <div className='flex p-4 justify-between h-16 overflow-hidden items-enter'>
        <div>
          <h1 className='font-bold text-xl'>Espace virtuel</h1>
          <p className='text-muted-foreground'>Membres actuellement connectés</p>
        </div>
        <div className='relative size-24'>
          <Image 
            src={"/icons/virtual.svg"}
            alt='/icons/virtual.svg'
            fill
            className='-translate-y-6'
            />
        </div>
      </div>
      {membersActive && <div className='relative rounded-xl m-4 overflow-hidden'>
      <div className="pointer-events-none z-10 absolute inset-x-0 top-0 h-[6%] bg-gradient-to-b from-background"/>
        <ScrollArea className='h-72 '>
          <div className='space-y-4 m-4'>
            {membersActive?.map((member,index)=>(
              <VirtualSpaceCardItem key={index} member={member}/>
            ))}
          </div>
        </ScrollArea>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-t from-background"/>
      </div>}
      {membersActive?.length === 0 && (
        <div className='flex flex-col items-center justify-center h-72'>
          <Image 
            src={"/icons/empty.svg"}
            alt='/icons/empty.svg'
            width={100}
            height={100}
          />
          <p className='text-muted-foreground'>Aucun membre en ligne</p>
        </div>
      )}
    </div>
  )
}