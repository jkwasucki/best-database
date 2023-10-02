'use client'
import { RootState } from '@/redux/store'
import axios from 'axios'
import Avatar from 'boring-avatars'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { TbReload } from 'react-icons/tb'
import { useSelector } from 'react-redux'
import uuid from 'uuid-random';

type Props = {
    isAccountVisible:Function,
    reRenderAccount:Function
}

export default function AccountModal({isAccountVisible,reRenderAccount}:Props) {    

    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const [avatarHash,setAvatarHash] = useState<string | null>(null)
  
    async function handleReload(){
        let randomHash = uuid()
        setAvatarHash(randomHash)
        await axios.post(`/api/user/updateAvatar/${session._id}`,{
            newHash:randomHash
        }).then(()=>{
            reRenderAccount()
        })
       
    }

    const sessionDate = new Date(session.createdAt);

    // Get day, month, and year as numbers
    const day = sessionDate.getDate();
    const month = sessionDate.getMonth() + 1; // Months are zero-based, so add 1
    const year = sessionDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    

    //Renders player's avatar
    useEffect(()=>{
        async function getAvatarHash(){
            try{
                const newHash = await axios.get(`/api/user/updateAvatar/${session._id}`)
                setAvatarHash(newHash.data)
            }catch(err){
                //
            }
        }
        getAvatarHash()
    },[])
    
  return (
    <div className='bg-black bg-opacity-25 backdrop-blur-sm fixed inset-0 flex justify-center items-center w-screen h-screen z-50'>
        <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.2, ease: "easeOut" }} 
            className="relative rounded-2xl bg-white shadow-xl border w-[300px] h-[400px] flex flex-col items-center justify-center gap-5 select-none"
            >
            <AiFillCloseCircle 
                onClick={()=>isAccountVisible(false)}
                size={20} 
                className='absolute top-3 right-3 text-red-600 cursor-pointer'
            />
            <div className="flex mr-5">
                <TbReload onClick={handleReload} size={20} className='flex justify-center shadow border rounded-full cursor-pointer'/>
                {avatarHash ? 
                    <Avatar
                        size={100}
                        name={avatarHash}
                        variant="beam"
                        colors={["#2A2F4F", "#917FB3", "#E5BEEC", "#FDE2F3"]}
                    />
                :
                <div className='rounded-full bg-transparent h-[100px] w-[100px]'/>
                }
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Email:</p>
                <p>{session.email}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">User tag:</p>
                <p>#{session.tag}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">User since:</p>
                <p>{formattedDate}</p>
            </div>
        </motion.div>
    </div>
    
  )
}
