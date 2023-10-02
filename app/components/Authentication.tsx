'use client'
import { signIn } from "next-auth/react"
import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { createSession } from '@/redux/userSlice'
import { MdAlternateEmail } from 'react-icons/md'
import {RiLockPasswordLine} from 'react-icons/ri'
import { FcGoogle } from 'react-icons/fc'
import { createAlert } from '@/redux/alertSlice'
import { useDispatch } from 'react-redux'
import LoaderSVG2 from "../dashboard/components/svgs/LoaderSVG2"

export default function Authentication() {
    const dispatch = useDispatch()
    const router = useRouter()
   
    const [haveAccount,setHaveAccount]=useState(true)
    const [userCredentials, setUserCredentials] = useState({
        email:"",
        password:""
    })
    const [buffer,setBuffer] = useState<string | null>(null)
    async function handleCredentials(e:FormEvent<HTMLFormElement>){
        e.preventDefault()
        if(haveAccount){
            if(userCredentials.email.length > 1 && userCredentials.password.length > 1){
                try{
                    setBuffer('start')
                    const user = await axios.post(`/api/user/login`,{
                        email:userCredentials.email,
                        password:userCredentials.password
                    })
                    setBuffer('stop')
                    dispatch(createSession(user.data))
                    router.push("/dashboard")
                }catch(error:any){
                    setBuffer('stop')
                    console.log(error.response)
                    dispatch(createAlert({type:"warning",text:error.response.data}))
                }
            }
        }else{
            if(userCredentials.password.length >= 8){
                try {
                    await axios.post(`/api/user/register`,{
                        email:userCredentials.email,
                        password:userCredentials.password
                    })
                    dispatch(createAlert({type:"info",text:'Account created.'}))
                    setHaveAccount(true)
                } catch (error:any) {
                    console.log(error.response.data)
                    dispatch(createAlert({type:"warning",text:error.response.data}))
                }
            }else{
                dispatch(createAlert({type:"warning",text:'Password must be at least 8 characters.'}))
            }
        }
    }

  return (
    <div className="overflow-hidden flex flex-col w-[300px] mx-auto p-9 bg-white border shadow items-center justify-center rounded-xl gap-5 relative ">
        <form 
            onSubmit={handleCredentials} 
            className='flex flex-col w-full h-full mx-auto items-center pt-5 gap-5'
            >
            {buffer && buffer !== 'stop' && 
                <div className="absolute top-3">
                    <LoaderSVG2/>
                </div>
            }
            {haveAccount ?
                <h1 className='text-xl'>Login</h1> 
                : 
                <h1 className='text-xl font-bold'>Register</h1>
            }
            <div className='flex flex-col'>
                <p className='font-thin'>Email</p>
                <div className='relative flex items-center opacity-50'>
                    <RiLockPasswordLine className='absolute left-2'/>
                    <input 
                        placeholder='Type your email'
                        type='email'
                        value={userCredentials.email}
                        onChange={(e)=>setUserCredentials((prevCred)=>({...prevCred,email:e.target.value}))} 
                        className='pl-8 outline-none p-2 border-b w-full'
                    />
                </div>
            </div>
            <div className='flex flex-col'>
                <p className='font-thin'>Password</p>
                <div className='relative flex items-center opacity-50'>
                    <MdAlternateEmail className='absolute left-2' />
                    <input 
                        placeholder='Type your password'
                        type='password' 
                        value={userCredentials.password} 
                        className='pl-8 outline-none p-2 w-full' 
                        onChange={(e) => setUserCredentials((prevCred) => ({ ...prevCred, password: e.target.value }))}
                    />
                </div>
                <div className='border-b border border-slate-200 w-full'/>
            </div>
            <button 
                className='border rounded-3xl px-3 py-1 bg-slate-700 text-white w-full '
                >
                {haveAccount ? "Login" : "Sign Up"}
            </button>
        </form>
        {haveAccount ?
        <div className='pt-12 flex flex-col items-center gap-9'>
            <div className='flex flex-col items-center gap-2'>
                <p className='opacity-50'>Or sign in using</p>
                <button onClick={(e) => {
                    e.preventDefault() 
                    signIn('google', { callbackUrl: 'https://bestdb.vercel.app/dashboard'
                    })}}
                    >
                    <FcGoogle size={50} className='text-slate-700'/>
                </button>
            </div>
            <p className='flex flex-col items-center text-sm'>You don't have an account? 
                <span 
                    onClick={()=>setHaveAccount(false)} 
                    className='underline cursor-pointer'
                    >
                    Register
                </span>
            </p>
        </div>
        :
        <>
            <p className='text-sm flex flex-col items-center'>I have an account!
                <span 
                    onClick={()=>setHaveAccount(true)} 
                    className='underline cursor-pointer'
                    >
                    Login
                </span>
            </p>
        </>
        }
    </div>
  )
}
