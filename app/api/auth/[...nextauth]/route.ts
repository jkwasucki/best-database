import NextAuth from "next-auth/next"
import { config } from "@/utils/next-auth"
import { connectMongo } from "@/lib/connectMongo"


connectMongo()

const handler = NextAuth(config)
export { handler as GET, handler as POST }