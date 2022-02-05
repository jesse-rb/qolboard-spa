import { createSlice } from '@reduxjs/toolkit'

interface user {
    loggedIn: boolean
}

const initialUserState: user = {
    loggedIn: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        login: (state) => {
            state.loggedIn = true
        },
        logout: (state) => {
            state.loggedIn = false
        }
    },
})

export const { login, logout } = userSlice.actions
export default userSlice.reducer