import LoaderSVG from "@/app/dashboard/components/svgs/LoaderSVG";

export default function Loading() {
    
    return (
        <div className="h-[590px] w-[calc(100vw-10px)] bg-white rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:h-[calc(100vh-100px)] shadow-sm flex flex-col px-5 py-5 gap-6">
            <LoaderSVG size={150}/>
        </div>
    
    )
  }