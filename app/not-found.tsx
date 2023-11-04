
import {SiAiqfome} from 'react-icons/si'
export default async function NotFound() {
  return (
    <div className='min-w-full min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-5'>
        <div className='flex flex-col items-center gap-2'>
            <SiAiqfome size={55}/>
            <p className='font-semibold'>404: Page not found</p>
        </div>
      <h2 className='text-2xl'>Couldn't find what you are looking for...</h2>
    </div>
  )
}

