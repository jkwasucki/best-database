import { connectMongo } from "@/lib/connectMongo"
import UserModel from "@/models/User"
import { NextResponse } from "next/server"

type Params = {
    params:{
        userId:string
    }
}


connectMongo()

export async function GET(request:Request,{params:{userId}}:Params) {
    try {
        const user = await UserModel.findById(userId)
        return NextResponse.json(user.notifications.array)
    } catch (error) {
        return NextResponse.json("Something went wrong while fetching notifications",{status:500})
    }
}