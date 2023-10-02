import { setCookie } from 'cookies-next';
import React, { useEffect, useState } from 'react';

type Props = {
    dismiss:Function
}

export default function Info({dismiss}:Props) {
const [infoIndex,setInfoIndex] = useState<number>(0)

interface InfoData {
    [key: string]: JSX.Element;
  }

const infos:InfoData = {
    info1: (
        <div>
            <p className='font-semibold'>Share your collections!</p>
            <p>
                Remember, that once you create your collection, you can then share
                it with your friends by inviting them and granting them with
                permissions!
            </p>
            <p
                onClick={() => dismiss()}
                className='cursor-pointer hover:font-bold flex justify-end'
            >
                Dismiss
            </p>
        </div>
    ),
    info2: (
        <div>
            <p className='font-semibold'>Handle with care!</p>
            <p>
                Once removed, friends loose access to all the files in the collections - including their own!
            </p>
            <p
                onClick={() => dismiss()}
                className='cursor-pointer hover:font-bold flex justify-end'
            >
                Dismiss
            </p>
        </div>
    )
}

    useEffect(() => {
        const infoIndex = Math.floor(Math.random() * Object.keys(infos).length);
        setInfoIndex(infoIndex)
    }, [])


    const selectedInfoKey = Object.keys(infos)[infoIndex];


    return (
      <div>
         {infos[selectedInfoKey]}
      </div>
    );
}

