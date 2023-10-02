import UserModel from '@/models/User'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'


type Params = {
    params:{
        userId:string
    }
}

//Create collection.
export async function POST(request:Request,{params:{userId}}:Params) {
    const {collection} = await request.json()
   try {
    const user = await UserModel.findById(userId); 

    //If collections exists, return error.  
    const collectionExists = user.collections.some((existingCollection:collection) => existingCollection.name === collection);

    if (collectionExists) {
        return NextResponse.json({ error: 'Collection with the same name already exists' }, { status: 400 });
    }
    //If collection does not exist, proceed.
    user.collections.push({
        name:collection,
        owner:new ObjectId(user._id),
        acces:[],
        _id: new ObjectId(),
        files:[]
    });

    const newCollection = await user.save();
    
    return NextResponse.json(newCollection)
   } catch (error) {
    return NextResponse.json(error)
   }
}

//Get all collections.
export async function GET(request:Request,{params:{userId}}:Params){

    try {
        const user = await UserModel.findById(userId)
        
        return NextResponse.json(user.collections)
    } catch (error) {
        return NextResponse.json(error)
    }
}



