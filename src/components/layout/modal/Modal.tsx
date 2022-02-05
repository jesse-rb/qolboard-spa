import { ReactNode } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import './Modal.css';

function Modal(props: { children: ReactNode }) {
    const { open } = useSelector((state: RootState) => state.modalRegisterOpen)
    return (
        <div className={ !open ? 'modal-background' : 'modal-background open' }>
            <div className= { !open ? 'modal' : 'modal open' }>
                { props.children }
            </div>
        </div>
    );
}

export default Modal