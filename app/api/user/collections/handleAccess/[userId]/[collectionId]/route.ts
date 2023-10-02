import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import React from 'react'

type Params = {
    params:{
        collectionId:string,
        userId:string
    }
}

connectMongo()

export async function POST(request:Request,{params:{collectionId,userId}}:Params) {
    //not the most efficient way of doing this data synchronization between
    //owner-invited, might change that later.

    const {invitedId, right} = await request.json()

    const invitedObjectId = new ObjectId(invitedId)
    const collectionObjectId = new ObjectId(collectionId)
    try {

        //FOR OWNER 
        const owner = await UserModel.findById(userId)
       
        if(!owner){
          return NextResponse.json("Owner not found")
        }
        const ownerCollectionIndex = owner.collections.findIndex(
            (collection:collection) => collection._id.equals(collectionObjectId)
          );

        const ownerCollection = owner.collections[ownerCollectionIndex]

        const accessIndex = ownerCollection.acces.findIndex((user:userObject)=> user._id.equals(invitedObjectId))

        const invitedUser = ownerCollection.acces[accessIndex]
         
        
        //FOR INVITED USER DIRECTLY
     
        const invitedRoot = await UserModel.findById(invitedId)

        if(!invitedRoot){
          return NextResponse.json("Invited root not found")
        }
       
        const invitedRootCollectionIndex = invitedRoot.collections.findIndex(
            (collection:collection) => collection._id.equals(collectionObjectId)
          );
          

        const invitedRootCollection = invitedRoot.collections[invitedRootCollectionIndex]
        
        const invitedAccessIndex = invitedRootCollection.acces.findIndex((user:userObject)=> user._id.equals(invitedObjectId))

        const invitedRootUser = invitedRootCollection.acces[invitedAccessIndex]

        switch(right){
            case 'upload':
                invitedUser.canUpload = !invitedUser.canUpload
                invitedRootUser.canUpload = !invitedRootUser.canUpload
                break
            case 'delete':
                invitedUser.canDelete = !invitedUser.canDelete
                invitedRootUser.canDelete = !invitedRootUser.canDelete
                 break
            case 'download':
                invitedUser.canDownload = !invitedUser.canDownload
                invitedRootUser.canDownload = !invitedRootUser.canDownload
                break
            case 'rename':
                invitedUser.canRename = !invitedUser.canRename
                invitedRootUser.canRename = !invitedRootUser.canRename
                break
        }
        
        owner.markModified('collections');
        invitedRoot.markModified('collections')
        await owner.save()
        await invitedRoot.save()
    return NextResponse.json(invitedRoot)
  } catch (error) {
    return NextResponse.json(error)
  }
}
