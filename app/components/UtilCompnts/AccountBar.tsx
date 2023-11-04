import React, { useEffect, useState } from 'react'
import Avatar from "boring-avatars";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import AccountModal from '../Modals/AccountModal';
import axios from 'axios';

export default function AccountBar() {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const [isAccountVisible,setIsAccountVisible] = useState(false)
    const [accountRenderTrigger,setAccountRenderTrigger] = useState(0)
    const [avatarHash,setAvatarHash] = useState('')

    function handleAccountToggler(status:boolean){
        if(!status) setIsAccountVisible(false)
        if(status) setIsAccountVisible(true)
    }

    function handleAccountReRender(){
        setAccountRenderTrigger(accountRenderTrigger + 1)
    }

    //Renders player's avatar
    useEffect(()=>{
        async function getAvatarHash(){
            try {
                const newHash = await axios.get(`/api/user/updateAvatar/${session._id}`)
                setAvatarHash(newHash.data)
            } catch (error) {
                //
            }
        }
        getAvatarHash()
    },[accountRenderTrigger, session])

  return (
    <div 
        className='flex items-center justify-center gap-3'
        >
            {session._id.length > 0 && 
            <>
               <div
                    onClick={()=>setIsAccountVisible(true)}
                    className='cursor-pointer'
                    >
                    {avatarHash &&
                    <Avatar
                        size={40}
                        name={avatarHash}
                        variant="beam"
                        colors={["#2A2F4F", "#917FB3", "#E5BEEC", "#FDE2F3"]}
                    />}
                </div>
                <p className='font-md'>#{session.tag}</p>
            </>
            }
            {isAccountVisible &&
                <AccountModal 
                    isAccountVisible={handleAccountToggler}
                    reRenderAccount={handleAccountReRender}
                />
            }
    </div>
  )
}
