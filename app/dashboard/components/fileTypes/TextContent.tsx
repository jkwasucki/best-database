import React, { useEffect, useState } from 'react';
import LoaderSVG from '../svgs/LoaderSVG';

type Props = {
    file:mongoFileRef,

}

function TextFileFromURL({file}:Props) {
  const [fileContent, setFileContent] = useState('');

  //Fetch text data with debounce.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetch(file.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then((data) => {
          setFileContent(data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    },500)
        return ()=> clearTimeout(timeoutId)
  }, [file]);


  return (
    <div className='fixed w-screen min-h-screen flex items-center justify-center z-40'>
    {fileContent.length > 0 ? 
       <div className='select-text max-h-[300px] min-h-[150px] max-w-[450px] overflow-y-scroll sm:max-h-[600px] sm:min-h-[300px] sm:max-w-[900px] w-full h-full bg-white user-select overflow-x-auto p-5 rounded shadow z-20'>
       <p style={{ whiteSpace: 'pre-wrap' }}>{fileContent}</p>
   </div>
        :    
        <LoaderSVG size={150}/>
    }
</div>

  );
}

export default TextFileFromURL;
