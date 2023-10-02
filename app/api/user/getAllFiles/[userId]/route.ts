
import { NextResponse } from 'next/server'
import UserModel from '@/models/User'
import { connectMongo } from '@/lib/connectMongo'

type Params = {
  params:{
    userId:string
  }
  
}

connectMongo()

export async function GET(request:Request,{params:{userId}}:Params) {
      try{
        let mostRecent:mongoFileRef[] = []
        const user = await UserModel.findById(userId)
        user.collections.map((col:collection)=>{
          col.files.forEach((file:mongoFileRef)=>{
            mostRecent.push(file)
          })
        })

        mostRecent.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        
        const mostRecentFiles = mostRecent.slice(0, 4);
        // Get the first 3 files (most recent)
        return NextResponse.json(mostRecentFiles)
      }catch(error){
        return NextResponse.json("Something went wrong",{status:500})
      }
}

