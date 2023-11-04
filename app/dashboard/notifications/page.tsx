'use client'
import { RootState } from '@/redux/store'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import LoaderSVG from '../../components/svgs/LoaderSVG'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { referenceFile } from '@/redux/fileSlice'
import { AiFillCloseCircle } from 'react-icons/ai'
import { AnimatePresence, motion } from 'framer-motion'
import { getNotifications, handleNotifications } from '@/utils/handlers'
import { useDataContext } from '@/app/components/Providers/DataContextProvider'

export default function NotificationsPage() {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const { shouldRefetchData,shakeData } = useDataContext()

    const router = useRouter()
    const dispatch = useDispatch()
    const [notifications,setNotifications] = useState<notifications[]>()
 
    async function clearNotifications(userId:string){
        await handleNotifications(userId,"clear").then(()=> shakeData())
    }

    async function removeNotification(userId:string,notificationId:string){
        const notificationIndex = notifications?.findIndex((notification:notifications)=>notification._id === notificationId)
        notifications?.splice(notificationIndex!,1)
        await handleNotifications(userId,"remove",notificationId)
        shakeData()
    }

    async function handleRedirect(notification:notifications){
        await handleNotifications(session._id,'clicked',notification._id)
        router.push(`/dashboard/collections/${session?._id}/${notification.collectionRef.collectionId}`)
        dispatch(referenceFile({file:notification.fileRef,for:"scrollInView"}))
    }

    //Fetch notifications
    useEffect(() => {
        async function fetchNotifications(){
            const notifications = await getNotifications(session._id)
            const sortedNotifications = notifications.data.sort(
                (a:notifications, b:notifications) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )

            setNotifications(sortedNotifications)
        }
        fetchNotifications()
    }, [shouldRefetchData])

    useEffect(()=>{
        router.refresh()
    },[shouldRefetchData])

  return (
    <div className='px-2 h-[590px] bg-white w-[calc(100vw-10px)] rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:p-5  sm:h-[calc(100vh-100px)] shadow-sm flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
            <p className='font-thin text-3xl'>Notifications</p>
            {notifications && notifications?.length > 0 &&
                <p 
                    onClick={()=>clearNotifications(session._id)}
                    className='px-2 rounded-xl shadow-xl w-max flex justify-end border cursor-pointer'
                    >
                    Clear all
                </p>
            }
        </div>
        <div className='overflow-y-auto overflow-x-hidden flex flex-col gap-6 sm:px-6'>
            <AnimatePresence>
                {notifications && notifications?.length > 0 ? notifications.map((notification: notifications,index) => (
                    <motion.div initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, x: '100%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} 
                    key={notification._id} 
                    className={`${!notification.state.clicked ? ' border-[2px] border-black opacity-[90%]' : "border-[2px]" } flex justify-between bg-white rounded-2xl p-3 cursor-pointer`}
                    >
                        <div 
                            onClick={()=>handleRedirect(notification)} 
                            className='flex flex-col sm:w-full'
                        >
                                <p>
                                    {
                                        new Date(notification.createdAt).getHours()
                                        + ":" + 
                                        String(new Date(notification.createdAt).getMinutes()).padStart(2, '0')
                                    }
                                </p>
                                <p className='flex max-w-full gap-1 max-w-[500px]'>
                                    <span className='font-semibold'>
                                        {notification.triggeredBy.split('@').shift()} 
                                    </span>
                                    <span>
                                        {notification.text} 
                                    </span>
                                    <span className='font-semibold'>
                                        {notification.collectionRef.name}
                                    </span>
                                </p>
                        </div>
                        <AiFillCloseCircle 
                            size={20} 
                            className='min-w-[20px] cursor-pointer text-red-600' 
                            onClick={()=>removeNotification(session._id,notification._id)}
                        />
                    </motion.div>
                    )) || <LoaderSVG size={150} />
                    :
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        >
                        <p className='opacity-50'>There aren't any new notifications.</p>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    </div>
  )
}
