import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RootState } from '../../../app/store'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout } from "../../../store/userSlice"
import { open, close, toggle } from "../../../store/modalSlice"
import "./Header.css"

function Header() {
    const { loggedIn } = useSelector((state: RootState) => state.user)
    const dispatch = useDispatch()
    return (
        <div id="header">
            {
                loggedIn
                ? <button className='button material-icons' onClick={ () => dispatch(logout()) }>Logout</button>
                : <button className='button material-icons' onClick={ () => dispatch(login()) }>Login</button>
            }
            {
                loggedIn
                ? false
                : <button className='button' onClick={ () => dispatch(toggle()) }>Register</button>
            }
        </div>
    );
}

export default Header;