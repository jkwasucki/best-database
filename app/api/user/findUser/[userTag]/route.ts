import UserModel from '@/models/User'
import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/connectMongo';

type Params = {
  params:{
    userTag:string
  }
}


connectMongo() 

export async function GET(request: Request, { params: { userTag } }: Params) {
  try {
    const user = await UserModel.findOne({ "tag": userTag });

    if (user) {
      // If a user is found, return the user object as JSON response
      return NextResponse.json(user);
    } else {
      // If no user is found, you might want to return a meaningful error response
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    // Handle errors by returning an error response with the error message
    return NextResponse.json(error);
  }
}




