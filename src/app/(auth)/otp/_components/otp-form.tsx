"use client";
import { Button } from '@/components/ui/button'
import React, { useState ,useTransition } from 'react'
import { OTPInput, SlotProps } from "input-otp"
import { cn } from '@/lib/utils'
import { verifcationOTP } from '../_services/otp.service';
import { toast } from 'sonner';
import { routes } from '@/config/routes';
import { redirect } from 'next/navigation';
import { FieldError } from '@/components/customs/field-error';
import { useEmailStore } from '@/stores/email.store';
import { Input } from '@/components/ui/input';
import { resendOTP } from '../_services/resend-otp.service';

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]",
        { "border-ring ring-ring/50 z-10 ring-[3px]": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  )
}

export function OTPForm() {
  const [isPending, startTransition] = useTransition();
  const [isPendingCode, startTransitionCode] = useTransition();
  const { email, clearEmail } = useEmailStore();
  const [errors, setErrors] = useState<{[key: string]: string[] | undefined}>({});

  async function handleVerifiactionOTP(formData:FormData){
    startTransition(async () =>{
      const response = await verifcationOTP(formData);
      console.log({ response, errors: response.errors, error: response.error})
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }

      
      if(response.success){
        clearEmail()
        redirect(routes.auth.signin)
      }

    })
  }

  async function handleResendOTP(formData:FormData){
    startTransitionCode(async () =>{
      const response = await resendOTP(formData);
      console.log({ errors: response.errors, error: response.error})
      // console.log(response)
      if(!response.success && !response.errors ){
        toast.error(response.message)
      }

      if(!response.success && response.errors ){
        setErrors(response.errors)
      }

      
      if(response.success){
        toast.success(response.message)
      }

    })
  }

  return (
    <div className='max-w-sm flex flex-col gap-4 items-center w-full bg-background rounded-xl shadow-xl  p-8'>
    <div className='flex flex-col items-center gap-2'>
      <div className='flex gap-2'>
        <h1 className={`text-2xl font-bold text-center `}>Comfirmation de votre email</h1>
      </div>
      <p className='text-muted-foreground text-center text-sm'>Entrer le code OTP qui a ete envoyé a votre e-mail <br /> pour vous continuer.</p>
    </div>
    <form action={handleVerifiactionOTP} className='space-y-4'>
      <OTPInput
        name='code'
        containerClassName="flex items-center gap-3 has-disabled:opacity-50"
        maxLength={6}
        render={({ slots }) => (
          <div className="flex gap-2">
            {slots.map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        )}
      />
      <FieldError message={errors.code?.[0]}/>
      <Input type='hidden' name='email' value={email||"tchandikouujashalom@gmail.com"}/>
      <Button type='submit' loading={isPending} className='w-full'>Continuer</Button>
    </form>
    <form action={handleResendOTP}>
      <Input type='hidden' name='email' value={"tchandikouujashalom@gmail.com"}/>
      <Button loading={isPendingCode} variant={"outline"} className='w-full'>Renvoyer le code</Button>  
    </form>
  </div>
  )
}
