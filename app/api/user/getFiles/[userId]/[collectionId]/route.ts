
import { connectMongo } from "@/lib/connectMongo";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

type Params = {
    params:{
        userId:string,
        collectionId:string
    }
}

connectMongo()

export async function GET(request:Request,{params:{userId,collectionId}}:Params) {
    try {
      const user = await UserModel.findById(userId)

      if(!user){
        return NextResponse.json("User was not found",{status:404})
      }

      const userCollectionIndex = user.collections.findIndex(
        (collection:collection) => collection._id.equals(collectionId)
      );
      
       const filesData = user.collections[userCollectionIndex].files
        return NextResponse.json(filesData)
    } catch (error) {
      return NextResponse.json(error)
    }
}

