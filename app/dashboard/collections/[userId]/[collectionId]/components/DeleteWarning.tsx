import { motion } from 'framer-motion'
import React from 'react'

type Props = {
    isWarningVisible:Function,
    handleDelete:Function,
    collection:collection | undefined
}

export default function DeleteWarning({isWarningVisible,handleDelete,collection}:Props) {
  return (
    <div className='bg-black bg-opacity-25 backdrop-blur-sm fixed inset-0 flex justify-center items-center w-screen h-screen z-50'>
        <div className='w-full h-full flex items-center justify-center'>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className='w-[300px] bg-white rounded flex flex-col items-center justify-center p-5 gap-3'
                >
                <p className='text-2xl font-bold'>Are you sure?</p>
                <div className='flex gap-5'>
                    <button 
                        onClick={()=>handleDelete(collection)} 
                        className='bg-slate-200 px-8 rounded-xl text-black'
                        >
                        Yes
                    </button>
                    <button 
                        onClick={()=>isWarningVisible(false)} 
                        className='bg-white px-5 rounded-xl text-black border'
                        >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    </div>
  )
}
