import Header from './header/Header'
import Footer from './footer/Footer';
import { ReactNode } from 'react';
import './Layout.css'
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import Modal from './modal/Modal';


function Layout(props: {children: ReactNode}) {
    const { loggedIn } = useSelector( (state: RootState) => state.user );

    return (
        <div id='layout'>
            <Header />
            { props.children }
            <Footer />
        </div>
    );
}

export default Layout;