import React from 'react'
import { OTPPasswordForm } from './_components/otp-password-form'

export default function page() {
  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
      <OTPPasswordForm/>
    </section>
  )
}
