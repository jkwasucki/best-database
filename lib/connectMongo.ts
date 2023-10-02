import mongoose from 'mongoose'

const MONGO_URI: string | undefined = process.env.MONGODB_URI

export async function connectMongo(){
  if(MONGO_URI){
    try{
      await mongoose.connect(MONGO_URI).then(()=>{
        console.log("Mongodb connected")
      })
    }catch(err){
      console.log("Please provide mongodb connection string in .env file")
    }
  }
}