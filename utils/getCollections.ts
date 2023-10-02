
export default async function getCollections(userId:string) {
  const res = await fetch(`/api/user/collections/${userId}`,{cache:'no-store'})
  if(!res.ok){
    console.log("Error occured while fetching collections")
  }
  return res.json()
}
