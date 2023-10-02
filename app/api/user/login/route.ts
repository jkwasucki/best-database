import UserModel from '@/models/User';
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'
import { connectMongo } from '@/lib/connectMongo';

connectMongo()

export async function POST(request:Request) {
    try{
        const {email,password} = await request.json()
    
        if(!email || !password){
            return NextResponse.json("Provide both email and password.",{status:404})
        }
        //check if user exists
        const user = await UserModel.findOne({email})
        if(!user){
            return NextResponse.json("User not found.",{status:409})
        }

        //validate password
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return NextResponse.json("Invalid password.",{status:400})
        }

        //create cookie data        
        const tokenData = {
            _id:user._id,
            password:user.password
        }
    
        //encrypt cookie
        const token =  jwt.sign(tokenData,process.env.JWT!,{expiresIn:'1d',algorithm: 'HS512'})

        const response = NextResponse.json(user)
        
        //set cookie
        response.cookies.set("token",token)

        return response
        
    }catch(error){
        return NextResponse.json(error,{status:500})
    }
    
}
