import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../../../app/store';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../../store/userSlice';
import "./Header.css"
import Register from '../../modals/register/Register';
import Modal from '../../modal/Modal';

function Header() {
    const { loggedIn } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const registerModalOpen = <button className='button'>Register</button>;
    return (
        <div id="header">
            {
                loggedIn
                ? <button className='button material-icons' onClick={ () => dispatch(logout()) }>Logout</button>
                : <button className='button material-icons' onClick={ () => dispatch(login()) }>Login</button>
            }
            {
                loggedIn
                ? ''
                : <Modal open={registerModalOpen}><Register /></Modal>
            }
        </div>
    );
}

export default Header;