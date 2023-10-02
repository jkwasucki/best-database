import {createSlice} from '@reduxjs/toolkit'


//This slice saves reference to the file that is previewed in the full-screen

const initialState = {
    file:{
        _id:"" as string,
        name:"" as string,
        firebaseNameRef: "" as string,
        type:"" as string | undefined,
        url:"" as string,
        fullPath:"" as string,
        createdAt:"" as string,
        naturalWidth:"" as string,
        naturalHeight:"" as string
    } as mongoFileRef,

    for: "" as string
    
}

export const fileSlice = createSlice({
    name:"file",
    initialState,
    reducers:{
        referenceFile: (state,action)=> {
            state.file = action.payload.file
            state.for = action.payload.for
        },
        setName: (state,action) => {
            state.file.name = action.payload.name
        }
    }
})

export const {referenceFile,setName} = fileSlice.actions
export default fileSlice.reducer