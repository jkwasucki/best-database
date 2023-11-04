'use client'
import { useEffect, useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { LuTrash } from 'react-icons/lu';
import axios from 'axios';
import Link from 'next/link';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { createAlert } from '@/redux/alertSlice';
import { RootState } from '@/redux/store';
import { SiAiqfome } from 'react-icons/si';
import CreateCollection from '../Modals/CreateCollection';
import { BsFolder, BsFolderFill } from 'react-icons/bs';
import DeleteWarning from '../Modals/DeleteWarning';
import { useRouter } from 'next/navigation';
import { useDataContext } from '../Providers/DataContextProvider';
import { clearCollectionData } from '@/redux/collectionSlice';
import { referenceFile } from '@/redux/fileSlice';

type Props = {
    collections:collection[]
 }
 



export default function CollectionTab({ collections }: Props) {
    const dispatch = useDispatch()
    const router = useRouter()
    const { shouldRefetchData,shakeData } = useDataContext()
    const session = useSelector((state:RootState)=>state.persistedUserReducer.user)

    const [add, setAdd] = useState(false)
    const [shareInfo,setShareInfo] = useState({
        active:false,
        collectionId:""
    })

    const [info, setInfo] = useState({
        active: false,
        text: "There are no collections yet.",
    })

    const [isWarningVisible, setIsWarningVisible] = useState({
        status:false,
        id:""
    })


    async function handleDelete(collection: collection) {
        try {
            if(collection.owner !== session._id){
                await axios.post(`/api/user/collections/revokeAccess/${session?._id}/${collection._id}`,{
                    invitedId:session._id
            })
        }

        await axios.delete(`/api/user/collections/${session?._id}/${collection._id}`);

        const collectionRef = ref(storage, `files/${session?._id}/col+${collection._id}`);
        const allRef = ref(storage, `files/${session?._id}/all`);
        const files = await listAll(collectionRef);
        const allFiles = await listAll(allRef);

        // Delete each file in the directory
        await Promise.all(
            files.items.map(async (fileRef) => {
                const filename = fileRef.name;

                await deleteObject(fileRef);

                // Find and delete the file from allFiles if it exists
                const matchingAllFileRef = allFiles.items.find((allFileRef) => allFileRef.name === filename);

                if (matchingAllFileRef) {
                    await deleteObject(matchingAllFileRef);
                }
            })
        )
        shakeData()
        dispatch(createAlert({type:"info",text:"Colletion has been deleted."}))

        } catch (error: any) {
            console.log(error.response.data.error);
        }
    }

    //On every render, clear any previous col data
    useEffect(()=>{
        dispatch(clearCollectionData({}))
        dispatch(referenceFile({}))
    },[])

    useEffect(()=>{
        router.refresh()
    },[shouldRefetchData])
 
    return (
        <div className="flex flex-col gap-4 h-full overflow-y-hidden">
            <div className="relative flex items-center gap-5 select-none w-[300px]">
                <p className="text-xl">Collections</p>
                <IoAdd
                    onClick={() => setAdd(true)}
                    className="cursor-pointer"
                />
                {add &&
                    <CreateCollection 
                        toggler={setAdd} 
                    />
                }
            </div>
            <div className="flex flex-col w-full h-full ">
                {info.active && 
                    <div className='w-full h-full gap-3 flex items-center justify-center opacity-50'>
                        {info.text}
                        <SiAiqfome size={50}/>
                    </div>
                }
                <div className='overflow-y-auto'>
                    {collections.length > 0 &&
                        collections.map((collection) => {
                            return (
                                <div
                                    key={collection._id}
                                    className='relative flex items-center justify-between gap-3 px-2 hover:bg-slate-200 py-2 font-semibold cursor-pointer rounded'
                                    >
                                    <Link
                                        href={`/dashboard/collections/${session?._id}/${collection._id}`}
                                        className="flex items-center gap-3 relative w-[90%]"
                                        >
                                        {/* Its not your folder so it is shared to you */}
                                        {session._id.length > 0 && collection.owner !== session?._id ? (
                                            <BsFolderFill
                                                className='text-blue-400'
                                                size={30} 
                                                onMouseEnter={() => setShareInfo((prev) => ({ ...prev, active: true, collectionId: collection._id }))}
                                                onMouseLeave={() => setShareInfo((prev) => ({ ...prev, active: false, collectionId: "" }))}
                                            />
                                            ) : (
                                                // If its your folder, check if its beign shared
                                                session._id.length > 0 &&
                                                    collection.acces.length > 0 &&
                                                    collection.owner === session._id ? (
                                                    <BsFolderFill
                                                        className='text-green-500'
                                                        size={30} 
                                                        onMouseEnter={() => setShareInfo((prev) => ({ ...prev, active: true, collectionId: collection._id }))}
                                                        onMouseLeave={() => setShareInfo((prev) => ({ ...prev, active: false, collectionId: "" }))}
                                                    />
                                                    
                                                    ):(
                                                        <BsFolder size={30} />
                                                    )
                                            )
                                        }
                                        <p>{collection.name}</p>
                                        {shareInfo.active &&
                                            shareInfo.collectionId === collection._id &&
                                            session._id === collection.owner && (
                                            <p className='hidden sm:block bg-white text-sm shadow px-2 min-w-max rounded-xl'>
                                                {`You are sharing this collection.`}
                                            </p>
                                        )}
                                        {shareInfo.active &&
                                            shareInfo.collectionId === collection._id &&  
                                            session._id !== collection.owner && (
                                            <p className='hidden sm:block bg-white text-sm shadow px-2 min-w-max rounded-xl'>
                                                {`This collection is shared to you.`}
                                            </p>
                                        )}
                                    </Link>
                                    <div className='group mr-5'>
                                        <LuTrash
                                            onClick={() => setIsWarningVisible((prev)=>({...prev,status:true,id:collection._id}))}
                                            className="hover:block none group"
                                        />
                                        <p className='hidden group-hover:block absolute right-12 top-2 bg-white p-1 border shadow z-0 font-normal rounded'>Remove</p>
                                    </div>
                                    {isWarningVisible.status && 
                                    isWarningVisible.id === collection._id && 
                                        <DeleteWarning 
                                            handleDelete={handleDelete} 
                                            toggler={setIsWarningVisible}
                                            collection={collection}
                                        />
                                    }
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    )
}