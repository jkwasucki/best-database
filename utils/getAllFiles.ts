
export default async function getAllFiles(userId:string) {
 const res = await fetch(`/api/user/getAllFiles/${userId}`,{cache:'no-store'})
 return res.json()
}
