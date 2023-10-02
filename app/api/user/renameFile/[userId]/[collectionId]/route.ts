
import { NextResponse } from "next/server";
import UserModel from "@/models/User";
import { ObjectId } from "mongodb";
import { connectMongo } from "@/lib/connectMongo";

type Params = {
    params:{
        userId:string,
        collectionId:string
    } 
}

connectMongo()

export async function POST(request:Request,{params:{userId,collectionId}}:Params) {
    const {newName,fileId} = await request.json()
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
        (file:mongoFileRef) => file._id === fileId
        );

        if(fileIndex === -1){
            return NextResponse.json("Couldn't find the file.",{status:404})
        }

        const session = await UserModel.startSession();

        try {

            const extension = user.collections[userCollectionIndex].files[fileIndex].firebaseNameRef.split(".").pop()

            user.collections[userCollectionIndex].files[fileIndex].name = newName + "." + extension 
    
            user.markModified('collections')
            user.save()


            // Sync with other parties who have access
            await Promise.all( user.collections[userCollectionIndex].acces.map(async (access: userObject) => {
                try {
                    const party = await UserModel.findById(access._id);
                    if (!party) {
                        return; // Skip if the party is not found
                    }

                    const sharedCol = party.collections.find((col: collection) =>
                        col._id.equals(collectionObjectId)
                    );

                    if (sharedCol) {
                        const fileIndex = sharedCol.files.findIndex((file: mongoFileRef) =>
                            file._id === fileId
                        );

                        if (fileIndex !== -1) {
                            sharedCol.files[fileIndex].name = newName + "." + extension 
                            party.markModified('collections');
                            await party.save();
                        }
                    }
                } catch (error) {
                   return NextResponse.json("Something went wrong while syncing with other party members:",{status:500});
                }
            }));

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return NextResponse.json("Name has been changed.", { status: 200 });

        } catch (error) {
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json("An error occurred while processing your request.", { status: 500 });
        }
    } catch (error) {
        return NextResponse.json(error)
    }
}
