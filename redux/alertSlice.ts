import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    alert:{
        type:'',
        text:''
    }
}

export const alertSlice = createSlice({
    name:"alert",
    initialState,
    reducers:{
        createAlert: (state,action) => {
            const { type, text } = action.payload;
            state.alert = { type, text };
        },
        clearAlert: (state,action) => {
            state.alert.type = ""
            state.alert.text = ""
        }
    }
})

export const {createAlert, clearAlert} = alertSlice.actions
export default alertSlice.reducer