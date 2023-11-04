'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import {SiAiqfome} from 'react-icons/si'
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
    <div className='min-w-full min-h-screen flex flex-col items-center justify-center bg-white gap-5 text-black'>
        <div className='flex flex-col items-center gap-2'>
            <SiAiqfome size={55}/>
            <p className='font-semibold'>Something went wrong...</p>
        </div>
        <div className='flex flex-col items-center gap-3'>
            <h2 className='text-xl'>Not the best place to end up, eh?</h2>
        </div>
    </div>
  )
}