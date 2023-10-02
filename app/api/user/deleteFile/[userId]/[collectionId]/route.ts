import { connectMongo } from "@/lib/connectMongo";
import UserModel from "@/models/User";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";


type Params = {
    params:{
        userId:string,
        collectionId:string
    }
}

connectMongo()

export async function POST(request: Request, { params: { userId, collectionId } }: Params) {
    try {
        const { fileId } = await request.json();
        const collectionObjectId = new ObjectId(collectionId);

        // Find the user
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json("Couldn't find a user", { status: 404 })
        }

        // Find the collection index and file index in user's collections
        const userCollectionIndex = user.collections.findIndex(
            (collection: collection) => collection._id.equals(collectionId)
        );

        if (userCollectionIndex === -1) {
            return NextResponse.json("User doesn't have access to this collection", { status: 404 })
        }

        const userCollection = user.collections[userCollectionIndex];
        const fileIndex = userCollection.files.findIndex(
            (file: mongoFileRef) => file._id === fileId
        );

        if (fileIndex === -1) {
            return NextResponse.json("Couldn't find the file.", { status: 404 })
        }

        const session = await UserModel.startSession()

        try {
            session.startTransaction();

            // Perform the deletion for the user
            userCollection.files.splice(fileIndex, 1)
            user.markModified('collections')
            await user.save()

            // Sync the deletion with other parties who have access
            await Promise.all(userCollection.acces.map(async (access: userObject) => {
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
                            sharedCol.files.splice(fileIndex, 1)
                            party.markModified('collections')
                            await party.save()
                        }
                    }
                } catch (error) {
                    console.error("Something went wrong while syncing with other party members:", error)
                    // Handle the error here if needed
                }
            }));

            // Commit the transaction
            await session.commitTransaction()
            session.endSession()

            return NextResponse.json("File has been deleted.", { status: 200 })
        } catch (error) {
            // Rollback the transaction if an error occurs
            await session.abortTransaction()
            session.endSession()

            console.error("An error occurred:", error)
            return NextResponse.json("An error occurred while processing your request.", { status: 500 })
        }
    } catch (error) {
        console.error("An error occurred:", error)
        return NextResponse.json("An error occurred while processing your request.", { status: 500 })
    }
}





