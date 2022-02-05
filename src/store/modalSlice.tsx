import { createSlice } from "@reduxjs/toolkit"
import exp from "constants"

interface modal {
    open: boolean
}

const initialModalState: modal = {
    open: false
}

export const modalSlice = createSlice({
    name: 'user',
    initialState: initialModalState,
    reducers: {
        open: (state) => {
            state.open = true
        },
        close: (state) => {
            state.open = false
        },
        toggle: (state) => {
            state.open = !state.open
        }
    }
});

export const { open, close, toggle } = modalSlice.actions;
export default modalSlice.reducer;