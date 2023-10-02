import React, { useEffect, useRef, useState } from 'react'
import { SlOptions } from 'react-icons/sl'
import { createAlert } from '@/redux/alertSlice'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import  { handleDelete,handleDownload } from '@/utils/functions'
import { referenceFile } from '@/redux/fileSlice'
import {VscFiles} from 'react-icons/vsc'
import { MdInsertPhoto, MdMovie } from 'react-icons/md'
import { BsFileEarmarkMusicFill, BsFileEarmarkText } from 'react-icons/bs'
import { motion } from 'framer-motion'

type Props = {
    promise:Promise<mongoFileRef[]>
    refetchFilesRef:Function,
    isfileViewerVisible:Function
}


export default function Files({promise,refetchFilesRef,isfileViewerVisible}:Props) {
    const referencedFile = useSelector((state:RootState)=>state.fileReducer.file)
    const referencedFileFor = useSelector((state:RootState)=>state.fileReducer.for)
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const owner = useSelector((state:RootState)=>state.collectionReducer.collection.owner)
    const collectionId = useSelector((state:RootState)=>state.collectionReducer.collection.collectionId)
    const accessData = useSelector((state:RootState)=>state.collectionReducer.collection.accessData)
  
    const targetFileRef = useRef(null);
    const dispatch = useDispatch()
    const refetch = refetchFilesRef

    const [files,setFiles] = useState<mongoFileRef[]>()
    const [fileOptions,setFileOptions] = useState({
        status:false,
        _id:""
    })
    const [componentReRender, setComponentReRender] = useState(0)
    
    function handleComponentReRender(){
      setComponentReRender(componentReRender + 1)
    }

    function handleViewer(file:mongoFileRef){
        dispatch(referenceFile({file:file,for:"fileViewer"}))
        isfileViewerVisible(true)
    }
    //PERMISSION CHECKERS
    //1.1
    function deleteAccessCheck(file:mongoFileRef){
      if(owner.isOwner || accessData.canDelete){
     
        handleDelete(file,session._id,collectionId).then(()=>{
            refetch(true)
            setFileOptions((prev) => ({ ...prev, status: false, _id: "" }))
            handleComponentReRender()
        })
      }else{
        dispatch(createAlert(
          {type:"warning",text:"Access denied."}
        ))
      }
    }
    //1.2
    function downloadAccessCheck(file:mongoFileRef){
      if(owner.isOwner || accessData.canDownload){
        handleDownload(file)
      }else{
        dispatch(createAlert(
          {type:"warning",text:"Access denied."}
        ))
      }
    }
  
    //Catch passed files promise
    useEffect(() => {
      async function catchFiles() {
        const files = await promise;
        setFiles(files);
      }
      catchFiles();
    }, [promise]);
      
    //Handle file icons
    function handleIcons(file:mongoFileRef){
      switch(file.type){
          case "text":
              return <BsFileEarmarkText className='min-w-[20px]' size={20}/>
          case "video":
              return <MdMovie className='text-red-700 min-w-[20px]' size={20}/>
          case "image":
              return <MdInsertPhoto className='text-blue-700 min-w-[20px]' size={20}/>
          case "audio":
              return <BsFileEarmarkMusicFill className='text-red-700 min-w-[20px]' size={20}/>
          case "application":
              return <BsFileEarmarkText className='min-w-[20px]' size={20}/>
      }
    }

    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(()=>{
        const handleOutSideClick = (event:MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
        setFileOptions((prev)=>({...prev,status:false,_id:""}))
        }
        };

        window.addEventListener("mousedown", handleOutSideClick);

        return () => {
        window.removeEventListener("mousedown", handleOutSideClick);
        };
    },[containerRef])

    //Highlight referenced file 
    useEffect(() => {
        if(referencedFileFor === 'scrollInView'){
            const file = files?.find((file) => file._id === referencedFile._id);
            if (file && targetFileRef.current) {
                // Scroll to the target file element
                (targetFileRef.current as HTMLElement).scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [files, referencedFileFor]);


return (
    <div className='overflow-y-auto w-full h-full pt-5'>
        {files?.length! > 0 ? (
        files!.map((file) => (
            <div
                className='relative flex items-center'
                ref={referencedFileFor === 'scrollInView' && file._id === referencedFile._id ? targetFileRef : null}
                key={file._id}
                >
                {fileOptions._id === file._id && fileOptions.status && (
                    <div
                        className="absolute py-2 right-11 shadow border bg-white z-20 sm:w-[150px] rounded-xl"
                    >
                        <p
                            onClick={() => downloadAccessCheck(file)}
                            className="hover:bg-slate-100"
                        >
                            Download
                        </p>
                        <p
                            onClick={() => deleteAccessCheck(file)}
                            className="hover:bg-slate-100"
                        >
                            Delete
                        </p>
                    </div>
                )}
                <div className={`${referencedFileFor === 'scrollInView' && referencedFile._id === file._id && 'bg-blue-100'} relative w-full flex justify-between items-center h-[80px] sm:h-12 px-4 border-l-transparent border-r-transparent border-t-black border-b-black hover:bg-neutral-100 rounded-xl cursor-pointer`}>
                    <div onClick={() => handleViewer(file)} className="flex items-center gap-1 w-1/3">
                        {handleIcons(file)}
                        <p className="sm:max-w-[300px] max-w-[100px] truncate">{file.name}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 sm:w-1/3 w-2/3">
                        <p className="sm:font-bold text-sm sm:block hidden">Uploaded at: </p>
                        <p className='text-sm sm:text-md'>{new Date(file.createdAt).toLocaleString().split(',').shift()}</p>
                    </div>
                    <div
                        ref={containerRef} 
                        className="relative w-1/3 flex justify-end"
                        >
                        <SlOptions
                            onClick={() =>
                                setFileOptions((prev) => ({
                                ...prev,
                                status: !prev.status,
                                _id: file._id,
                                }))
                            }
                        />
                    </div>
                </div>
            </div>
        ))
        ) : (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full flex items-center justify-center p-12 gap-5'
            >
                <p>This collection is empty.</p>
                <VscFiles size={55}/>
        </motion.div>
        )}
    </div>
)
}
