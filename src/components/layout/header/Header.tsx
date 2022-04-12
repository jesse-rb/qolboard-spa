import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../../../app/store';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../../store/userSlice';
import "./Header.css"
import Register from '../../modals/register/Register';
import Modal from '../../modal/Modal';
import Button from '../../button/Button';

function Header() {
    const { loggedIn } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const registerModalOpen = <Button label='Register' callback={ () => '' } />;
    return (
        <div id="header">
            {
                loggedIn
                ? <Button label='Logout' callback={ () => dispatch(logout()) } />
                : <Button label='Login' callback={ () => dispatch(login()) } />
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