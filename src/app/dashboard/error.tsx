/* eslint-disable react/react-in-jsx-scope */
'use client' // Error boundaries must be Client Components
 
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <section className='w-full h-full flex flex-col gap-4 justify-center items-center'>
      <div>
        <h2 className='text-2xl font-bold text-center'>Une erreur s&apos;est produite !</h2>
      </div>
      <p className='text-muted-foreground'>{error.message}</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Recommencer
      </Button>
    </section>
  )
}