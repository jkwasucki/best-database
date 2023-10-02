
export default async function getFiles(userId:string,collectionId:string) {
    const res = await fetch(`/api/user/getFiles/${userId}/${collectionId}`,{cache:"no-store"})
    return res.json()
}
