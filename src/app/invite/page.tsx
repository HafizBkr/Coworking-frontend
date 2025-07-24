import React from 'react'
import { acceptInvitation } from './_services/invite.service'
import { routes } from '@/config/routes';
import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const token = (await searchParams).token
  const res = await acceptInvitation(token?.toString()||"");
  if(res.success){
    redirect(routes.auth.signin)
  }

  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
      <div className='p-4 bg-white shadow text-red-700 border text-center'>
        {res.message}
      </div>
    </section>
  )
}
