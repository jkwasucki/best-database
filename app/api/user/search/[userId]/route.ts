import { connectMongo } from '@/lib/connectMongo'
import UserModel from '@/models/User'
import { NextResponse } from 'next/server'
import React from 'react'


type Params = {
    params:{
        userId:string
    }
}

connectMongo()

export async function GET(request:Request,{params:{userId}}:Params ) {
    
  try {
    const url = new URL(request.url)
    const phrase = url.searchParams.get("phrase")?.toLowerCase()
    
    const user = await UserModel.findById(userId)

    let results:mongoFileRef[] = []
    user.collections.map((col:collection)=>{
        col.files.map(file=>{
            if(file.name.includes(phrase)){
                results.push(file)
            }
        })
    })
    
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(error)
  }
}
