import { storage } from '@/lib/firebase'
import axios from 'axios'
import { deleteObject, listAll, ref } from 'firebase/storage'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineCheck, AiOutlineClose, AiOutlineSound } from 'react-icons/ai'
import { SlOptionsVertical } from 'react-icons/sl'
import DeleteWarning from './DeleteWarning'
import {FcShare} from 'react-icons/fc'
import { useDispatch, useSelector } from 'react-redux'
import { createAlert } from '@/redux/alertSlice'
import { RootState } from '@/redux/store'
import { IoVolumeMuteOutline } from 'react-icons/io5'


type Props = {
    promise:Promise<collection>,
    refetchColRef:Function,
    isFinderVisible:Function,
    isManageAccessVisible:Function
}

export default function ColSettings({promise,refetchColRef,isFinderVisible,isManageAccessVisible}:Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const accessData = useSelector((state:RootState)=>state.collectionReducer.collection.accessData)
    const owner = useSelector((state:RootState)=>state.collectionReducer.collection.owner)
    const refetch = refetchColRef
    const router = useRouter()
    const dispatch = useDispatch()
    
    const [collection,setCollection] = useState<collection>()
    const [newName,setNewName] = useState("")
    const [colOptions,setColOptions] = useState(false)
    const [colNameEdit,setColNameEdit] = useState(false)
    const [isWarningVisible,setIsWarningVisible] = useState(false)
    const [colMuted,setColMuted] = useState(false)
    //tooltip
    const [shareInfo,setShareInfo] = useState(false)

    //PERMISSION CHECKERS
    //1.1
    function editAccesCheck(){
        if(owner?.isOwner || accessData?.canRename){
            setColNameEdit(true)
            setColOptions(false)
        }else{
            dispatch(createAlert(
                {type:"warning",text:"Access denied."}
            ))
        }
    }
    
    
    //MODAL 3
    function handleWarning(status:boolean){
        if(status) setIsWarningVisible(true)
        if(!status) setIsWarningVisible(false)
    }

    async function handleName(){
        try {
          await axios.patch(`/api/user/collections/${session?._id}/${collection?._id}`,{newName:newName})
          setColNameEdit(false)
          collection!.name = newName
          refetch(true)
        } catch (error) {
          console.log(error)
        }
    }

    async function handleRemoveCol(collection:collection){
        try {
            const res = await axios.delete(`/api/user/collections/${session?._id}/${collection._id}`)
        
            const collectionRef =  ref(storage, `files/${session?._id}/col+${collection._id}`)
            const allRef = ref(storage, `files/${session?._id}/all`)
            const files = await listAll(collectionRef);
            const allFiles = await listAll(allRef)
        
            // Delete each file in the directory
            await Promise.all(files.items.map(async (fileRef) => {
                const filename = fileRef.name
            
                await deleteObject(fileRef);
            
                // Find and delete the file from allFiles if it exists
                const matchingAllFileRef = allFiles.items.find(allFileRef => allFileRef.name === filename);
                    
                if (matchingAllFileRef) {
                    await deleteObject(matchingAllFileRef)
                }
            }))
            router.push('/dashboard')
            dispatch(createAlert({type:'info',text:res.data}))
        } catch (error:any) {
        
        }
    }

    //FETCH COLLECTION FROM PASSED PROMISE
    useEffect(()=>{
        async function fetchCol(){
            const collection = await promise
            setCollection(collection)

            //Decide if collection is muted for icon reference.
            const mutedArray = await axios.get(`/api/user/getMutedCols/${session._id}`)
            if(mutedArray.data.includes(collection._id)){
                setColMuted(true)
            }else{
                setColMuted(false)
            }
        }
        fetchCol()
    },[])
    const containerInnerRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(()=>{
        const handleOutSideClick = (event:MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node) 
            && !containerInnerRef.current?.contains(event.target as Node)
        ) {
        setColOptions(false)
        }
        };

        window.addEventListener("mousedown", handleOutSideClick);

        return () => {
        window.removeEventListener("mousedown", handleOutSideClick);
        };
    },[containerRef,containerInnerRef])
    
    async function handleMuteCollection(action:string,userId:string,collectionId:string){
        await axios.post(`/api/user/handleNotifications/${session._id}`,{
            action:action,collectionId:collectionId
        })
        if(action === 'mute'){
            setColMuted(true)
        }else{
            setColMuted(false)
        }
    }

    return (
    <div className="relative flex items-center justify-between">
        {colNameEdit ? 
            <div className="flex gap-2">
                <input 
                    type='text'
                    value={newName} 
                    onChange={(e)=>setNewName(e.target.value)} 
                    className="outline-none border border-black px-2 text-black" 
                    placeholder="Enter a new name here."
                /> 
                <AiOutlineCheck 
                    onClick={handleName} size={20} 
                    className='hover:text-green-500'
                />
                <AiOutlineClose 
                    onClick={()=>setColNameEdit(false)} 
                    size={20} 
                    className='hover:text-red-500'
                />
            </div>
            :
            <div className="relative flex items-center gap-3 min-w-max">
                <div>
                    <div className='flex items-center gap-3'>
                        <div className='group'>
                            <h1 className="grouptext-black text-xl group cursor-pointer">{collection && collection?.name}</h1>
                            <p className='group-hover:block hidden absolute rounded-xl shadow-xl bg-white px-2'>Name</p>
                        </div>
                        {colMuted ? 
                            <IoVolumeMuteOutline 
                                onClick={()=>handleMuteCollection("unmute",session._id,collection!._id)} 
                                size={20} 
                                className='cursor-pointer'
                            /> 
                            :
                            <AiOutlineSound 
                                size={20}
                                onClick={()=>handleMuteCollection("mute",session._id,collection!._id)} 
                                className='cursor-pointer'
                            />
                        }
                    </div>
                    {shareInfo && 
                        <p className='bg-white shadow absolute left-[50px] min-w-max rounded-xl px-2'>
                            Shared to you by: 
                            <span className='font-semibold'> {owner?.user?.email}</span>
                        </p>
                    }
                    <p className='absolute group-hover:block hidden px-2 shadow w-max flex justify-center bg-white rounded-xl z-10'>Collection name</p>
                </div>
                {!owner?.isOwner && 
                    <FcShare 
                        size={20} 
                        onMouseEnter={()=>setShareInfo(true)} 
                        onMouseLeave={()=>setShareInfo(false)} 
                        className='cursor-pointer' 
                    />
                }
                
            </div>
        }
        <div 
            ref={containerRef}  
            onClick={()=>setColOptions(!colOptions)} 
            >
            <SlOptionsVertical 
                size={20} 
                className='cursor-pointer group' 
            />
        </div>
        {colOptions && 
            <div 
                ref={containerInnerRef}
                className="absolute right-8 sm:right-8 w-[150px] shadow gap-3 select-none border bg-white rounded py-2 z-10"
                >
                <p 
                    onClick={editAccesCheck} 
                    className="hover:bg-slate-100 cursor-pointer w-full h-full"
                    >
                    Edit name
                </p>
                {owner?.isOwner && 
                    <>
                        <p 
                            onClick={()=>isFinderVisible(true)} 
                            className="hover:bg-slate-100 cursor-pointer w-full h-full"
                            >
                            Share collection
                        </p>
                        <p 
                            onClick={()=>isManageAccessVisible(true)} 
                            className="hover:bg-slate-100 cursor-pointer w-full h-full"
                            >
                            Manage access
                        </p>
                        <p 
                            onClick={()=>setIsWarningVisible(true)} 
                            className="hover:bg-slate-100 cursor-pointer w-full h-full text-red-600"
                            >
                            Delete collection
                        </p>
                    </>
                }
            </div>
        }
        {isWarningVisible &&
            <DeleteWarning 
                handleDelete={handleRemoveCol} 
                isWarningVisible={handleWarning}
                collection={collection}
            />
        }
    </div>
  )
}
