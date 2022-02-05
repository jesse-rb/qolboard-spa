import { ReactNode, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { close } from "../../../store/modalSlice"
import './Modal.css';

function Modal(props: { children: ReactNode }) {
    const { open } = useSelector((state: RootState) => state.modalRegisterOpen);
    const dispatch = useDispatch();
    const [ attention, setAttention ] = useState(false);
    if (!open) {
        return <></>;
    }
    return (
        <div className={ `modal-background ${ !open ? '' : 'open' } `} onClick={ (() => setAttention(true)) }>
            <button className='button' onClick={ () => { dispatch(close()); } }>close</button>
            <div className='wrap-modal'>
            <div className= { 'modal' + (!open ? '' : ' open') + (!attention ? '' : ' animation-attention') } onClick={ ((e) => e.stopPropagation()) } onAnimationEnd={ (() => { setAttention(false) }) }>
                { props.children }
            </div>
            </div>
        </div>
    );
}

export default Modal