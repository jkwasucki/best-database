import {createSlice} from '@reduxjs/toolkit'


//This slice saves reference to all the data needed for while inside a collection.

const initialState = {
    collection:{
        collectionId:"" as string,
        owner: {
            isOwner:false,
            user:{} as dbUser | null
        },
        accessData: {} as accessData,
        partyData: {} as partyData
    }
}

export const collectionSlice = createSlice({
    name:"collection",
    initialState,
    reducers:{
        updateCollectionId: (state, action) => {
            state.collection.collectionId = action.payload.collectionId;
        },
        updateOwner: (state, action) => {
            state.collection.owner = action.payload.owner;
        },
        updateAccessData: (state, action) => {
            state.collection.accessData = action.payload.accessData;
        },
        updatePartyData: (state, action) => {
            state.collection.partyData = action.payload.partyData;
        },
        clearCollectionData: (state, action) => {
            state.collection =  {
                collectionId:"" as string,
                owner: {
                    isOwner:false,
                    user:{} as dbUser | null
                },
                accessData: {} as accessData,
                partyData: {} as partyData
            }
        },
    }
})

export const {updateCollectionId,updateOwner,updateAccessData,updatePartyData,clearCollectionData} = collectionSlice.actions
export default collectionSlice.reducer