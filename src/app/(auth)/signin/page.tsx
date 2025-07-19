/* eslint-disable react/react-in-jsx-scope */
import { SigninForm } from "./_components/signin-form";

export default function SignInPage() {
  return (
    <section  className='min-h-screen p-8 relative w-full flex bg-gradient-to-b from-primary to-primary/20 justify-center items-center'>
      <SigninForm/>
    </section>
  )
}

