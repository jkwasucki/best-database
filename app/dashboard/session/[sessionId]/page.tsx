
import { getCollections } from '@/utils/handlers';
import FilePrevs from '@/app/components/UtilCompnts/FilePrevs';
import { getAllFiles } from '@/utils/handlers';
import Upload from '../../../components/Mains/Upload';
import CollectionTab from '../../../components/Mains/CollectionTab';

type Params = {
    params:{
        sessionId:string
    }
}

export default async function Dashboard({params:{sessionId}}:Params) {
    
    const collectionsData = await getCollections(sessionId)
    const filePrevData = await getAllFiles(sessionId)

    return (
        <>
           <div
                className='px-2 h-[590px] bg-white w-[calc(100vw-10px)] rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:p-5  sm:h-[calc(100vh-100px)] shadow-sm flex flex-col gap-6'
            >
                <div className='relative pt-2'>
                    <Upload 
                        collections={collectionsData.data}
                    />
                </div>
                <p className='text-[15px]'>Recent files</p>
                <div className='sm:min-h-[180px] h-full sm:max-h-[180px] flex gap-4 overflow-x-auto overflow-y-hidden'>   
                    <FilePrevs
                        files={filePrevData.data}
                    />
                </div>
                <CollectionTab 
                    collections={collectionsData.data}
                />
          </div>
        </>
    );
}