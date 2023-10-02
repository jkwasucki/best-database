'use client'
import React, { useEffect, useState } from 'react'
import { MdMovie } from 'react-icons/md'
import {ImFileText2} from 'react-icons/im'
import {MdInsertPhoto} from 'react-icons/md'
import {AiFillPlayCircle} from 'react-icons/ai'
import{BsFileEarmarkMusicFill, BsFileEarmarkText} from 'react-icons/bs'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { referenceFile } from '@/redux/fileSlice'
import LoaderSVG from './svgs/LoaderSVG'
import axios from 'axios'
import { RootState } from '@/redux/store'
import { useRouter } from 'next/navigation'




type Props = {
  promise:Promise<mongoFileRef[]>,
}

export default function File({promise}:Props) {
    const dispatch = useDispatch()
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const router = useRouter()


    const [fileData,setFileData] = useState<mongoFileRef[]>()

    //Catch files promise
    useEffect(()=>{
      async function catchFiles(){
        const fileData = await promise
        setFileData(fileData)
      }
     catchFiles()
    },[promise])

    async function handleRedirect(file:mongoFileRef){
      const extractedCollectionId = file.fullPath.match(/col\+(.*?)\//)!;
      const insideCollection = await axios.get(`/api/user/collections/${session._id}/${extractedCollectionId[1]}`)
      router.push(`/dashboard/collections/${session?._id}/${insideCollection.data._id}`)
      dispatch(referenceFile({file:file,for:"scrollInView"}))
    }

    function handleIcons(file:mongoFileRef){
      switch(file.type){
          case "text":
              return <BsFileEarmarkText size={20}/>
          case "video":
              return <MdMovie className='text-red-700' size={20}/>
          case "image":
              return <MdInsertPhoto className='text-blue-700' size={20}/>
          case "audio":
              return <BsFileEarmarkMusicFill className='text-blue-600' size={20}/>
          case "application":
              return <BsFileEarmarkText size={20}/>
      }
    }

  return (
    <>
    {fileData && fileData?.length === 0 &&
      <div className='w-full h-full flex justify-center items-center text-center'>
        <p className='text-black opacity-50'>Upload files to see their previews.</p>
      </div> 
    }
    {fileData ? fileData.map(file=>{
        return (
          <div 
            onClick={()=>handleRedirect(file)} 
            key={file._id} 
            className='h-[150px] sm:h-[180px] select-none bg-slate-200 hover:bg-slate-300 rounded-xl py-4 px-2 flex flex-col gap-4 max-w-[250px] w-[250px] '
            >
            <div className='relative flex items-center justify-between gap-3 '>
              <div className='flex gap-3 items-center'>
                  {handleIcons(file)}
                  <p className='sm:max-w-[150px] w-[100px] truncate'>{file.name}</p>
              </div>
            </div>
            <div className='relative w-[230px] h-[200px] rounded-md flex items-center justify-center'>
              {file.type === 'audio' && 
                <>
                  <div className='absolute w-full h-full bg-white flex items-center justify-center'>
                      <BsFileEarmarkMusicFill size={40} className='text-blue-500'/>
                  </div>
                </>
              }
              {file.type === 'text' || file.type === 'application' && 
                <>
                  <div className='absolute w-full h-full bg-white flex items-center justify-center'>
                    <ImFileText2 size={40} className='opacity-50' />
                  </div>
                </>
              }
              {file.type === 'image' &&  
                <Image
                  src={file.url}
                  fill
                  objectFit='cover' 
                  alt="file"
                />
              }
              {file.type === 'video' &&  
                <>
                  <div className='absolute bg-slate-800 opacity-[0.6] w-full h-full flex items-center justify-center'/>
                  <AiFillPlayCircle 
                    size={50} 
                    className='absolute text-white z-10'
                  />
                  <video className='absolute w-full h-full object-cover'>
                    <source 
                      src={file.url} 
                      type='video/mp4'
                 
                    />
                    Your browser does not support the video tag.
                  </video>
                </>
              }
            </div>
          </div>
          )
        })
        : 
        <LoaderSVG size={50}/>
        }
       
    </>
  )
}
