"use client";
import { useWorkspaceStore } from '@/stores/workspace.store';
import React from 'react'
import { useWorkspaces } from '../_hooks/use-workspaces';
import DashboardSection from './dashboard-section';
import { Loader } from '@/components/customs/loader';
import Image from 'next/image';

export function HomeSection() {
    const { currentWorkspace } = useWorkspaceStore();
    const { isLoading }= useWorkspaces();

    if(currentWorkspace && !isLoading){
        return (
            <DashboardSection/>
        )
    }

    return (
    <div className='flex flex-col min-h-[calc(100svh-14rem)] items-center justify-center gap-4'>
        { isLoading ?  
            <Loader/> : 
            <div className='flex flex-col justify-center items-center gap-4'>
                <div className='relative w-full h-60 overflow-hidden'>
                    <Image
                        src={"/icons/select-w.svg"}
                        alt={"/icons/select-w.svg"}
                        fill
                        className='object-cover'
                    />
                </div>
                <h1 className='text-xl text-center text-muted-foreground'>Veuillez sectionner le workspace qui vous convient </h1>
            </div>
        }
    </div>
    )
}
