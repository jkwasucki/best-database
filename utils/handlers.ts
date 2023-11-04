import axios from "axios"

export async function getFiles(userId:string,collectionId:string) {
    return axios.get(`http://localhost:3000/api/user/getFiles/${userId}/${collectionId}`)
}


export async function getCollections(userId:string) {
    return await axios.get(`http://localhost:3000/api/user/collections/${userId}`)
  }
  

  
export async function getCollection(userId:string,collectionId:string) {
   return await axios.get(`http://localhost:3000/api/user/collections/${userId}/${collectionId}`)
    
  }
  
export async function findUserById(userId:string){
    return await axios.get(`http://localhost:3000/api/user/findUserById/${userId}`)
}
  
export async function getAllFiles(userId:string) {
    return await axios.get(`http://localhost:3000/api/user/getAllFiles/${userId}`)
   }

export async function getNotifications(userId:string){
    return await axios.get(`http://localhost:3000/api/user/notifications/getNotifications/${userId}`)
}
export async function handleNotifications(userId:string,action?:string,notificationId?:string) {
    return await axios.post(`http://localhost:3000/api/user/notifications/handleNotifications/${userId}`,{action:action,notificationId:notificationId})
}

export async function searchResults(userId:string,phrase:string){
    return await axios.get(`http://localhost:3000/api/user/search/${userId}?phrase=${phrase}`)
}

export async function revokeAcces(ownerId:string,invitedId:string,collectionId:string){
    return await axios.post(`http://localhost:3000/api/user/collections/revokeAccess/${ownerId}/${collectionId}`,{invitedId:invitedId})
}
   
export async function deleteCollection(userId:string,collecitonId:string){
    return await axios.delete(`http://localhost:3000/api/user/collections/${userId}/${collecitonId}`)
}