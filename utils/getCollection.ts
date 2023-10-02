
export default async function getCollection(userId:string,collectionId:string) {
  const res = await fetch(`/api/user/collections/${userId}/${collectionId}`,{cache:'no-store'})
    return res.json()
}
