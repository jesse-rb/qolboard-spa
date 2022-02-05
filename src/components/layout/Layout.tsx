import Header from './header/Header'
import Footer from './footer/Footer';
import { ReactNode } from 'react';
import './Layout.css'
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import Modal from './modal/Modal';
import Register from '../register/Register';


function Layout(props: {children: ReactNode}) {
    const { loggedIn } = useSelector( (state: RootState) => state.user );
    const modalRegisterOpen = useSelector((state: RootState) => state.modalRegisterOpen);

    return (
        <div id='layout'>
            <Header />
            {
                loggedIn
                ? false
                :   modalRegisterOpen.open
                    ? <Modal><Register /></Modal>
                    : false
            }
            { props.children }
            <Footer />
        </div>
    );
}

export default Layout;