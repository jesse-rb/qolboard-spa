import { ReactNode, useEffect, useState } from 'react'
import Button from '../button/Button';
import './Modal.css';

function Modal(props: {open: ReactNode, children: ReactNode}) {
    useEffect(() => {
        window.removeEventListener('click', handleOpen);
    });
    const [ open, setOpen ] = useState(false);
    const [ attention, setAttention ] = useState(false);
    const handleOpen = () => setOpen(true);
    let toRender;

    toRender = (
        <>
        <div className='nothing' onClick={ () => setOpen(true) }>{ props.open }</div>
        <div className={ `modal-background ${ !open ? '' : 'open' } `} onClick={ (() => setAttention(true)) }>
            <Button label='Close' callback={ () => setOpen(false) }></Button>
            <div className='wrap-modal'>
                <div className= { 'modal' + (!open ? '' : ' open') + (!attention ? '' : ' animation-attention') } onClick={ ((e) => e.stopPropagation()) } onAnimationEnd={ (() => { setAttention(false) }) }>
                    { props.children }
                </div>
            </div>
        </div>
        </>
    );
    return toRender;
}


export default Modal;
