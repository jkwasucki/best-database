import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { NextResponse } from 'next/server'


type Params = {
    params:{
        userId:string
    }
}

connectMongo()

export async function GET(request:Request,{params:{userId}}:Params) {
  try{
    const user = await UserModel.findById(userId)
    return NextResponse.json(user.notifications.muted)
  }catch(error){
    return NextResponse.json("Something went wrong while getting muted collections",{status:500})
  }
}
