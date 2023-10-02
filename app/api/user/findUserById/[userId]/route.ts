import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

type Params = {
    params: {
        userId:string
    }
}

connectMongo()

export async function GET(request:Request,{params:{userId}}:Params) {

  try {
    const user = await UserModel.findById(userId)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(error)
  }
}
