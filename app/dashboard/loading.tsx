import LoaderSVG from "@/app/dashboard/components/svgs/LoaderSVG";

export default function Loading() {
    
    return (
        <div className="px-2 h-[590px] bg-white w-[calc(100vw-10px)] rounded-[15px] sm:max-w-[calc(100vw-450px)] sm:w-[calc(100vw-230px)] sm:min-w-[700px] sm:p-5  sm:h-[calc(100vh-100px)] shadow-sm flex flex-col gap-6">
            <LoaderSVG size={150}/>
        </div>
    
    )
  }