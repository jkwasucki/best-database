'use client'
import Cookies from 'js-cookie';
import { AiOutlineLogout } from "react-icons/ai"
import AccountBar from "./components/AccountBar"
import Navbar from "./components/Navbar"
import Search from "./components/Search"
import { useDispatch, useSelector } from "react-redux"
import { signOut } from "next-auth/react"
import { removeSession } from "@/redux/userSlice"
import { IoIosNotifications } from "react-icons/io"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { RootState } from "@/redux/store"
import NotificationBell from "./components/NotificationBell"
import Alert from "./components/Alert"
import { HiOutlineMenuAlt2 } from "react-icons/hi"
import { useRouter } from "next/navigation"
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)
    const dispatch = useDispatch()
    const router = useRouter()
    const [refetch,setRefetch] = useState(false)
    const [showNotifications,setShowNotifications] = useState(false)
    const [unsettledNotificationsCount,setUnsettledNotificationsCount] = useState(0)
    const [isMobileScreen,setIsMobileScreen] = useState(false)
    const [navOpen,setNavOpen] = useState(false)


    function refetchUnsettled(refetch:boolean){
        if(refetch) setRefetch(true)
    }

    

    function handleLogout(){
        const tokenValue = Cookies.get('token');
        const nextAuthTokenValue = Cookies.get()
        if(tokenValue){
            router.push('/')  
            Cookies.remove('token')
            dispatch(removeSession({}))
              
        }else if(nextAuthTokenValue){
            router.push('/')  
            signOut()
            dispatch(removeSession({}))
        }
    }

   
    //Fetch notifications
    useEffect(()=>{
        async function fetchNotifications(){
            if(session._id.length > 0){
                const notifications = await axios.get(`/api/user/handleNotifications/${session._id}`)
                const unsettledNotifications = notifications.data.filter((notification:notifications)=>notification.state.seen === false)
                
                setUnsettledNotificationsCount(unsettledNotifications.length)
            }
        }
        fetchNotifications()
    },[refetch,session._id])

    //Device screen size tracker
    useEffect(()=>{
        // Define the screen width threshold
        const screenWidthThreshold = 450; 
        
        // Check the screen width and conditionally render components
        const isMobileScreen = window.innerWidth <= screenWidthThreshold;
        
        setIsMobileScreen(isMobileScreen)
    },[])

    const handleNavbarState = () => {
        setNavOpen(!navOpen);
      };

    function handleNotifiExtented(status:boolean){
        if(status) setShowNotifications(false)
    }

    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(()=>{
        const handleOutSideClick = (event:MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
        setNavOpen(false)
        }
        };

        window.addEventListener("mousedown", handleOutSideClick);

        return () => {
        window.removeEventListener("mousedown", handleOutSideClick);
        };
    },[containerRef])
    
    return (
        //Setting layout for the dashboard so that only single children main element 
        //is going to be refreashed,leaving navbar and search static
        <section className='z-50 overflow-x-hidden overflow-y-hidden flex sm:justify-center p-2'>
            <Alert/>
            <div className="sm:block hidden">
                <Navbar/>
            </div>
            <div className='flex flex-col py-2 gap-3 max-h-screen'>
                <div className="flex items-center gap-8 ">
                    <div className=" flex justify-between items-center w-full overflow-x-hidden">
                        <div className='flex items-center gap-2'>
                            {isMobileScreen && 
                                <div ref={containerRef} className="p-1 flex items-center rounded-full border">
                                    <HiOutlineMenuAlt2 size={30} onClick={()=>setNavOpen(!navOpen)} className='sm:hidden'/>
                                    {navOpen && 
                                        <div className="sm:hidden block">
                                            <Navbar isNavOpen={handleNavbarState}/>
                                        </div>
                                    }
                                </div>
                            }
                            <Search/>
                            <AccountBar/>
                        </div>
                        
                        <div className="relative flex items-center gap-2">
                            <IoIosNotifications 
                                onClick={()=>setShowNotifications(!showNotifications)} 
                                size={30} 
                                className='cursor-pointer max-w-[30px] '
                            />
                            {unsettledNotificationsCount > 0 && 
                                <div className="absolute bottom-4 left-4 p-1 rounded-full bg-red-600 text-white text-sm w-4 h-4 flex justify-center items-center font-bold">
                                    <p>{unsettledNotificationsCount < 9 ? unsettledNotificationsCount : "9+"}</p>
                                </div>
                            }
                            {showNotifications && <NotificationBell areNotifiExtended={handleNotifiExtented} refetchRef={refetchUnsettled}/>}
                            <div className="bg-white rounded-full shadow border flex p-1 cursor-pointer">
                                <AiOutlineLogout onClick={handleLogout} size={20} />
                            </div>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </section>
    )
 }
