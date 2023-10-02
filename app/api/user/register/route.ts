import UserModel from "@/models/User"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt";
import uuid from 'uuid-random';
import { connectMongo } from "@/lib/connectMongo";


connectMongo()
//User creation VIA REGISTRATION, NOT GOOGLE AUTHENTICATION!
//For google user creation, go api/auth/[...nextauth].
export async function POST(request:Request){
    const {email,password}:User = await request.json()

    try {
        if(!email || !password){
            return NextResponse.json("Email and password are both required.",{status:400})
        }
        if(typeof email !== 'string' || typeof password !== 'string'){
            return NextResponse.json("Email and password must be a string.")
        }
        
        //check if user exists
        const user = await UserModel.findOne({email})
        if(user){
            return NextResponse.json("User already exists.",{status:409})
        }
    
        //hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        UserModel.create({
            email:email,
            collections:[],
            password:hashedPassword,
            tag:Math.floor(10000 + Math.random() * 90000),
            avatarHash:uuid(),
            notifications:{
                muted:[],
                array:[]
              }
        })
        return NextResponse.json("User created",{status:200})
    } catch (error) {
        return NextResponse.json(error,{status:500})
    }
}