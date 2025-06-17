import React from 'react'
import { ForgotPasswordForm } from './_components/forgot-password-form'

export default function ForgotPassword() {
  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
        <ForgotPasswordForm/>
    </section>
  )
}
