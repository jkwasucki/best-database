import { storage } from "@/lib/firebase";
import axios from "axios";
import { StorageReference, deleteObject, getDownloadURL, getMetadata, ref } from "firebase/storage";
import uuid from 'uuid-random';
export async function handleDownload(file:firebaseFileRef){
    getDownloadURL(ref(storage, file.fullPath))
    .then((url) => {
      // This can be downloaded directly:
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        const blob = xhr.response;
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.target = '_blank';
        link.download = file.name;
        link.click();
      };
      xhr.open('GET', url);
      xhr.send();
    })
} 

export async function handleDelete(file:mongoFileRef,userId:string,collectionId:string){
    return new Promise<void>((resolve,reject)=>{
      const fileRef = ref(storage,file.fullPath);
      console.log(file._id)
      deleteObject(fileRef)
      .then(async() => {
        await axios.post(`/api/user/deleteFile/${userId}/${collectionId}`,{ 
          fileId: file._id
        })
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
    })
  }

  export const fetchMetadata = async (storageReference:StorageReference,userId:string,collectionId:string) => {
    
      const url = await getDownloadURL(storageReference);
      const { timeCreated, contentType, fullPath, customMetadata,name } = await getMetadata(storageReference);
      const type = contentType?.split('/').shift();
      const id = uuid();
  
      const uploadedFileMetadata = {
        _id: id,
        name: name,
        firebaseNameRef:name,
        dynamicName: customMetadata?.dynamicFileName,
        type: type,
        url: url,
        fullPath: fullPath,
        createdAt: new Date(timeCreated),
        naturalWidth: customMetadata?.naturalWidth,
        naturalHeight: customMetadata?.naturalHeight,
      };

      await axios.post(`http://localhost:3000/api/user/addFileDataToMongo/${userId}/${collectionId}`,{...uploadedFileMetadata})
  };