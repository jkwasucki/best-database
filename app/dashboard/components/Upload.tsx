'use client'
import React, { useEffect, useRef,useState } from 'react';
import { UploadMetadata, ref, uploadBytesResumable } from "firebase/storage";
import {AiOutlinePlus} from 'react-icons/ai'
import { IoMdArrowDropdown } from 'react-icons/io';
import { storage } from '@/lib/firebase';
import getCollections from '@/utils/getCollections';
import axios from 'axios';
import mime from 'mime-types'
import { BsFolder } from 'react-icons/bs';
import { createAlert } from '@/redux/alertSlice';
import { useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { fetchMetadata } from '@/utils/functions';
import { motion } from 'framer-motion';
import { TbReload } from 'react-icons/tb';



type Props = {
    refetchRef:Function,
}



export default function Upload ({refetchRef}:Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const owner = useSelector((state:RootState)=>state.collectionReducer.collection.owner)
    const collectionId = useSelector((state:RootState)=>state.collectionReducer.collection.collectionId)
    const accessData = useSelector((state:RootState)=>state.collectionReducer.collection.accessData)
    
    const dispatch = useDispatch()
    const refetch = refetchRef

    const [internalRefetch,setInternalRefetch] = useState(0)
    const [uploadProgress,setUploadProgress] = useState(0)
    
    function runInternalRefetch(){
        setInternalRefetch(internalRefetch + 1)
    }

    const [newColName,setNewColName] = useState("")
    const [colNameInit,setColNameInit] = useState(false)
    const [colId,setColId] = useState("")
    const [collections,setCollections] = useState<collection[]>([])
    const [button, setButton] = useState(false);
    

    function uploadAccessCheck(){
        //If we are inside a collection, check access.
        if(collectionId){
            if(owner.isOwner || accessData.canUpload){
                setButton(!button)
            }else{
                dispatch(createAlert(
                    {type:"warning",text:"Access denied."}
                ))
            }
        //If we are uploading from home page.
        }else{
            setButton(!button)
        }
    }
  
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    async function createCollection(){
        if(newColName.length >= 5){
            try {
                await axios.post(`/api/user/collections/${session?._id}`,{
                    "collection":newColName
                })
                refetch(true)
                runInternalRefetch()
            } catch (error:any) {
                //
            }
        }else{
            dispatch(createAlert({type:"warning",text:"Collection name must be at least 5 characters."}))
        }
        
    }

    const containerInnerRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    //Outside-container click
    useEffect(()=>{
        const handleOutSideClick = (event:MouseEvent) => {
            if (
                !containerRef.current?.contains(event.target as Node) 
                && !containerInnerRef.current?.contains(event.target as Node)
                ) {
                setButton(false)
                setColNameInit(false)
            }
        };

        window.addEventListener("mousedown", handleOutSideClick);

        return () => {
            window.removeEventListener("mousedown", handleOutSideClick);
        };
    },[containerRef,containerInnerRef])


    interface Dimensions {
        width: number;
        height: number;
    }
    
    const handleUpload = async () => {
      
        const selectedFile = fileInputRef.current!.files![0];
        const type = selectedFile.name.split('.').pop()
        const contentType = selectedFile.name.split('.').shift()

        if(contentType === 'image'){
            const image = new Image();
            image.src = URL.createObjectURL(selectedFile);
    
            const getImageDimensions = () => {
                return new Promise<Dimensions>((resolve) => {
                    image.onload = () => {
                        const naturalWidth = image.width;
                        const naturalHeight = image.height;
                        resolve({ width:naturalWidth, height:naturalHeight });
                    };
                });
            };
            const dimensions = await getImageDimensions()
            const metadata:UploadMetadata = {
                contentType: mime.lookup(type!) || undefined,
                customMetadata: {
                    'naturalWidth': dimensions.width.toString(),
                    'naturalHeight': dimensions.height.toString(),
                  }
            };
            setButton(false);
            const storageRef = ref(storage, `files/${session?._id}/col+${colId}/${selectedFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile, metadata);
      

            uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(progress);
                
                if(progress === 100){
                    setUploadProgress(0)
                }
            }, 
            (error) => {
                console.error('Upload error:', error);
            }, 
            async()=>{
                try{
                    const storageReference = ref(storage, `/files/${session._id}/col+${colId}/${selectedFile.name}`);
                    await fetchMetadata(storageReference,session._id,colId);
                    dispatch(createAlert({type:"info",text:"File has been uploaded."}))
                    refetch!(true)
                    setButton(false)
                }catch(error:any){
                    dispatch(createAlert({type:"warning",text:error.response.data}))
                }
            });
        }else{
            const metadata:UploadMetadata = {
                contentType: mime.lookup(type!) || undefined,
            };
            setButton(false);
            const storageRef = ref(storage, `files/${session?._id}/col+${colId}/${selectedFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile, metadata);
      

            uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setUploadProgress(progress);
                
                if(progress === 100){
                    setUploadProgress(0)
                }
              
            }, 
            (error) => {
                console.error('Upload error:', error);
            }, 
            async()=>{
                try{
                    const storageReference = ref(storage, `/files/${session._id}/col+${colId}/${selectedFile.name}`);
                    await fetchMetadata(storageReference,session._id,colId);
                    dispatch(createAlert({type:"info",text:"File has been uploaded."}))
                    refetch!(true)
                    setButton(false)
                }catch(error:any){
                    dispatch(createAlert({type:"warning",text:error.response.data}))
                }
            })
        } 
    }
    
    //Fetch avaiable collections (drop-down)
    useEffect(()=>{
        async function fetchCollections(){
            if(session?._id.length > 1){
                try {
                    const collectionData:Promise<collection[]> =  getCollections(session?._id)
                    const preCollections = await collectionData
                    const filteredCols = preCollections?.filter((col)=>col.owner === session?._id)
                    setCollections(filteredCols)
                   
                } catch (error:any) {
                    console.error(error)
                }
            }
        }
        fetchCollections()
    },[internalRefetch,session])

return (
    <div    
        className='relative'
        >
        <div
            ref={containerRef} 
            onClick={uploadAccessCheck}
            className='w-fit hover:bg-slate-100 rounded-[20px] px-2 flex flex-col items-center justify-center select-none'
            >
            <div className='flex items-center'>
                <p className='text-[30px] font-thin'>Upload files.</p>
                <IoMdArrowDropdown />
            </div>
            {/* Upload progress bar */}
           {uploadProgress > 0 &&
            <div className="relative mb-5 h-2 bg-gray-200 w-full rounded-xl">
                <div
                    className={`absolute bg-green-500 h-full rounded-xl transition-all`}
                    style={{ width: `${uploadProgress}%` }}
                    />
            </div>
            }
        </div>
        {button && 
            <motion.div 
                ref={containerInnerRef}
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.2, ease: "easeOut" }}
               
                className='absolute z-10 top-12 w-[200px] bg-white shadow-xl rounded-xl border p-2'
                >
                <input
                    type='file'
                    name='files'
                    id='files'
                    ref={fileInputRef}
                    multiple
                    className='hidden'
                    onChange={handleUpload}
                />
                <div className='flex justify-between items-center mr-2'>
                    <p className='mb-2'>Upload to:</p>
                    <TbReload onClick={()=>runInternalRefetch()} className='cursor-pointer'/>
                </div>
                <div className='gap-3 max-h-[190px] overflow-y-auto'>
                    {collections.length > 0 ? (
                        collections
                        .slice()
                        .sort((a, b) => {
                            if (a._id === collectionId) return -1; // "This collection" comes first
                            if (b._id === collectionId) return 1;  // "This collection" comes first
                            return a.name.localeCompare(b.name);  // Sort alphabetically by name
                        })
                        .map((col) => (
                            <label key={col._id} htmlFor='files' className='flex items-center gap-2 hover:bg-slate-100 w-full h-full cursor-pointer'>
                                <div 
                                    onClick={() => setColId(col._id)} 
                                    className={`${col._id === collectionId && 'bg-neutral-200'} flex items-center gap-3 w-full`}
                                    >
                                    <BsFolder size={20} />
                                    <p className='max-w-[150px] truncate'>
                                    {col._id === collectionId ? 
                                        <span className='font-semibold'>This collection</span> 
                                        : 
                                        col.name 
                                    }
                                    </p>
                                </div>
                            </label>
                        ))
                    ) : (
                        <div onClick={() => setColNameInit(true)} className='flex items-center gap-3'>
                        {colNameInit ? (
                            <div className='flex items-center gap-3'>
                            <AiOutlinePlus 
                                onClick={createCollection} 
                                className='cursor-pointer'
                            />
                            <input 
                                type='text' 
                                value={newColName} 
                                onChange={(e) => setNewColName(e.target.value)} 
                                className='w-2/3 outline-none'
                            /> 
                            </div>
                        ) : (
                            <div className='flex items-center gap-3 hover:bg-slate-100 cursor-pointer'>
                            <AiOutlinePlus className='cursor-pointer'/>
                            <p>New collection</p>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            </motion.div>
        }
    </div>
  );
}
