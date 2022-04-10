import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../store/userSlice'
import modalReducer from '../store/modalSlice'

const store = configureStore({
	reducer: {
		user: userReducer,
		modal: modalReducer
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store