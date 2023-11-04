import React from 'react'
import PrismaZoom from 'react-prismazoom'
import Image from 'next/image'

type Props = {
    file:mongoFileRef,

}

export default function ImageContent({file}:Props) {
  return (
    <div className='fixed w-screen min-h-screen flex items-center justify-center z-40'>
        <PrismaZoom maxZoom={2}>
            <div className='relative shadow-xl shadow-neutral-900'>
                <Image
                    width={file.naturalWidth ? Number(file?.naturalWidth) : 1000}
                    height={file.naturalHeight ? Number(file?.naturalHeight) : 1000}
                    alt="file"
                    src={file?.url}
                    className='max-h-[700px] max-w-[900px] w-full h-full'
                />
                {/* {editName && <div className='absolute bg-black bg-opacity-60 w-full h-full inset-0'/>} */}
            </div>
        </PrismaZoom>
    </div>
  )
}
