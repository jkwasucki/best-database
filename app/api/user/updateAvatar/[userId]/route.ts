import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { NextResponse } from 'next/server'


type Params = {
    params:{
        userId:string
    }
}

connectMongo()

export async function POST(request:Request,{params:{userId}}:Params) {
    const {newHash} = await request.json()
    try {
        const user = await UserModel.findById(userId)
        
        user.avatarHash = newHash

        user.save()

        return NextResponse.json("Avatar has been changed.",{status:200})
    } catch (error) {
        return NextResponse.json("Something went wrong.",{status:500})
    }
}

export async function GET(request:Request,{params:{userId}}:Params) {
    try {
        const user = await UserModel.findById(userId)

        if(!user.avatarHash){
            return NextResponse.json(null)
        }

        return NextResponse.json(user.avatarHash)
        
    } catch (error) {
        return NextResponse.json("Something went wrong.",{status:500})
    }
}
