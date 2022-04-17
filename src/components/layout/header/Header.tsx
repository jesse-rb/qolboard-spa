import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../../../app/store';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../../store/userSlice';
import "./Header.css"
import Register from '../../modals/register/Register';
import Modal from '../../modal/Modal';
import Button from '../../button/Button';
import Login from '../../modals/login/Login';

function Header() {
    const { loggedIn } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    return (
        <div id="header">
            {
                loggedIn
                ? <Button label='Logout' callback={ () => dispatch(logout()) } />
                : <Modal open={ <Button label='Login' callback={ () => '' } /> }><Login /></Modal>
            }
            {
                loggedIn
                ? ''
                : <Modal open={ <Button label='Register' callback={ () => '' } />}><Register /></Modal>
            }
        </div>
    );
}

export default Header;