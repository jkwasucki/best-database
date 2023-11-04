'use client'
import { updateAccessData, updateOwner, updatePartyData } from '@/redux/collectionSlice'
import { RootState } from '@/redux/store'
import { findUserById } from '@/utils/handlers'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {FiUsers} from 'react-icons/fi'
import { motion } from 'framer-motion'
import Avatar from 'boring-avatars'

type Props = {
    collection:collection
}
export default function Party({collection}:Props) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const partyData = useSelector((state:RootState)=>state.collectionReducer.collection.partyData)
    
    const dispatch = useDispatch()
    const [showUsers,setShowUsers] = useState(false)
    const [owner,setOwner] = useState({
        isOwner:false,
      })
  
    useEffect(()=>{
        const handleOwnership = async() =>{
            if(collection && session._id.length > 0){
                if(collection.owner === session._id){
                    setOwner(prevOwner => ({ ...prevOwner, isOwner: true }));
                    dispatch(updateOwner(
                        {owner:{
                            isOwner:true,
                            user:""
                        }}
                    ))
                }else{
                    const userObject:userObject = collection.acces.find((user: userObject) => user._id === session._id)!;
                    dispatch(updateAccessData(
                        {accessData:{
                            canRename: userObject.canRename,
                            canDelete: userObject.canDelete,
                            canDownload: userObject.canDownload,
                            canUpload: userObject.canUpload
                        }}
                    ))
                    const ownerUser = await findUserById(collection.owner)
                    setOwner(prevOwner => ({ ...prevOwner, isOwner: false }));
                    dispatch(updateOwner(
                        {owner:{
                            isOwner:false,
                            //Pass owner user reference
                            user:ownerUser.data
                        }}
                    ))
                }
            }
            }
            
        handleOwnership()
    },[collection])
    
     //Handle access data depending on owner boolean
     useEffect(() => {
        if(owner?.isOwner){
            dispatch(updatePartyData(
                {partyData:{
                    sharedWithCount: collection!.acces.length ,
                    sharedWithUserObjects: collection!.acces
                }}
            ))
        }
    }, [owner])

  return (
    <>
        <div className="relative flex items-center justify-between">
            {partyData?.sharedWithCount > 0 &&
            <div className="relative flex items-center gap-2">
                <p>Shared with:</p>
                <div 
                onClick={()=>setShowUsers(!showUsers)}
                className="flex items-center gap-1 font-bold cursor-pointer"
                >
                  <p>{partyData?.sharedWithCount}</p>
                  <FiUsers/>
                  {showUsers && 
                      <div className="absolute left-[150px] top-[-12] flex gap-4 p-3">
                          {partyData?.sharedWithUserObjects.map((user,index)=>{
                            return (
                              <motion.div
                                className="group relative flex flex-col items-center"
                                key={user._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                <Avatar
                                  size={40}
                                  name="Maria Mitchell"
                                  variant="beam"
                                  colors={["#2A2F4F", "#917FB3", "#E5BEEC", "#FDE2F3"]}
                                />
                                <p className="group-hover:block hidden absolute top-12 bg-white rounded-xl border px-2 text-sm">{user.email}</p>
                              </motion.div>
                            )
                          })}
                      </div>  
                  }
                </div>
            </div>}
        </div>
    </>
  )
}
