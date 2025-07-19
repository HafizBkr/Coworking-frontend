import React from 'react'
import { SignUpForm } from './_components/signup-form'

export default function SignUpPage() {
  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
      <SignUpForm/>
    </section>
  )
}
