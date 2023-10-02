import UserModel from "@/models/User"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

type Params = {
    params:{
        userId:string,
        collectionId:string
    }
}

//Delete collection.
export async function DELETE(request:Request,{params:{userId,collectionId}}:Params){
    try {
        const user = await UserModel.findById(userId)

        const collectionObjectId = new ObjectId(collectionId);
        
        const collectionIndex = user.collections.findIndex(
            (existingCollection: any) => existingCollection._id.equals(collectionObjectId)
        );
        
        if (collectionIndex === -1) {
            return NextResponse.json({ error: 'Collection does not exist' }, { status: 400 });
        }
        
        const session = await UserModel.startSession();

        try{
            session.startTransaction()
            const deletedCollection = user.collections[collectionIndex];
            user.collections.splice(collectionIndex,1)

            await user.save()

            await Promise.all(deletedCollection.acces.map(async (user: userObject) => {
                try {
                    const party = await UserModel.findById(user._id);
                    const sharedColIndex = party.collections.findIndex((col: collection) => col._id.equals(collectionObjectId));
                    if (sharedColIndex !== -1) {
                        party.collections.splice(sharedColIndex,1)
                        party.markModified('collections');
                        await party.save(); 
                    }
                } catch (error) {
                    return NextResponse.json("Something went wrong while syncing with other party members.",{status:500})
                }
            }));

             // Commit the transaction
             await session.commitTransaction();
             session.endSession();
 
             return NextResponse.json("Collection has been deleted.", { status: 200 });
        }catch(error){
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            
            return NextResponse.json("An error occurred while processing your request.", { status: 500 });
        }
    } catch (error) {
        return NextResponse.json("An error occurred while processing your request.", { status: 500 });
    }
}

//Get collection.
export async function GET(request:Request,{params:{userId,collectionId}}:Params){
    try {
        const user = await UserModel.findById(userId)

        const collectionObjectId = new ObjectId(collectionId);
        
        const collectionIndex = user.collections.findIndex(
            (existingCollection: any) => existingCollection._id.equals(collectionObjectId)
        );
    
        if (collectionIndex === -1) {
            return NextResponse.json({ error: 'Collection does not exist' }, { status: 400 });
        }

        return NextResponse.json(user.collections[collectionIndex])

    } catch (error) {
        return NextResponse.json(error)
    }
}

//Change collection name.
export async function PATCH(request:Request,{params:{userId,collectionId}}:Params){
    const {newName} = await request.json()
    const collectionObjectId = new ObjectId(collectionId)
    try {
        const user = await UserModel.findById(userId)
        const collection = user.collections.find((col:collection)=>col._id.equals(collectionObjectId))
        collection.name = newName
        user.save()

        //Perform the same and synchronize with all the party members.
        await Promise.all(collection.acces.map(async (user: userObject) => {
            try {
                const party = await UserModel.findById(user._id);
                const sharedCol = party.collections.find((col: collection) => col._id.equals(collectionObjectId));
                if (sharedCol) {
                    sharedCol.name = newName;
                    party.markModified('collections');
                    await party.save(); 
                }
            } catch (error) {
                return NextResponse.json("Something went wrong while syncing with other party members.",{status:500})
            }
        }));
        return NextResponse.json("Name has been changed.",{status:200})
       
    } catch (error) {
        return NextResponse.json(error)
    }
}


//Inviting user to your collection.
export async function POST(request:Request,{params:{userId,collectionId}}:Params){
    const {invitedId} = await request.json()
    try {
        const invitedU = await UserModel.findById(invitedId)

        const {_id,email,tag} = invitedU
 
        const ownerUpdate = await UserModel.findOneAndUpdate(
            { _id: userId, 'collections._id': collectionId },
            { $addToSet: { 'collections.$.acces': 
            {
                _id,
                email,
                tag,
                canRename:false,
                canDelete:false,
                canDownload:false,
                canUpload:false
            } 
            }},
            { new: true },
        )
        console.log(ownerUpdate)
        const ownerFindCol = await UserModel.findById(userId)
        
        const collectionIndex = ownerFindCol.collections.findIndex(
            (existingCollection: any) => existingCollection._id.equals(collectionId)
        );

        //get the collection object 
        const collection = ownerFindCol.collections[collectionIndex]
            
       //pass the collection to invited user
        const invited = await UserModel.findByIdAndUpdate(
            {_id:invitedId},
            {$addToSet: { 'collections': collection}}
        )
        
       
        return NextResponse.json("User has been invited to collection.",{status:200})
    } catch (error) {
        return NextResponse.json(error)
    }
}