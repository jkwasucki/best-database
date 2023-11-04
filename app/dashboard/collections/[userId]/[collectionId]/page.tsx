
import Upload from "@/app/components/Mains/Upload"
import FileList from "../../../../components/Modals/FileList"
import ColSettings from "../../../../components/Modals/ColSettings"
import { getCollection, getCollections, getFiles } from "@/utils/handlers"
import Party from "@/app/components/UtilCompnts/Party"

type Params = {
  params: {
    userId:string,
    collectionId:string
  }
}



export default async function Collection({params:{userId,collectionId}}:Params) {
   
    const collectionData = await getCollection(userId,collectionId)
    const collectionsData = await getCollections(userId)
    const filesData = await getFiles(userId,collectionId)

  return (
    <div
      className='h-[590px] w-[calc(100vw-10px)] bg-white rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:h-[calc(100vh-100px)] shadow-sm flex flex-col px-5 py-5 gap-6'
    >
        <Party
            collection={collectionData.data}
        />
        <Upload 
            collections={collectionsData.data}
        />
        <ColSettings 
            collection={collectionData.data} 
        />
        <FileList 
            files={filesData.data}
        />       
    </div>
  )
}




