import React, { useState } from 'react';
import { AiFillCloseCircle, AiOutlineUser } from 'react-icons/ai';
import { IoMdArrowDropdown } from 'react-icons/io';
import {HiAdjustments} from 'react-icons/hi'
import axios from 'axios';
import { createAlert } from '@/redux/alertSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { motion, useAnimation } from "framer-motion";


type Props = {
    isManageAccessVisible:Function,
    refetchColRef:Function
};

export default function ManageAcces({isManageAccessVisible,refetchColRef }: Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const collectionId = useSelector((state:RootState)=>state.collectionReducer.collection.collectionId)
    const partyData = useSelector((state:RootState)=>state.collectionReducer.collection.partyData)

    const refetch = refetchColRef
    const dispatch = useDispatch()


    const [toggle,setToggle] = useState({
        download:{
            isOn:false,
        },
        upload:{
            isOn:false
        },
        rename:{
            isOn:false
        },
        delete:{
            isOn:false
        }
    })

    const [extendOptions, setExtendOptions] = useState({
        status:false,
        id:""
    });

    const users = partyData.sharedWithUserObjects;
    const usersCount = partyData.sharedWithCount
    

   
    async function handleAccess(right:string,invitedId:string){
        try {
            await axios.post(`/api/user/collections/handleAccess/${session._id}/${collectionId}`,{
                invitedId:invitedId,
                right:right
            })

            
            if(right === 'download'){
                setToggle((prevToggle) => ({
                    ...prevToggle,
                    download: {
                      ...prevToggle.download,
                      isOn: !prevToggle.download.isOn,
                    },
                }));
                refetch(true)
            }else if(right === 'upload'){
                setToggle((prevToggle) => ({
                    ...prevToggle,
                    upload: {
                      ...prevToggle.upload,
                      isOn: !prevToggle.upload.isOn,
                    },
                }));
                refetch(true)
            }else if(right === 'rename'){
                setToggle((prevToggle) => ({
                    ...prevToggle,
                    rename: {
                      ...prevToggle.rename,
                      isOn: !prevToggle.rename.isOn,
                    },
                }));
                refetch(true)
            }else if(right === 'delete'){
                setToggle((prevToggle) => ({
                    ...prevToggle,
                    delete: {
                      ...prevToggle.delete,
                      isOn: !prevToggle.delete.isOn,
                    },
                }));
                refetch(true)
            }
            
        } catch (error) {
           console.log(error) 
        }
    }
    
    async function handleRevoke(invitedId:string){
        try {
            await axios.post(`/api/user/collections/revokeAccess/${session?._id}/${collectionId}`,{
                invitedId:invitedId
            })
            dispatch(createAlert({type:"info",text:"User has been removed."}))
            refetch(true)
        } catch (error:any) {
            dispatch(createAlert({type:"warning",text:error.response.data}))
        }
    }

    return (
        <div className='p-3 sm:p-0 bg-black bg-opacity-25 backdrop-blur-sm fixed inset-0 flex justify-center items-center w-screen h-screen z-50'>
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.2, ease: "easeOut" }} 
                className='w-full h-full flex justify-center items-center'
                >
                <div className='relative flex flex-col bg-white w-max sm:w-[400px] sm:max-h-[500px] sm:h-max p-5 gap-3 overflow-hidden rounded items-center'>
                    <p className='text-xl font-bold'>Access manager</p>
                    <AiFillCloseCircle
                        onClick={()=>isManageAccessVisible(false)}
                        className='text-red-500 absolute right-5 cursor-pointer'
                    />
                    {usersCount === 0 ?
                        <div className='flex flex-col items-center gap-5'>
                            <div className='bg-slate-100 p-3 rounded'>
                                <p>Share this collection to your friends.</p>
                                <p>Here you can manage what they can and can not do.</p>
                            </div>
                            <HiAdjustments size={80} className='opacity-[0.1]'/>
                        </div>
                        :
                        <div className='overflow-y-auto flex flex-col gap-3 w-[250px]'>
                            {users.map(user => {
                                return (
                                    <div key={user._id}
                                        >
                                        <div 
                                            className='flex flex-col items-center gap-5 bg-neutral-100 border py-2 px-2 rounded-xl cursor-pointer'
                                            onClick={() => setExtendOptions((prev)=>({...prev,status:!prev.status, id:user._id}))}  
                                            >
                                            <p>{user.email.split('@').shift()}</p>
                                            {extendOptions.id === user._id && (
                                            <motion.div 
                                            initial={{ opacity: 0, y: -20 }} // Initial opacity and position (above)
                                            animate={{ opacity: 1, y: 0 }} // Final opacity and position (normal)
                                            transition={{ duration: 0.2, ease: "easeOut" }} // Animation duration and easing
                                            className='flex flex-col w-[200px] gap-3'>
                                                <div className='flex justify-between'>
                                                    <p>Allow Delete:</p>
                                                    <div onClick={()=>handleAccess("delete",user._id)} className={` ${user.canDelete ? 'justify-end' : 'justify-start'}  w-[50px] bg-neutral-200 rounded-l-full rounded-r-full px-1 flex`} >
                                                        <motion.div className={`rounded-full w-6 h-6 flex ${user.canDelete ? 'bg-green-600' : 'bg-red-600'}`} layout transition={spring} />
                                                    </div>
                                                </div>
                                                <div className='flex gap-2 justify-between'>
                                                    <p>Allow Rename:</p>
                                                    <div onClick={()=>handleAccess("rename",user._id)} className={` ${user.canRename ? 'justify-end' : 'justify-start'}  w-[50px] bg-neutral-200 rounded-l-full rounded-r-full px-1 flex`} >
                                                        <motion.div className={`rounded-full w-6 h-6 flex ${user.canRename ? 'bg-green-600' : 'bg-red-600'}`} layout transition={spring} />
                                                    </div>
                                                </div>
                                                <div className='flex gap-2 justify-between'>
                                                    <p>Allow Download:</p>
                                                    <div onClick={()=>handleAccess("download",user._id)} className={`  ${user.canDownload ? 'justify-end' : 'justify-start'}  w-[50px] bg-neutral-200 rounded-l-full rounded-r-full px-1 flex`} >
                                                        <motion.div className={`rounded-full w-6 h-6 flex ${user.canDownload ? "bg-green-600" : "bg-red-600"}`} layout transition={spring} />
                                                    </div>
                                                </div>
                                                <div className='flex gap-2 justify-between'>
                                                    <p>Allow Upload:</p>
                                                    <div onClick={()=>handleAccess("upload",user._id)} className={` ${user.canUpload ? 'justify-end' : 'justify-start'}  w-[50px] bg-neutral-200 rounded-l-full rounded-r-full px-1 flex`} >
                                                        <motion.div className={`rounded-full w-6 h-6 flex ${user.canUpload ? 'bg-green-600' : 'bg-red-600'}`} layout transition={spring} />
                                                    </div>
                                                </div>
                                                <button onClick={()=>handleRevoke(user._id)} className='bg-red-600 text-white font-semibold rounded-xl'>
                                                    Revoke access
                                                </button>
                                            
                                            </motion.div>
                                        )}
                                        </div>
                                        
                                    </div>
                                    
                                );
                            })}
                        </div> 
                        }
                </div>
            </motion.div>
        </div>
    );
}

const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30
  };
  