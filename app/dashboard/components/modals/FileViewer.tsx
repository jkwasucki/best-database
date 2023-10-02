// TODO: Add doc extension compabibility

import { RootState } from '@/redux/store'
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineDownload, AiOutlineEdit } from 'react-icons/ai'
import {BiArrowBack} from 'react-icons/bi'
import { MdInsertPhoto } from 'react-icons/md'
import { SlOptionsVertical } from 'react-icons/sl'
import { useSelector } from 'react-redux'
import {handleDownload} from '@/utils/functions'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { referenceFile, setName } from '@/redux/fileSlice'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import ImageContent from '../fileTypes/ImageContent'
import VideoContent from '../fileTypes/VideoContent'
import AudioContent from '../fileTypes/AudioContent'
import TextContent from '../fileTypes/TextContent'
import LoaderSVG from '../svgs/LoaderSVG'
import { motion } from 'framer-motion'

type Props = {
    isfileViewerVisible:Function,
    refetchFilesRef?:Function,
    promise?:Promise<mongoFileRef[]>
}

export default function FileViewer({isfileViewerVisible,refetchFilesRef,promise}:Props) {
    const refetch = refetchFilesRef
    const dispatch = useDispatch()

    //Catch files promise
    useEffect(()=>{
        async function catchFiles(){
            const files = await promise
            setFiles(files!)
        }
        catchFiles()
    },[promise])

    
    const referencedFile:mongoFileRef = useSelector((state:RootState)=>state.fileReducer.file)
    const referencedFileF = useSelector((state:RootState)=>state.fileReducer.for)
    const [files,setFiles] = useState<mongoFileRef[] | null>(null)
    const [currentIndex,setCurrentIndex] = useState<number | null>(null)

    const collectionId = useSelector((state:RootState)=> state.collectionReducer.collection.collectionId)
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)

    const [editName,setEditName] = useState(false)
    const [newName, setNewName] = useState("")
    const [extendOptions,setExtendOptions] = useState(false)

    //When file reference initially mounts, it checks its index 
    //in an array of files (mongoFileRef[]).
    //When new files are getting referenced through arrow keys,
    //useEffect is getting triggered and performs index check again,
    //now for the newly referenced file.
    useEffect(()=>{ 
        if (referencedFile && files) {
            const index = files.findIndex((f: mongoFileRef) => f._id === referencedFile._id);
            if (index !== currentIndex) {
                setCurrentIndex(index);
            }
        }
    },[referencedFile,files])

    //This function references a new file while arrows are pressed.
    //Dispatchers are using index of the file that is currently previewed, in an array of files.

    //Nothing gets dispatched if files.length is 1.
    
    let keyPressed = false
    function handleArrowPress(e:KeyboardEvent) {
        if(keyPressed){
            return
        }

        keyPressed = true
        
            switch(e.key){
                case "ArrowLeft":
                    if(currentIndex === 0){
                        dispatch(referenceFile({file:files?.[files.length - 1],for:"fileViewer"}))
                        break
                    }else if (files?.length !== 1) { // Check if files.length is not equal to 1
                        dispatch(referenceFile({file:files?.[currentIndex! - 1],for:"fileViewer"}));
                        break;
                    }
                case "ArrowRight":
                    if(currentIndex === files?.length! - 1){
                        dispatch(referenceFile({file:files?.[0],for:"fileViewer"}))
                        break
                    }else if (files?.length !== 1) { // Check if files.length is not equal to 1
                        dispatch(referenceFile({file:files?.[currentIndex! + 1],for:"fileViewer"}));
                        break;
                    }
            }
            keyPressed = false
       
       
       
    }

    function handleArrowClick(direction:string){
       if(direction ===  "ArrowLeft"){
            if(currentIndex === 0){
                dispatch(referenceFile({file:files?.[files.length - 1],for:"fileViewer"}))
            }else if (files?.length !== 1) { // Check if files.length is not equal to 1
                dispatch(referenceFile({file:files?.[currentIndex! - 1],for:"fileViewer"}));
            }
       }else{
            if(currentIndex === files?.length! - 1){
                dispatch(referenceFile({file:files?.[0],for:"fileViewer"}))
            }else if (files?.length !== 1) { // Check if files.length is not equal to 1
                dispatch(referenceFile({file:files?.[currentIndex! + 1],for:"fileViewer"}));
            }
       } 
    }

    // If there are no files it means that FileViewer is opened in search results
    // page, where its not allowed to switch files from one to another when in FileViewer.
    if (files === null || files === undefined) {
        document.removeEventListener("keydown", handleArrowPress);
    } else {
        document.addEventListener("keydown", handleArrowPress);
    }

    //Closes options tab when name edit is initialized.
    useEffect(() => {
      setExtendOptions(false)
    }, [editName])

   
    async function handleName(file:mongoFileRef){
        try {
            await axios.post(`/api/user/renameFile/${session._id}/${collectionId}`,{
                newName: newName,
                fileId: file._id
            })
            refetch!(true)
            const extension = file.name.split(".").pop()
            //File reference (fileSlice.ts)
            dispatch(setName({name:newName + "." + extension}))

            setEditName(false)
        } catch (error) {
            console.log(error)
        }
    }
   
 
  return (
    <div className='fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col w-screen h-screen'>
        {editName && files &&
            <div className='p-3 sm:p-0 absolute flex inset-0 items-center justify-center z-50'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.2, ease: "easeOut" }} 
                    className='flex flex-col w-[400px] h-[200px] bg-neutral-900 text-white p-8 gap-5 rounded shadow-md'
                    >
                    <p className='text-2xl'>Edit file name</p>
                    <input 
                        onChange={(e)=>setNewName(e.target.value)} 
                        type='text' 
                        className='outline-none bg-transparent border-2 border-blue-300 text-white text-xl rounded h-11 w-full px-2 underline-none' 
                        placeholder={referencedFile?.name.split('.').shift()}
                    />
                    <div className='flex justify-center'>
                        <div className='flex items-center gap-5'>
                            <button 
                                onClick={()=>setEditName(false)} 
                                className='hover:bg-neutral-700 px-[20px] rounded-xl'
                                >
                                Cancel
                            </button>
                            <button 
                                onClick={()=>handleName(referencedFile)} 
                                className='hover:bg-neutral-700 px-[35px] rounded-xl'
                                >
                                OK
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        }
        <div className='relative w-full flex items-center justify-between p-6 z-50'>
            <div className='flex items-center gap-5 text-xl'>
                <BiArrowBack 
                    onClick={()=>isfileViewerVisible(false)} 
                    size={30} 
                    className='text-white cursor-pointer'
                />
                <div 
                    onClick={()=>setEditName(true)} 
                    className='flex items-center gap-2 cursor-pointer'
                    >
                    <MdInsertPhoto className='text-blue-700' size={30}/>
                    <p className='text-white max-w-[140px] truncate'>{referencedFile?.name}</p>
                </div>
            </div>
            {files &&
                <SlOptionsVertical 
                    onClick={()=>setExtendOptions(!extendOptions)} 
                    size={20} 
                    className='text-white cursor-pointer'
                />    
            }       
            {extendOptions &&
                <div className='absolute right-6 top-[60px] bg-neutral-900 w-[300px]  rounded-md py-2'>
                    <div className='flex flex-col text-white text-xl'>
                        <div 
                            onClick={()=>handleDownload(referencedFile).then(()=>setExtendOptions(false))} 
                            className='flex items-center gap-3 px-5 cursor-pointer hover:bg-neutral-800'
                            >
                            <AiOutlineDownload/>
                            <p className='py-1'>Download file</p>
                        </div>
                        <div className='flex items-center gap-3 px-5 cursor-pointer hover:bg-neutral-800  '>
                            <AiOutlineEdit/>
                            <p onClick={()=>setEditName(true)} className='py-1'>Edit file name</p>
                        </div>
                    </div>
                </div>
            }
        </div>

        {/* Actual file display depending on its mime type. */}
        {referencedFile?.url ? (
            <>
                {referencedFile.type === 'image' && <ImageContent file={referencedFile} />}
                {referencedFile.type === 'video' && <VideoContent file={referencedFile} />}
                {referencedFile.type === 'audio' && <AudioContent file={referencedFile} />}
                {['text', 'application'].includes(referencedFile.type!) && <TextContent file={referencedFile} />}
            </>
        ):
            <LoaderSVG size={100}/>
        }
        
       {files && 
        <>
            <div onClick={()=>handleArrowClick('ArrowLeft')} className='fixed left-0 top-1/2 z-50'>
                <IoIosArrowBack size={30} className='rounded-full w-max hover:bg-neutral-600 cursor-pointer text-white'/>
            </div>
            <div onClick={()=>handleArrowClick('ArrowRight')} className='fixed right-0 top-1/2 z-50'>
                <IoIosArrowForward size={30} className='rounded-full w-max hover:bg-neutral-600 cursor-pointer text-white'/>
            </div>
        </>
        }
    </div>
  ) 
}
