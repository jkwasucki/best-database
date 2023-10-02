import { connectMongo } from "@/lib/connectMongo"
import UserModel from "@/models/User"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"


type Params = {
    params:{
        userId:string,
        collectionId:string
    }
}

connectMongo()

export async function POST(request:Request,{params:{userId,collectionId}}:Params) {
    const {invitedId} = await request.json()
  
    try {
        
        //FOR OWNER 
        const owner = await UserModel.findById(userId)
       
        const ownerCollectionIndex = owner.collections.findIndex(
            (collection:collection) => collection._id.equals(collectionId)
          );

        const ownerCollection = owner.collections[ownerCollectionIndex]

        const accessIndex = ownerCollection.acces.findIndex((user:userObject)=> user._id.equals(invitedId))

      
        if (ownerCollectionIndex !== -1 && accessIndex !== -1) {
            owner.collections[ownerCollectionIndex].acces.splice(accessIndex, 1);
        }  


        //FOR INVITED USER DIRECTLY
        const invitedRoot = await UserModel.findById(invitedId)

        const invitedRootCollectionIndex = invitedRoot.collections.findIndex(
            (collection:collection) => collection._id.equals(collectionId)
        );
        
        invitedRoot.collections.splice(invitedRootCollectionIndex,1)

        owner.markModified('collections');
        invitedRoot.markModified('collections')
        await owner.save()
        await invitedRoot.save()

        return NextResponse.json("User has been removed.",{status:200})
    } catch (error) {
        return NextResponse.json("Something went wrong, try again later.",{status:404})
    }
}
