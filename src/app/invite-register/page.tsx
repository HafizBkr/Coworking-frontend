import React from 'react'
import { InviteSignUpForm } from './_components/invite-signup-form'

export default function InvitationRegisterPage() {
  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
      <InviteSignUpForm/>
    </section>
  )
}
