import {createSlice} from '@reduxjs/toolkit'


//This slice saves reference to all the data needed for while inside a collection.

const initialState = {
    user:{
        collections:[],
        createdAt:"",
        email:"",
        password:"",
        tag:0,
        updatedAt:"",
        __v:0,
        _id:"",
        avatarHash:""
    } 
}

export const userSlice = createSlice({
    name:"collection",
    initialState,
    reducers:{
       createSession: (state,action) => {
         state.user = action.payload
       },
       removeSession: (state,action) =>{
        state.user = initialState.user
        localStorage.removeItem("token");
        localStorage.removeItem("next-auth.session-token");
       }
    }
})

export const {createSession,removeSession} = userSlice.actions
export default userSlice.reducer