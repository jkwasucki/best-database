import { connectMongo } from "@/lib/connectMongo"
import Authentication from "./components/Authentication/Authentication"

export default function Home() {
  connectMongo()

    return (
        <main className="w-full h-full sm:w-screen sm:h-screen py-8 flex flex-col items-center justify-center ">
            <Authentication/>
        </main>
    )
}
