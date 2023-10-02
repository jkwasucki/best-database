import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import React from 'react'

type Params = {
    params:{
      userId:string,
      collectionId:string
    }
    
  }

  connectMongo()

  export async function POST(request:Request,{params:{userId,collectionId}}:Params) {
   const fileData:mongoFileRef = await request.json()
   const collectionObjectId = new ObjectId(collectionId)
    try {
      const user = await UserModel.findById(userId)
      if(!user){
        return NextResponse.json("Couldn't find a user",{status:404})
      }
      const userCollectionIndex = user.collections.findIndex(
        (collection:collection) => collection._id.equals(collectionId)
      );

      const fileIndex = user.collections[userCollectionIndex].files.findIndex(
        (file:mongoFileRef) => file.firebaseNameRef === fileData.firebaseNameRef
      );

      if(fileIndex !== -1){
        return NextResponse.json("There is already a file of that same name.",{status:400})
      }

     
      const session = await UserModel.startSession()

        try {
            session.startTransaction()

            user.collections[userCollectionIndex].files.push(fileData)
            user.markModified('collections')
            user.save()

            // Sync the deletion with other parties who have access
            await Promise.all(user.collections[userCollectionIndex].acces.map(async (access: userObject) => {
                try {
                    const party = await UserModel.findById(access._id);
                    if (!party) {
                        return // Skip if the party is not found
                    }

                    const sharedCol = party.collections.find((col: collection) =>
                        col._id.equals(collectionObjectId)
                    );

                    if (sharedCol) {
                        sharedCol.files.push(fileData)

                        const notification = {
                          _id:new ObjectId(),
                          triggeredBy:user.email,
                          text:'uploaded file to',
                          collectionRef:{
                            collectionId:collectionId,
                            name:user.collections[userCollectionIndex].name
                          },
                          fileRef:fileData,
                          state:{
                            seen:false,
                            clicked:false,
                            dismissed:false
                          },
                          createdAt: new Date()
                        }
                        
                        //Send notification to party members (if its possible, meaning they didnt mute the collection).
                        if(sharedCol.owner !== userId){
                          const owner = await UserModel.findById(userId)
                          if(!owner.notifications.muted.includes(collectionId)){
                            owner.notifications.array.push(notification)
                          }
                        }
                        if(!party.notifications.muted.includes(collectionId)){
                          party.notifications.array.push(notification)
                        }

                        party.markModified('collections')
                        party.markModified('notifications')
                        await party.save()
                    }
                } catch (error) {
                    return NextResponse.json("Something went wrong while syncing with other party members:", {status:500})
                }
            }));

            // Commit the transaction
            await session.commitTransaction()
            session.endSession()

            return NextResponse.json("File has been uploaded", { status: 200 })
        } catch (error) {
            // Rollback the transaction if an error occurs
            await session.abortTransaction()
            session.endSession()

            console.error("An error occurred:", error)
            return NextResponse.json("An error occurred while processing your request.", { status: 500 })
        }
  } catch (error) {
    return NextResponse.json(error)
  }
}
