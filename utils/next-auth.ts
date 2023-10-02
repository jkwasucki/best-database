
import { NextAuthOptions } from "next-auth"
import GoogleProvider from 'next-auth/providers/google'
import UserModel from "@/models/User";
import uuid from 'uuid-random';



export const config:NextAuthOptions = {
    providers: [
        GoogleProvider({
          clientId:process.env.GOOGLE_ID??"",
          clientSecret:process.env.GOOGLE_SECRET??"",
          httpOptions: {
            timeout: 40000,
          },
        })
      ],
      secret:process.env.NEXTAUTH_SECRET,
      callbacks:{
        //  assign id and tag of a user to session 
        async session({ session}){
          if (session?.user) {
            const userFromDb = await UserModel.findOne({email:session.user.email})
            session.user = userFromDb
          }
          return session;
        },
        async signIn({ profile }) {
          const userExists = await UserModel.findOne({email:profile!.email})
          if(!userExists){
            try{
              await UserModel.create({
                email:profile!.email,
                collections:[],
                password:"Not included",
                tag:Math.floor(10000 + Math.random() * 90000),
                avatarHash:uuid(),
                notifications:{
                  muted:[],
                  array:[]
                },
    
              })
            }catch(error){
              console.log(error)
            }
            
          }
          return true
        }
      },
      
}